'use client';

import { useWebSocketNotifications } from '@/hooks/useWebSocketNotifications';

export const WebSocketNotificationsProvider = () => {
  const { isConnected } = useWebSocketNotifications();

  // Ce composant ne rend rien visuellement, il gère juste les notifications WebSocket
  return null;
};
