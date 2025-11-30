import { useEffect, useRef } from 'react';
import { useNotifications } from './useNotifications';
import { useAuth } from './useAuth';

export const useWebSocketNotifications = () => {
  const { showNotification } = useNotifications(); // Supprimé playNotificationSound
  const { token } = useAuth();
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!token) return;

    // Importer Socket.IO dynamiquement
    const connectSocketIO = async () => {
      try {
        const { io } = await import('socket.io-client');
        
        // Se connecter avec authentification
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
        socketRef.current = io(apiUrl, {
          auth: {
            token: token
          },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: Infinity,
          timeout: 20000
        });

        socketRef.current.on('connect', () => {
          console.log('🔗 Socket.IO connecté pour les notifications');
        });

        socketRef.current.on('notification', (notification: any) => {
          // Afficher la notification (le son sera géré automatiquement par showNotification)
          showNotification({
            title: notification.title,
            body: notification.body,
            sound: notification.sound || false
          });

          console.log('🔔 Notification reçue:', notification.title);
        });

        socketRef.current.on('connect_error', (error: any) => {
          console.error('❌ Erreur de connexion Socket.IO:', error);
        });

        socketRef.current.on('disconnect', () => {
          console.log('🔌 Socket.IO déconnecté');
        });

      } catch (error) {
        console.error('❌ Erreur lors de la connexion Socket.IO:', error);
      }
    };

    connectSocketIO();

    // Nettoyer à la déconnexion
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token, showNotification]);

  return {
    isConnected: socketRef.current?.connected || false
  };
};
