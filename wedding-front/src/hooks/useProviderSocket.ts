/**
 * Hook pour gérer les connexions WebSocket pour les ProviderMessages
 * Remplace tous les refresh/polling par une communication en temps réel
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { ProviderMessage } from '@/lib/api/providerConversations';
import { useAuth } from './useAuth';

interface UseProviderSocketProps {
  conversationId: string | null;
  enabled?: boolean;
}

interface ProviderSocketEvents {
  onNewMessage?: (message: ProviderMessage, conversationId: string) => void;
  onMessagesRead?: (data: { userId: string; conversationId: string }) => void;
  onUserTyping?: (data: { userId: string; conversationId: string; isTyping: boolean }) => void;
  onConversationUpdated?: (data: { conversationId: string; lastMessage: ProviderMessage }) => void;
  onError?: (error: { message: string }) => void;
}

// SINGLETON : Socket partagé entre toutes les instances
let globalSocket: Socket | null = null;
let globalEventsRef: ProviderSocketEvents = {};
let globalConnected = false;
let socketInitialized = false;

// Dédupliquer les messages reçus (évite les doublons quand le message arrive via plusieurs rooms)
const receivedMessageIds = new Set<string>();
const MESSAGE_DEDUP_TIMEOUT = 1000; // Nettoyer les IDs après 1 seconde

// Liste de callbacks pour permettre plusieurs enregistrements
interface CallbackList {
  onNewMessage: Array<(message: ProviderMessage, conversationId: string) => void>;
  onConversationUpdated: Array<(data: { conversationId: string; lastMessage: ProviderMessage }) => void>;
  onUserTyping: Array<(data: { userId: string; conversationId: string; isTyping: boolean }) => void>;
  onMessagesRead: Array<(data: { userId: string; conversationId: string }) => void>;
  onError: Array<(error: { message: string }) => void>;
}

let callbacksList: CallbackList = {
  onNewMessage: [],
  onConversationUpdated: [],
  onUserTyping: [],
  onMessagesRead: [],
  onError: []
};

export const useProviderSocket = ({ conversationId, enabled = true }: UseProviderSocketProps) => {
  const { user, token } = useAuth();
  const [connected, setConnected] = useState(globalConnected);
  const [connecting, setConnecting] = useState(false);
  const localEventsRef = useRef<ProviderSocketEvents>({});

  // Initialiser la connexion WebSocket UNE SEULE FOIS (singleton)
  useEffect(() => {
    console.log('🔍 [useProviderSocket] useEffect déclenché:', { enabled, hasToken: !!token, hasUser: !!user, socketInitialized, hasGlobalSocket: !!globalSocket, globalConnected });
    
    if (!enabled || !token) {
      console.log('⚠️ [useProviderSocket] Socket non initialisé:', { enabled, hasToken: !!token });
      return;
    }

    // Si le socket global existe déjà et est connecté, l'utiliser
    if (globalSocket && globalSocket.connected) {
      console.log('🔌 [useProviderSocket] Réutilisation du socket existant:', globalSocket.id);
      setConnected(true);
      globalConnected = true;
      return;
    }

    // Si le socket existe mais n'est pas connecté, attendre la connexion
    if (globalSocket && !globalSocket.connected) {
      console.log('⏳ [useProviderSocket] Socket existe mais pas connecté, attente de la connexion...');
      const checkConnection = () => {
        if (globalSocket?.connected) {
          console.log('✅ [useProviderSocket] Socket maintenant connecté:', globalSocket.id);
          setConnected(true);
          globalConnected = true;
        }
      };
      globalSocket.once('connect', checkConnection);
      return;
    }

    // Sinon, créer un nouveau socket
    if (!socketInitialized) {
      socketInitialized = true;
      setConnecting(true);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
      console.log(`🔌 [useProviderSocket] Création du socket singleton à: ${apiUrl}`);
      
      globalSocket = io(apiUrl, {
        auth: { token: token },
        transports: ['websocket', 'polling'],
        forceNew: false,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: Infinity,
        timeout: 20000,
        autoConnect: true
      });

      globalSocket.on('connect', () => {
        console.log('🔌 [useProviderSocket] Socket singleton connecté, socketId:', globalSocket?.id);
        globalConnected = true;
        setConnected(true);
        setConnecting(false);
        
        // Vérifier si on doit rejoindre une conversation immédiatement après connexion
        if (conversationId) {
          console.log('🔌 [useProviderSocket] Rejoindre la conversation après connexion:', conversationId);
          globalSocket?.emit('join_provider_conversation', { conversationId });
        }
      });

      globalSocket.on('disconnect', (reason) => {
        console.log('🔌 [useProviderSocket] Socket singleton déconnecté:', reason);
        globalConnected = false;
        setConnected(false);
        setConnecting(false);
      });

      globalSocket.on('connect_error', (error) => {
        console.error('❌ [useProviderSocket] Erreur de connexion Socket singleton:', error);
        globalConnected = false;
        setConnected(false);
        setConnecting(false);
        globalEventsRef.onError?.({ message: 'Erreur de connexion' });
      });

      // Événements ProviderMessages - Listener UNIQUE partagé avec déduplication
      globalSocket.on('new_provider_message', (data: { message: ProviderMessage; conversationId: string }) => {
        const messageId = data.message.id;
        
        // Dédupliquer : si le message a déjà été reçu récemment, l'ignorer
        if (receivedMessageIds.has(messageId)) {
          console.log('🔄 [WebSocket] Message déjà reçu (déduplication):', messageId);
          return;
        }
        
        // Marquer le message comme reçu
        receivedMessageIds.add(messageId);
        
        // Nettoyer l'ID après un délai pour éviter une fuite mémoire
        setTimeout(() => {
          receivedMessageIds.delete(messageId);
        }, MESSAGE_DEDUP_TIMEOUT);
        
        console.log('📨 [WebSocket] Message reçu côté frontend (singleton):', {
          conversationId: data.conversationId,
          messageId: data.message.id,
          content: data.message.content.substring(0, 50),
          callbacksCount: callbacksList.onNewMessage.length,
          socketConnected: globalSocket?.connected,
          socketId: globalSocket?.id
        });
        
        // Appeler TOUS les callbacks enregistrés
        callbacksList.onNewMessage.forEach((callback, index) => {
          console.log(`✅ [WebSocket] Appel du callback onNewMessage #${index} avec conversationId:`, data.conversationId);
          try {
            callback(data.message, data.conversationId);
          } catch (error) {
            console.error(`❌ [WebSocket] Erreur lors de l'appel du callback onNewMessage #${index}:`, error);
          }
        });
        
        if (callbacksList.onNewMessage.length === 0) {
          console.warn('⚠️ [WebSocket] Aucun callback onNewMessage enregistré');
        }
      });

      globalSocket.on('provider_user_typing', (data: { userId: string; conversationId: string; isTyping: boolean }) => {
        callbacksList.onUserTyping.forEach(callback => callback(data));
      });

      globalSocket.on('provider_messages_read', (data: { userId: string; conversationId: string }) => {
        callbacksList.onMessagesRead.forEach(callback => callback(data));
      });

      globalSocket.on('provider_conversation_updated', (data: { conversationId: string; lastMessage: ProviderMessage }) => {
        callbacksList.onConversationUpdated.forEach(callback => callback(data));
      });

      globalSocket.on('error', (error) => {
        console.error('❌ [useProviderSocket] Erreur générique WebSocket:', error);
        callbacksList.onError.forEach(callback => callback(error));
      });
    }

    return () => {
      // Ne pas déconnecter le socket global ici - il sera nettoyé quand le composant racine se démonte
      console.log('🧹 [useProviderSocket] Cleanup useEffect (socket global conservé)');
    };
  }, [token, enabled]);

  // Rejoindre/quitter la conversation quand conversationId change
  useEffect(() => {
    if (!conversationId) return;
    
    let cleanup: (() => void) | undefined;
    let timeoutId: NodeJS.Timeout | undefined;
    
    // Attendre que le socket soit créé et connecté
    const joinConversation = () => {
      if (!globalSocket) {
        console.log('⏳ [useProviderSocket] Socket non encore créé, nouvelle tentative dans 100ms...');
        timeoutId = setTimeout(joinConversation, 100);
        return;
      }
      
      if (!globalSocket.connected) {
        console.log('⏳ [useProviderSocket] Socket créé mais pas encore connecté, attente de la connexion...');
        const onConnect = () => {
          console.log('✅ [useProviderSocket] Socket maintenant connecté, rejoindre la conversation:', conversationId);
          if (globalSocket) {
            globalSocket.emit('join_provider_conversation', { conversationId });
            
            // Écouter la confirmation
            const handleJoined = (data: { conversationId: string }) => {
              if (data.conversationId === conversationId) {
                console.log('✅ [WebSocket] Conversation rejointe avec succès:', conversationId);
              }
            };
            globalSocket.on('joined_provider_conversation', handleJoined);
            
            cleanup = () => {
              if (globalSocket && conversationId) {
                console.log('🔌 [WebSocket] Quitter la conversation Provider:', conversationId);
                globalSocket.emit('leave_provider_conversation', { conversationId });
                globalSocket.off('joined_provider_conversation', handleJoined);
              }
            };
          }
        };
        globalSocket.once('connect', onConnect);
        return;
      }
      
      console.log('🔌 [WebSocket] Rejoindre la conversation Provider:', conversationId, 'socketId:', globalSocket.id);
      globalSocket.emit('join_provider_conversation', { conversationId });
      
      // Écouter la confirmation
      const handleJoined = (data: { conversationId: string }) => {
        if (data.conversationId === conversationId) {
          console.log('✅ [WebSocket] Conversation rejointe avec succès:', conversationId);
        }
      };
      globalSocket.on('joined_provider_conversation', handleJoined);
      
      cleanup = () => {
        if (globalSocket && conversationId) {
          console.log('🔌 [WebSocket] Quitter la conversation Provider:', conversationId);
          globalSocket.emit('leave_provider_conversation', { conversationId });
          globalSocket.off('joined_provider_conversation', handleJoined);
        }
      };
    };
    
    joinConversation();
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (cleanup) cleanup();
    };
  }, [conversationId]);

  // Méthodes pour interagir avec le socket
  const sendMessage = useCallback((conversationId: string, content: string, messageType = 'TEXT') => {
    if (!globalSocket || !connected) {
      console.warn('WebSocket non connecté, message sera envoyé via REST uniquement');
      return;
    }
    globalSocket.emit('send_provider_message', {
      conversationId,
      content,
      messageType
    });
  }, [connected]);

  const startTyping = useCallback((conversationId: string) => {
    globalSocket?.emit('provider_typing_start', { conversationId });
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    globalSocket?.emit('provider_typing_stop', { conversationId });
  }, []);

  const markAsRead = useCallback((conversationId: string) => {
    globalSocket?.emit('mark_provider_messages_as_read', { conversationId });
  }, []);

  // Méthode pour enregistrer les événements - AJOUTER AUX LISTES GLOBALES
  const on = useCallback((events: ProviderSocketEvents) => {
    console.log('🎧 [useProviderSocket] Enregistrement des événements (singleton):', {
      hasOnNewMessage: !!events.onNewMessage,
      hasOnConversationUpdated: !!events.onConversationUpdated,
      conversationId
    });
    
    // Mettre à jour les références locales
    localEventsRef.current = { ...localEventsRef.current, ...events };
    
    // Ajouter les callbacks aux listes globales (pas remplacer, mais ajouter) - éviter les doublons
    if (events.onNewMessage) {
      // Vérifier si le callback existe déjà avant de l'ajouter
      if (!callbacksList.onNewMessage.includes(events.onNewMessage)) {
        callbacksList.onNewMessage.push(events.onNewMessage);
      } else {
        console.log('⚠️ [useProviderSocket] Callback onNewMessage déjà enregistré, ignoré');
      }
    }
    if (events.onConversationUpdated) {
      if (!callbacksList.onConversationUpdated.includes(events.onConversationUpdated)) {
        callbacksList.onConversationUpdated.push(events.onConversationUpdated);
      }
    }
    if (events.onUserTyping) {
      if (!callbacksList.onUserTyping.includes(events.onUserTyping)) {
        callbacksList.onUserTyping.push(events.onUserTyping);
      }
    }
    if (events.onMessagesRead) {
      if (!callbacksList.onMessagesRead.includes(events.onMessagesRead)) {
        callbacksList.onMessagesRead.push(events.onMessagesRead);
      }
    }
    if (events.onError) {
      if (!callbacksList.onError.includes(events.onError)) {
        callbacksList.onError.push(events.onError);
      }
    }
    
    console.log('✅ [useProviderSocket] Callbacks enregistrés, totaux:', {
      onNewMessage: callbacksList.onNewMessage.length,
      onConversationUpdated: callbacksList.onConversationUpdated.length
    });
    
    // Retourner une fonction de nettoyage pour retirer les callbacks quand le composant se démonte
    return () => {
      if (events.onNewMessage) {
        const index = callbacksList.onNewMessage.indexOf(events.onNewMessage);
        if (index > -1) callbacksList.onNewMessage.splice(index, 1);
      }
      if (events.onConversationUpdated) {
        const index = callbacksList.onConversationUpdated.indexOf(events.onConversationUpdated);
        if (index > -1) callbacksList.onConversationUpdated.splice(index, 1);
      }
      if (events.onUserTyping) {
        const index = callbacksList.onUserTyping.indexOf(events.onUserTyping);
        if (index > -1) callbacksList.onUserTyping.splice(index, 1);
      }
      if (events.onMessagesRead) {
        const index = callbacksList.onMessagesRead.indexOf(events.onMessagesRead);
        if (index > -1) callbacksList.onMessagesRead.splice(index, 1);
      }
      if (events.onError) {
        const index = callbacksList.onError.indexOf(events.onError);
        if (index > -1) callbacksList.onError.splice(index, 1);
      }
    };
  }, [conversationId]);

  return {
    connected,
    connecting,
    joinConversation: (id: string) => globalSocket?.emit('join_provider_conversation', { conversationId: id }),
    leaveConversation: (id: string) => globalSocket?.emit('leave_provider_conversation', { conversationId: id }),
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    on
  };
};
