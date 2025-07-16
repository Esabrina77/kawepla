'use client';

import { useState, useEffect } from 'react';
import { RSVPMessage } from '@/types';
import { rsvpMessagesApi } from '@/lib/api/apiClient';
import { globalEvents } from '@/lib/utils';

export const useRSVPMessages = () => {
  const [messages, setMessages] = useState<RSVPMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await rsvpMessagesApi.getMessages();
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (rsvpId: string) => {
    try {
      await rsvpMessagesApi.markAsRead(rsvpId);
      // Optionnel : mettre à jour l'état local si nécessaire
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  // Fonction pour rafraîchir sans loading (pour les mises à jour silencieuses)
  const refreshMessages = async () => {
    try {
      const data = await rsvpMessagesApi.getMessages();
      setMessages(data);
    } catch (err) {
      console.error('Erreur lors du rafraîchissement des messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Écouter l'événement de suppression d'invité
    const handleGuestDeleted = () => {
      refreshMessages();
    };

    globalEvents.on('guest-deleted', handleGuestDeleted);

    // Nettoyage
    return () => {
      globalEvents.off('guest-deleted', handleGuestDeleted);
    };
  }, []);

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages,
    refreshMessages,
    markAsRead
  };
}; 