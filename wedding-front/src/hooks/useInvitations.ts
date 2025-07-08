import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api/apiClient';
import { renderTemplate, invitationToTemplateData, mergeTemplateData, DesignTemplate } from '../lib/templateEngine';

export interface Invitation {
  id: string;
  
  // Informations du couple
  coupleName: string;
  
  // Date et heure
  weddingDate: string;
  ceremonyTime?: string;
  receptionTime?: string;
  
  // Textes d'invitation
  invitationText?: string;
  
  // Lieu et détails
  venueName: string;
  venueAddress: string;
  venueCoordinates?: string;
  moreInfo?: string;
  
  // RSVP
  rsvpDetails?: string;
  rsvpForm?: string;
  rsvpDate?: string;
  
  // Messages personnalisés
  message?: string;
  blessingText?: string;
  welcomeMessage?: string;
  
  // Informations supplémentaires
  dressCode?: string;
  contact?: string;
  
  // Champs existants
  title?: string;
  description?: string;
  customDomain?: string;
  status: string;
  photos: Array<{
    url: string;
    caption?: string;
  }>;
  program?: {
    dinner?: string;
    ceremony?: string;
    cocktail?: string;
  };
  restrictions?: string;
  languages: string[];
  maxGuests?: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  designId: string;
}

export interface CreateInvitationData {
  coupleName: string;
  weddingDate: string;
  venueName: string;
  venueAddress: string;
  designId: string;
  ceremonyTime?: string;
  receptionTime?: string;
  invitationText?: string;
  moreInfo?: string;
  rsvpDetails?: string;
  rsvpForm?: string;
  rsvpDate?: string;
  message?: string;
  blessingText?: string;
  welcomeMessage?: string;
  dressCode?: string;
  contact?: string;
  title?: string;
  description?: string;
}

export function useInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get<Invitation[]>('/invitations');
      setInvitations(response || []);
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getInvitationById = async (id: string): Promise<Invitation | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get<Invitation>(`/invitations/${id}`);
      return response;
    } catch (err) {
      console.error(`Error fetching invitation ${id}:`, err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createInvitation = async (data: CreateInvitationData): Promise<Invitation | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.post<Invitation>('/invitations', data);
      
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

  const updateInvitation = async (id: string, data: Partial<CreateInvitationData>): Promise<Invitation | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.put<Invitation>(`/invitations/${id}`, data);
      
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

  const publishInvitation = async (id: string): Promise<any> => {
    try {
      const response = await apiClient.post(`/invitations/${id}/publish`);
      
      // Mettre à jour la liste des invitations
      setInvitations(prev => prev.map(inv => 
        inv.id === id ? { ...inv, status: 'PUBLISHED' } : inv
      ));
      
      return response;
    } catch (error) {
      console.error('Erreur lors de la publication de l\'invitation:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  return {
    invitations,
    loading,
    error,
    fetchInvitations,
    getInvitationById,
    createInvitation,
    updateInvitation,
    publishInvitation
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
  const templateData = mergeTemplateData({ ...invitationData, ...customData });
  
  // Rendre le template
  return renderTemplate(template, templateData, invitation.id);
} 