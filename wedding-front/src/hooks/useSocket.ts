/**
 * Hook pour gérer les connexions WebSocket
 */
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message } from '@/lib/api/messages';

interface UseSocketProps {
  token?: string;
  enabled?: boolean;
}

interface SocketEvents {
  onNewMessage?: (data: { message: Message; conversationId: string }) => void;
  onNewClientMessage?: (data: { message: Message; conversationId: string }) => void;
  onUserTyping?: (data: { userId: string; conversationId: string; isTyping: boolean }) => void;
  onMessagesRead?: (data: { userId: string; conversationId: string }) => void;
  onError?: (error: { message: string }) => void;
}

export const useSocket = ({ token, enabled = true }: UseSocketProps = {}) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const eventsRef = useRef<SocketEvents>({});

  // Initialiser la connexion WebSocket
  useEffect(() => {
    if (!enabled || !token) return;

    const initSocket = () => {
      setConnecting(true);
      
      const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
        auth: { token },
        transports: ['websocket'],
        forceNew: true
      });

      socket.on('connect', () => {
        console.log('WebSocket connecté');
        setConnected(true);
        setConnecting(false);
      });

      socket.on('disconnect', () => {
        console.log('WebSocket déconnecté');
        setConnected(false);
        setConnecting(false);
      });

      socket.on('connect_error', (error) => {
        console.error('Erreur de connexion WebSocket:', error);
        setConnected(false);
        setConnecting(false);
        eventsRef.current.onError?.({ message: 'Erreur de connexion' });
      });

      // Événements de messagerie
      socket.on('new_message', (data) => {
        eventsRef.current.onNewMessage?.(data);
      });

      socket.on('new_client_message', (data) => {
        eventsRef.current.onNewClientMessage?.(data);
      });

      socket.on('user_typing', (data) => {
        eventsRef.current.onUserTyping?.(data);
      });

      socket.on('messages_read', (data) => {
        eventsRef.current.onMessagesRead?.(data);
      });

      socket.on('error', (error) => {
        eventsRef.current.onError?.(error);
      });

      socketRef.current = socket;
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token, enabled]);

  // Méthodes pour interagir avec le socket
  const joinConversation = (conversationId: string) => {
    socketRef.current?.emit('join_conversation', { conversationId });
  };

  const leaveConversation = (conversationId: string) => {
    socketRef.current?.emit('leave_conversation', { conversationId });
  };

  const sendMessage = (conversationId: string, content: string, messageType = 'TEXT') => {
    socketRef.current?.emit('send_message', {
      conversationId,
      content,
      messageType
    });
  };

  const startTyping = (conversationId: string) => {
    socketRef.current?.emit('typing_start', { conversationId });
  };

  const stopTyping = (conversationId: string) => {
    socketRef.current?.emit('typing_stop', { conversationId });
  };

  const markAsRead = (conversationId: string) => {
    socketRef.current?.emit('mark_as_read', { conversationId });
  };

  // Méthode pour enregistrer les événements
  const on = (events: SocketEvents) => {
    eventsRef.current = { ...eventsRef.current, ...events };
  };

  return {
    connected,
    connecting,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    on
  };
}; 