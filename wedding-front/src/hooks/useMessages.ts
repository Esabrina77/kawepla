/**
 * Hook pour gérer les messages et conversations
 */
import { useState, useEffect, useCallback } from 'react';
import { MessagesAPI, Message, Conversation } from '@/lib/api/messages';
import { useSocket } from './useSocket';
import { useAuth } from './useAuth';

export const useMessages = (invitationId?: string) => {
  const { user, token } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const socket = useSocket({ token: token || undefined, enabled: !!token });

  // Charger la conversation initiale
  useEffect(() => {
    if (invitationId && user?.role !== 'ADMIN') {
      loadConversation();
    }
  }, [invitationId, user]);

  // Configurer les événements WebSocket
  useEffect(() => {
    if (!socket.connected) return;

    socket.on({
      onNewMessage: (data) => {
        if (data.conversationId === conversation?.id) {
          setMessages(prev => [...prev, data.message]);
          // Marquer comme lu si c'est notre conversation
          if (data.message.senderId !== user?.id) {
            socket.markAsRead(data.conversationId);
          }
        }
      },
      onUserTyping: (data) => {
        if (data.conversationId === conversation?.id) {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (data.isTyping) {
              newSet.add(data.userId);
            } else {
              newSet.delete(data.userId);
            }
            return newSet;
          });
        }
      },
      onMessagesRead: (data) => {
        if (data.conversationId === conversation?.id) {
          setMessages(prev => prev.map(msg => 
            msg.senderId === user?.id ? { ...msg, isRead: true } : msg
          ));
        }
      },
      onError: (error) => {
        setError(error.message);
      }
    });

    // Rejoindre la conversation si elle existe
    if (conversation?.id) {
      socket.joinConversation(conversation.id);
    }

    return () => {
      if (conversation?.id) {
        socket.leaveConversation(conversation.id);
      }
    };
  }, [socket.connected, conversation?.id, user?.id]);

  const loadConversation = async () => {
    if (!invitationId) return;

    try {
      setLoading(true);
      setError(null);
      
      const conv = await MessagesAPI.getOrCreateConversation(invitationId);
      setConversation(conv);
      
      // Charger les messages
      const messagesData = await MessagesAPI.getMessages(conv.id);
      setMessages(messagesData.messages);
      setHasMore(messagesData.hasMore);
      
    } catch (err) {
      setError('Erreur lors du chargement de la conversation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!conversation?.id || !hasMore || loading) return;

    try {
      setLoading(true);
      const currentPage = Math.floor(messages.length / 50) + 1;
      const messagesData = await MessagesAPI.getMessages(conversation.id, currentPage + 1);
      
      setMessages(prev => [...messagesData.messages, ...prev]);
      setHasMore(messagesData.hasMore);
    } catch (err) {
      setError('Erreur lors du chargement des messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!conversation?.id || !content.trim()) return;

    try {
      // Utiliser WebSocket pour un envoi plus rapide
      socket.sendMessage(conversation.id, content.trim());
      
      // Optionnel: aussi envoyer via API REST pour la persistance
      // await MessagesAPI.sendMessage(conversation.id, content.trim());
    } catch (err) {
      setError('Erreur lors de l\'envoi du message');
      console.error(err);
    }
  };

  const markAsRead = async () => {
    if (!conversation?.id) return;

    try {
      await MessagesAPI.markAsRead(conversation.id);
      socket.markAsRead(conversation.id);
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
    }
  };

  const startTyping = useCallback(() => {
    if (conversation?.id) {
      socket.startTyping(conversation.id);
    }
  }, [conversation?.id, socket]);

  const stopTyping = useCallback(() => {
    if (conversation?.id) {
      socket.stopTyping(conversation.id);
    }
  }, [conversation?.id, socket]);

  const searchMessages = async (query: string) => {
    if (!conversation?.id || !query.trim()) return [];

    try {
      return await MessagesAPI.searchMessages(conversation.id, query.trim());
    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
      return [];
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data = await MessagesAPI.getUnreadCount();
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Erreur lors du chargement du compteur non lus:', err);
    }
  };

  return {
    conversation,
    messages,
    loading,
    error,
    hasMore,
    unreadCount,
    typingUsers,
    connected: socket.connected,
    loadConversation,
    loadMoreMessages,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    searchMessages,
    loadUnreadCount
  };
}; 