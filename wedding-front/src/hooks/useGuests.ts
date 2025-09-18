import { useState, useCallback } from 'react';
import { guestsApi, CreateGuestDto, ImportPreview, ImportResult } from '@/lib/api/guests';
import { Guest, Statistics } from '@/types';

export const useGuests = (invitationId?: string) => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  // GESTION DES INVITÉS
  const fetchGuests = useCallback(async () => {
    if (!invitationId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await guestsApi.getGuestsByInvitation(invitationId);
      setGuests(response);
      
      // Charger aussi les statistiques
      try {
        const stats = await guestsApi.getStatistics(invitationId);
        setStatistics(stats);
      } catch (statsError) {
        console.error('Erreur lors du chargement des statistiques:', statsError);
        // Ne pas faire échouer le chargement des invités si les stats échouent
      }
    } catch (err) {
      console.error('Erreur lors du chargement des invités:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des invités');
    } finally {
      setLoading(false);
    }
  }, [invitationId]);

  const createGuest = useCallback(async (guestData: Omit<CreateGuestDto, 'invitationId'>): Promise<Guest | null> => {
    if (!invitationId) return null;
    
    try {
      setLoading(true);
      setError(null);
      const newGuest = await guestsApi.createGuest(invitationId, guestData);
      setGuests(prev => [...prev, newGuest]);
      
      // Recharger les statistiques après création
      try {
        const stats = await guestsApi.getStatistics(invitationId);
        setStatistics(stats);
      } catch (statsError) {
        console.error('Erreur lors du rechargement des statistiques:', statsError);
      }
      
      return newGuest;
    } catch (err) {
      console.error('Erreur lors de la création de l\'invité:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'invité');
      return null;
    } finally {
      setLoading(false);
    }
  }, [invitationId]);

  const updateGuest = useCallback(async (guestId: string, guestData: Partial<CreateGuestDto>): Promise<Guest | null> => {
    if (!invitationId) return null;
    
    try {
      setLoading(true);
      setError(null);
      const updatedGuest = await guestsApi.updateGuest(invitationId, guestId, guestData);
      setGuests(prev => prev.map(guest => guest.id === guestId ? updatedGuest : guest));
      return updatedGuest;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'invité:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'invité');
      return null;
    } finally {
      setLoading(false);
    }
  }, [invitationId]);

  const deleteGuest = useCallback(async (guestId: string): Promise<boolean> => {
    if (!invitationId) return false;
    
    try {
      setLoading(true);
      setError(null);
      await guestsApi.deleteGuest(invitationId, guestId);
      setGuests(prev => prev.filter(guest => guest.id !== guestId));
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'invité:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'invité');
      return false;
    } finally {
      setLoading(false);
    }
  }, [invitationId]);

  const getGuestById = useCallback(async (guestId: string): Promise<Guest | null> => {
    if (!invitationId) return null;
    
    try {
      return await guestsApi.getGuestById(invitationId, guestId);
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'invité:', err);
      return null;
    }
  }, [invitationId]);

  // STATISTIQUES
  const fetchStatistics = useCallback(async (): Promise<Statistics | null> => {
    if (!invitationId) return null;
    
    try {
      const stats = await guestsApi.getStatistics(invitationId);
      setStatistics(stats);
      return stats;
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      return null;
    }
  }, [invitationId]);

  // ENVOI D'INVITATIONS
  const sendInvitation = useCallback(async (guestId: string): Promise<boolean> => {
    try {
      await guestsApi.sendInvitation(guestId);
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'envoi de l\'invitation:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'invitation');
      return false;
    }
  }, []);

  const sendReminder = useCallback(async (guestId: string): Promise<boolean> => {
    try {
      await guestsApi.sendReminder(guestId);
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'envoi du rappel:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi du rappel');
      return false;
    }
  }, []);

  const sendBulkInvitations = useCallback(async (guestIds: string[]): Promise<{
    sent: string[];
    failed: { guestId: string; error: string }[];
  }> => {
    try {
      setLoading(true);
      return await guestsApi.sendBulkInvitations(guestIds);
    } catch (err) {
      console.error('Erreur lors de l\'envoi groupé:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendBulkReminders = useCallback(async (guestIds: string[]): Promise<{
    sent: string[];
    failed: { guestId: string; error: string }[];
  }> => {
    try {
      setLoading(true);
      return await guestsApi.sendBulkReminders(guestIds);
    } catch (err) {
      console.error('Erreur lors de l\'envoi groupé de rappels:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // PHOTO DE PROFIL
  const updateProfilePhoto = useCallback(async (guestId: string, photoFile: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      
      const response = await guestsApi.updateProfilePhoto(guestId, formData);
      
      // Mettre à jour l'invité dans la liste
      setGuests(prev => prev.map(guest => 
        guest.id === guestId 
          ? { ...guest, profilePhotoUrl: response.profilePhotoUrl }
          : guest
      ));
      
      return response.profilePhotoUrl;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la photo:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la photo');
      return null;
    }
  }, []);

  // IMPORT/EXPORT
  const previewImport = useCallback(async (file: File): Promise<ImportPreview | null> => {
    if (!invitationId) return null;
    
    try {
      setLoading(true);
      return await guestsApi.previewImport(invitationId, file);
    } catch (err) {
      console.error('Erreur lors de l\'aperçu d\'import:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'aperçu d\'import');
      return null;
    } finally {
      setLoading(false);
    }
  }, [invitationId]);

  const bulkImport = useCallback(async (file: File): Promise<ImportResult | null> => {
    if (!invitationId) return null;
    
    try {
      setLoading(true);
      const result = await guestsApi.bulkImport(invitationId, file);
      
      // Recharger la liste des invités après l'import
      await fetchGuests();
      
      return result;
    } catch (err) {
      console.error('Erreur lors de l\'import:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'import');
      return null;
    } finally {
      setLoading(false);
    }
  }, [invitationId, fetchGuests]);

  const downloadTemplate = useCallback(async (format: 'csv' | 'txt'): Promise<void> => {
    try {
      const blob = await guestsApi.downloadTemplate(format);
      
      // Télécharger le fichier
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `template-invites.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Erreur lors du téléchargement du template:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du téléchargement du template');
    }
  }, []);

  // UTILITAIRES
  const getGuestsByStatus = useCallback((status?: 'CONFIRMED' | 'DECLINED' | 'PENDING') => {
    if (!status) return guests;
    
    return guests.filter(guest => guest.rsvp?.status === status);
  }, [guests]);

  const getVIPGuests = useCallback(() => {
    return guests.filter(guest => guest.isVIP);
  }, [guests]);

  const getGuestsWithPlusOne = useCallback(() => {
    return guests.filter(guest => guest.plusOne);
  }, [guests]);

  const getGuestsWithDietaryRestrictions = useCallback(() => {
    return guests.filter(guest => guest.dietaryRestrictions && guest.dietaryRestrictions.trim() !== '');
  }, [guests]);

  const getTotalGuestCount = useCallback(() => {
    return guests.reduce((total, guest) => {
      let count = 1; // L'invité principal
      if (guest.plusOne && guest.rsvp?.status === 'CONFIRMED') {
        count += 1; // Le +1
      }
      return total + count;
    }, 0);
  }, [guests]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // État
    guests,
    loading,
    error,
    statistics,
    
    // Actions principales
    fetchGuests,
    createGuest,
    updateGuest,
    deleteGuest,
    getGuestById,
    
    // Statistiques
    fetchStatistics,
    
    // Envoi d'invitations
    sendInvitation,
    sendReminder,
    sendBulkInvitations,
    sendBulkReminders,
    
    // Photo de profil
    updateProfilePhoto,
    
    // Import/Export
    previewImport,
    bulkImport,
    downloadTemplate,
    
    // Utilitaires
    getGuestsByStatus,
    getVIPGuests,
    getGuestsWithPlusOne,
    getGuestsWithDietaryRestrictions,
    getTotalGuestCount,
    clearError
  };
};