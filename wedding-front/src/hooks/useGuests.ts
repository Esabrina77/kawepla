import { useState, useEffect } from 'react';
import { guestsApi, CreateGuestData, UpdateGuestData } from '@/lib/api/guests';
import { Guest } from '@/types';
import { globalEvents } from '@/lib/utils';

export function useGuests(invitationId: string) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<{
    total: number;
    confirmed: number;
    declined: number;
    pending: number;
    responseRate: number;
  } | null>(null);

  const loadGuests = async () => {
    try {
      setLoading(true);
      const data = await guestsApi.getAll(invitationId);
      setGuests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await guestsApi.getStatistics(invitationId);
      setStatistics(stats);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  };

  const createGuest = async (data: Omit<CreateGuestData, 'invitationId'>) => {
    try {
      setLoading(true);
      const newGuest = await guestsApi.create({ ...data, invitationId });
      setGuests(prev => [...prev, newGuest]);
      await loadStatistics();
      return newGuest;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGuest = async (id: string, data: UpdateGuestData) => {
    try {
      setLoading(true);
      const updatedGuest = await guestsApi.update(invitationId, id, data);
      setGuests(prev => prev.map(guest => guest.id === id ? updatedGuest : guest));
      await loadStatistics();
      return updatedGuest;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteGuest = async (id: string) => {
    try {
      setLoading(true);
      await guestsApi.delete(invitationId, id);
      setGuests(prev => prev.filter(guest => guest.id !== id));
      await loadStatistics();
      
      // Émettre l'événement pour notifier les autres hooks
      globalEvents.emit('guest-deleted', { guestId: id, invitationId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const importGuests = async (file: File) => {
    try {
      setLoading(true);
      const result = await guestsApi.importFromCsv(invitationId, file);
      await loadGuests();
      await loadStatistics();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (invitationId) {
      loadGuests();
      loadStatistics();
    }
  }, [invitationId]);

  return {
    guests,
    statistics,
    loading,
    error,
    createGuest,
    updateGuest,
    deleteGuest,
    importGuests,
    loadGuests,
    loadStatistics
  };
} 