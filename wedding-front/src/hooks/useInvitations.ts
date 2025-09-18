import { useState, useEffect, useCallback } from 'react';
import { invitationsApi, CreateInvitationDto } from '@/lib/api/invitations';
import { renderTemplate, invitationToTemplateData, mergeInvitationData, DesignTemplate } from '../lib/templateEngine';
import { useAuth } from './useAuth';
import { Invitation, Statistics } from '@/types';

export const useInvitations = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, token } = useAuth();

  const fetchInvitations = useCallback(async () => {
    // Ne pas charger si pas authentifié
    if (!isAuthenticated || !token) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await invitationsApi.getInvitations();
      setInvitations(response || []);
    } catch (err) {
      console.error('❌ Error fetching invitations:', err);
      
      // Si erreur 401, l'utilisateur n'est plus authentifié
      if (err instanceof Error && err.message.includes('Session expirée')) {
        console.log('🔒 Session expirée, déconnexion automatique');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setInvitations([]);
        setError('Session expirée');
        return;
      }
      
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  const getInvitationById = async (id: string): Promise<Invitation | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await invitationsApi.getInvitation(id);
      return response;
    } catch (err) {
      console.error(`Error fetching invitation ${id}:`, err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createInvitation = async (data: CreateInvitationDto): Promise<Invitation | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await invitationsApi.createInvitation(data);
      
      if (response) {
        setInvitations(prev => [...prev, response]);
        return response;
      }
      return null;
    } catch (err) {
      console.error('Error creating invitation:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'invitation');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateInvitation = async (id: string, data: Partial<CreateInvitationDto>): Promise<Invitation | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await invitationsApi.updateInvitation(id, data);
      
      if (response) {
        setInvitations(prev => prev.map(inv => inv.id === id ? response : inv));
        return response;
      }
      return null;
    } catch (err) {
      console.error('Error updating invitation:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'invitation');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const publishInvitation = async (id: string): Promise<Invitation> => {
    try {
      const response = await invitationsApi.publishInvitation(id);
      
      // Mettre à jour la liste des invitations
      setInvitations(prev => prev.map(inv => 
        inv.id === id ? response : inv
      ));
      
      return response;
    } catch (error) {
      console.error('Erreur lors de la publication de l\'invitation:', error);
      throw error;
    }
  };

  const archiveInvitation = async (id: string): Promise<Invitation> => {
    try {
      const response = await invitationsApi.archiveInvitation(id);
      
      // Mettre à jour la liste des invitations
      setInvitations(prev => prev.map(inv => 
        inv.id === id ? response : inv
      ));
      
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'archivage de l\'invitation:', error);
      throw error;
    }
  };

  const deleteInvitation = async (id: string): Promise<void> => {
    try {
      await invitationsApi.deleteInvitation(id);
      
      // Supprimer de la liste
      setInvitations(prev => prev.filter(inv => inv.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'invitation:', error);
      throw error;
    }
  };

  const getInvitationStats = async (id: string): Promise<Statistics> => {
    try {
      const stats = await invitationsApi.getStats(id);
      // S'assurer que toutes les propriétés requises sont présentes
      return {
        totalGuests: stats.totalGuests || 0,
        confirmed: stats.confirmed || 0,
        declined: stats.declined || 0,
        pending: stats.pending || 0,
        responseRate: stats.responseRate || 0,
        dietaryRestrictionsCount: (stats as any).dietaryRestrictionsCount || 0
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  };

  const exportGuestsCSV = async (id: string): Promise<void> => {
    try {
      const blob = await invitationsApi.exportGuestsCSV(id);
      
      // Télécharger le fichier
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `invites-${id}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors de l\'export CSV:', error);
      throw error;
    }
  };

  const getActiveInvitation = async (): Promise<Invitation | null> => {
    try {
      return await invitationsApi.getActiveInvitation();
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'invitation active:', error);
      return null;
    }
  };

  useEffect(() => {
    // Ne charger que si authentifié
    if (isAuthenticated && token) {
      fetchInvitations();
    }
  }, [isAuthenticated, token, fetchInvitations]);

  return {
    invitations,
    loading,
    error,
    fetchInvitations,
    getInvitationById,
    createInvitation,
    updateInvitation,
    publishInvitation,
    archiveInvitation,
    deleteInvitation,
    getInvitationStats,
    exportGuestsCSV,
    getActiveInvitation
  };
}

// Fonction pour rendre une invitation avec un template
export function renderInvitationWithTemplate(
  invitation: Invitation,
  template: DesignTemplate,
  customData: Partial<any> = {}
): { html: string; css: string } {
  // Convertir les données d'invitation en données de template
  const invitationData = invitationToTemplateData(invitation);
  
  // Fusionner avec les données personnalisées
  const templateData = mergeInvitationData({ ...invitationData, ...customData });
  
  // Rendre le template
  return renderTemplate(template, templateData, invitation.id);
} 