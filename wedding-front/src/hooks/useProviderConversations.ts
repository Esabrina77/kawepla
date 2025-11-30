import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ProviderConversation,
  ProviderMessage,
  CreateProviderConversationDto,
  SendMessageDto,
  MessagesResponse,
  BookingInfo,
  getOrCreateProviderConversation as apiGetOrCreateConversation,
  getClientConversations as apiGetClientConversations,
  getProviderConversations as apiGetProviderConversations,
  getConversationById as apiGetConversationById,
  getConversationMessages as apiGetConversationMessages,
  sendProviderMessage as apiSendMessage,
  markConversationAsRead as apiMarkAsRead,
  extractBookingInfo as apiExtractBookingInfo
} from '@/lib/api/providerConversations';
import { useProviderSocket } from './useProviderSocket';

export function useProviderConversations(userRole: 'HOST' | 'PROVIDER') {
  const [conversations, setConversations] = useState<ProviderConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // WebSocket pour mettre à jour la liste des conversations en temps réel
  const { on: socketOn } = useProviderSocket({ conversationId: null, enabled: true });

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = userRole === 'HOST'
        ? await apiGetClientConversations()
        : await apiGetProviderConversations();
      setConversations(data || []);
    } catch (err) {
      console.error('[useProviderConversations] Erreur lors du chargement des conversations:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  // Charger les conversations UNE SEULE FOIS au montage - AUCUN refresh automatique
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Écouter les mises à jour de conversations via WebSocket (ZÉRO refresh)
  useEffect(() => {
    socketOn({
      onConversationUpdated: (data: { conversationId: string; lastMessage: ProviderMessage }) => {
        // Mettre à jour la conversation dans la liste sans refresh
        setConversations(prev => {
          const index = prev.findIndex(c => c.id === data.conversationId);
          if (index === -1) {
            // Nouvelle conversation, rafraîchir la liste une seule fois
            fetchConversations();
            return prev;
          }
          // Mettre à jour la conversation existante avec le nouveau message
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            lastMessageAt: data.lastMessage.createdAt, // Garder le format string
            messages: [data.lastMessage]
          };
          // Trier par lastMessageAt (plus récent en premier) - comme WhatsApp
          return updated.sort((a, b) => 
            new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
          );
        });
      }
    });
  }, [socketOn, fetchConversations]);

  const getOrCreateConversation = useCallback(async (
    data: CreateProviderConversationDto
  ): Promise<ProviderConversation> => {
    try {
      const conversation = await apiGetOrCreateConversation(data);
      await fetchConversations(); // Rafraîchir la liste
      return conversation;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la création de la conversation');
    }
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
    getOrCreateConversation
  };
}

export function useProviderConversation(conversationId: string | null) {
  const [conversation, setConversation] = useState<ProviderConversation | null>(null);
  const [messages, setMessages] = useState<ProviderMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  // Cache pour éviter les re-renders inutiles - hash des messages
  const messagesCacheRef = useRef<string>('');
  const hasConversationRef = useRef(false);
  const processedMessagesRef = useRef<Set<string>>(new Set());
  const addingInUpdaterRef = useRef<Set<string>>(new Set()); // Messages en cours d'ajout dans la fonction updater (protection contre StrictMode)

  // WebSocket pour la communication en temps réel (ZÉRO refresh)
  const { connected, sendMessage: socketSendMessage, markAsRead: socketMarkAsRead, on: socketOn } = useProviderSocket({
    conversationId,
    enabled: !!conversationId
  });

  const fetchConversation = useCallback(async () => {
    if (!conversationId) return;
    try {
      if (!hasConversationRef.current) {
        setLoading(true);
      }
      setError(null);
      const data = await apiGetConversationById(conversationId);
      setConversation(prev => {
        if (prev?.id === data?.id && JSON.stringify(prev) === JSON.stringify(data)) {
          return prev;
        }
        hasConversationRef.current = true;
        return data;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la conversation');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const fetchMessages = useCallback(async (pageNum: number = 1, silent: boolean = false) => {
    if (!conversationId) return;
    try {
      const response: MessagesResponse = await apiGetConversationMessages(conversationId, pageNum);
      if (pageNum === 1) {
        // Créer un hash simple des messages pour comparaison rapide
        const messagesHash = response.messages.map(m => `${m.id}:${m.content}:${m.createdAt}:${m.isRead}`).join('|');
        
        let shouldUpdate = true;
        let newMessages: ProviderMessage[] | null = null;
        
        setMessages(prev => {
          // En mode silencieux, comparer strictement pour éviter les re-renders inutiles
          if (silent && prev.length > 0) {
            // Comparer avec le cache d'abord
            if (messagesCacheRef.current === messagesHash) {
              // Aucun changement détecté, ne pas mettre à jour
              shouldUpdate = false;
              return prev;
            }
            
            // Comparer le nombre de messages d'abord
            if (prev.length !== response.messages.length) {
              // Nombre différent, vérifier si seulement de nouveaux messages ont été ajoutés à la fin
              if (response.messages.length > prev.length) {
                const lastPrevId = prev[prev.length - 1]?.id;
                const lastPrevIndex = response.messages.findIndex(m => m.id === lastPrevId);
                
                if (lastPrevIndex >= 0 && lastPrevIndex === prev.length - 1) {
                  // Les messages précédents sont identiques, ajouter seulement les nouveaux
                  const newMessagesToAdd = response.messages.slice(prev.length);
                  messagesCacheRef.current = messagesHash;
                  newMessages = [...prev, ...newMessagesToAdd];
                  return newMessages;
                }
              }
              // Si le nombre a changé mais pas de merge possible, mettre à jour
              messagesCacheRef.current = messagesHash;
              newMessages = response.messages;
              return newMessages;
            }
            
            // Même nombre de messages, comparer en profondeur
            let hasChange = false;
            let onlyReadChanged = true;
            
            for (let i = 0; i < prev.length; i++) {
              const prevMsg = prev[i];
              const newMsg = response.messages[i];
              
              // Comparer les propriétés critiques
              if (prevMsg.id !== newMsg.id || 
                  prevMsg.content !== newMsg.content ||
                  prevMsg.createdAt !== newMsg.createdAt ||
                  prevMsg.messageType !== newMsg.messageType ||
                  prevMsg.senderId !== newMsg.senderId) {
                hasChange = true;
                onlyReadChanged = false;
                break;
              }
              
              // Vérifier si isRead a changé
              if (prevMsg.isRead !== newMsg.isRead) {
                hasChange = true;
                // Continuer à vérifier si c'est le seul changement
              } else {
                onlyReadChanged = false;
              }
              
              // Comparer le sender si présent
              if (prevMsg.sender?.id !== newMsg.sender?.id) {
                hasChange = true;
                onlyReadChanged = false;
                break;
              }
            }
            
            // Si aucun changement, retourner la référence précédente (CRITIQUE pour éviter le re-render)
            if (!hasChange) {
              shouldUpdate = false;
              messagesCacheRef.current = messagesHash;
              return prev;
            }
            
            // Si seulement isRead a changé, mettre à jour silencieusement
            if (onlyReadChanged) {
              messagesCacheRef.current = messagesHash;
              newMessages = prev.map((p, i) => ({
                ...p,
                isRead: response.messages[i].isRead
              }));
              return newMessages;
            }
          }
          
          // Si on arrive ici, il y a eu un changement significatif, mettre à jour
          messagesCacheRef.current = messagesHash;
          newMessages = response.messages;
          return newMessages;
        });
        
        // Ne mettre à jour hasMore et page QUE si les messages ont changé
        if (shouldUpdate || !silent) {
          setHasMore(response.hasMore);
          setPage(pageNum);
        }
      } else {
        setMessages(prev => [...response.messages, ...prev]);
        setHasMore(response.hasMore);
        setPage(pageNum);
      }
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des messages');
      }
    }
  }, [conversationId]);

  // Utiliser useRef pour éviter les re-renders causés par les dépendances
  const fetchConversationRef = useRef(fetchConversation);
  const fetchMessagesRef = useRef(fetchMessages);
  
  // Mettre à jour les refs quand les fonctions changent
  useEffect(() => {
    fetchConversationRef.current = fetchConversation;
    fetchMessagesRef.current = fetchMessages;
  }, [fetchConversation, fetchMessages]);

  // Charger la conversation et les messages une seule fois au montage
  useEffect(() => {
    if (!conversationId) return;
    
    // Réinitialiser le cache quand la conversation change
    messagesCacheRef.current = '';
    hasConversationRef.current = false;
    fetchConversationRef.current();
    fetchMessagesRef.current(1);
  }, [conversationId]); // SEULEMENT au changement de conversation

  // Callback stable pour éviter les réenregistrements multiples
  const handleNewMessage = useCallback((message: ProviderMessage, messageConversationId: string) => {
    // Filtrer uniquement les messages de la conversation actuelle
    if (messageConversationId !== conversationId) {
      return;
    }
    
    // Déduplication : vérifier si le message a déjà été traité OU est en cours d'ajout
    if (processedMessagesRef.current.has(message.id) || addingInUpdaterRef.current.has(message.id)) {
      return;
    }
    
    // Marquer comme traité ET en cours d'ajout IMMÉDIATEMENT (avant setMessages - synchrone)
    // Cela empêche StrictMode d'appeler handleNewMessage deux fois
    processedMessagesRef.current.add(message.id);
    addingInUpdaterRef.current.add(message.id);
    
    // Nettoyer l'ID après un délai plus long pour couvrir les doubles rendus StrictMode
    setTimeout(() => {
      processedMessagesRef.current.delete(message.id);
      addingInUpdaterRef.current.delete(message.id);
    }, 5000);
    
    
    // Utiliser une fonction updater pure (sans effets secondaires)
    // StrictMode peut appeler cette fonction deux fois avec le même prev
    // Mais le flag addingInUpdaterRef empêche handleNewMessage d'être appelé deux fois
    // Donc cette fonction ne sera appelée qu'une seule fois par message
    setMessages(prev => {
      // Vérification : Le message est déjà dans le state
      // Cette vérification protège contre les cas où le message serait déjà présent
      // (peut arriver si le message arrive via plusieurs sources ou si le state est déjà à jour)
      const alreadyExists = prev.some(m => m.id === message.id);
      if (alreadyExists) {
        // Nettoyer le flag car le message est déjà dans le state
        addingInUpdaterRef.current.delete(message.id);
        return prev;
      }
      
      const newMessages = [...prev, message];
      
      // Retourner le nouveau state avec le message ajouté
      // Le flag addingInUpdaterRef sera nettoyé par le useEffect qui écoute messages
      return newMessages;
    });
  }, [conversationId]);

  // Configurer les événements WebSocket pour recevoir les messages en temps réel
  useEffect(() => {
    if (!conversationId) {
      // Réinitialiser les sets quand la conversation change
      processedMessagesRef.current.clear();
      addingInUpdaterRef.current.clear();
      return;
    }

    
    const cleanup = socketOn({
      onNewMessage: handleNewMessage,
      onMessagesRead: () => {
        // Mettre à jour le statut isRead sans refresh
        setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
      },
      onError: (error: { message: string }) => {
        console.error('Erreur WebSocket:', error);
        setError(error.message);
      }
    });
    
    // Nettoyer les callbacks quand la conversation change ou le composant se démonte
    return cleanup;
  }, [conversationId, socketOn, handleNewMessage]);

  // Nettoyer le flag addingInUpdaterRef quand les messages changent
  // Cela garantit un nettoyage précis basé sur le state réel plutôt qu'un délai arbitraire
  // IMPORTANT: Ne pas nettoyer immédiatement pour éviter les problèmes avec StrictMode
  useEffect(() => {
    // Utiliser un délai pour éviter de nettoyer trop tôt (StrictMode peut appeler setMessages deux fois)
    const timeoutId = setTimeout(() => {
      // Nettoyer tous les IDs qui sont dans addingInUpdaterRef mais qui sont maintenant dans messages
      const messageIds = new Set(messages.map(m => m.id));
      const cleanedIds: string[] = [];
      addingInUpdaterRef.current.forEach(id => {
        if (messageIds.has(id)) {
          addingInUpdaterRef.current.delete(id);
          cleanedIds.push(id);
        }
      });
      if (cleanedIds.length > 0) {
      }
    }, 100); // Petit délai pour laisser StrictMode terminer
    
    return () => clearTimeout(timeoutId);
  }, [messages]);

  const sendMessage = useCallback(async (data: SendMessageDto): Promise<ProviderMessage> => {
    if (!conversationId) throw new Error('Aucune conversation sélectionnée');
    try {
      // Envoyer UNIQUEMENT via API REST (source de vérité)
      // Le serveur REST crée le message en base ET le diffuse automatiquement via WebSocket
      const message = await apiSendMessage(conversationId, data);
      
      // Optimistic UI : ajouter le message immédiatement (comme WhatsApp/iMessage)
      setMessages(prev => {
        // Vérifier que le message n'existe pas déjà (évite les doublons)
        if (prev.some(m => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });

      // NE PAS envoyer via WebSocket - le serveur REST diffuse déjà automatiquement
      // Le socket ne sert qu'à RECEVOIR les messages en temps réel, pas à les envoyer
      // Cela évite la création de messages en double en base de données
      
      // Le message sera reçu via WebSocket par les autres participants et par nous-mêmes
      // grâce à la diffusion automatique du serveur REST
      return message;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de l\'envoi du message');
    }
  }, [conversationId]);

  const markAsRead = useCallback(async () => {
    if (!conversationId) return;
    try {
      // Marquer via API REST
      await apiMarkAsRead(conversationId);
      
      // Mettre à jour localement (optimistic UI)
      setMessages(prev => {
        const hasUnread = prev.some(m => !m.isRead);
        if (!hasUnread) return prev; // Pas de changement nécessaire
        return prev.map(m => ({ ...m, isRead: true }));
      });

      // Notifier via WebSocket (pour synchroniser avec l'autre participant)
      socketMarkAsRead(conversationId);
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
    }
  }, [conversationId, socketMarkAsRead]);

  const loadMoreMessages = useCallback(() => {
    if (hasMore && !loading) {
      fetchMessages(page + 1);
    }
  }, [hasMore, loading, page, fetchMessages]);

  return {
    conversation,
    messages,
    loading,
    error,
    hasMore,
    sendMessage,
    markAsRead,
    loadMoreMessages,
    refetch: fetchConversation,
    refetchMessages: () => fetchMessages(1, false)
  };
}

export function useBookingInfo(conversationId: string | null) {
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookingInfo = useCallback(async () => {
    if (!conversationId) return;
    try {
      setLoading(true);
      setError(null);
      const info = await apiExtractBookingInfo(conversationId);
      setBookingInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'extraction des informations');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  return {
    bookingInfo,
    loading,
    error,
    fetchBookingInfo
  };
}

