'use client';

import { useState, useEffect } from 'react';
import { RSVPMessage } from '@/types';
import { rsvpMessagesApi } from '@/lib/api/apiClient';

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

  useEffect(() => {
    fetchMessages();
  }, []);

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages,
    markAsRead
  };
}; 