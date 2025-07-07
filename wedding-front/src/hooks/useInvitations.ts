import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api/apiClient';
import { renderTemplate, invitationToTemplateData, mergeTemplateData, DesignTemplate } from '../lib/templateEngine';

export interface Invitation {
  id: string;
  title: string;
  description: string;
  weddingDate: string;
  ceremonyTime: string;
  receptionTime: string;
  venueName: string;
  venueAddress: string;
  venueCoordinates: string;
  customDomain: string | null;
  status: string;
  theme: {
    fonts: {
      body: string;
      heading: string;
    };
    colors: {
      accent: string;
      primary: string;
      secondary: string;
    };
  };
  photos: Array<{
    url: string;
    caption: string;
  }>;
  program: {
    dinner: string;
    ceremony: string;
    cocktail: string;
  };
  restrictions: string;
  languages: string[];
  maxGuests: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  designId: string;
}

export function useInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Appel direct à l'API comme dans Postman
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
      
      // Appel direct à l'API comme dans Postman
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

  useEffect(() => {
    fetchInvitations();
  }, []);

  return {
    invitations,
    loading,
    error,
    fetchInvitations,
    getInvitationById
  };
}

// Nouvelle fonction pour rendre une invitation avec un template
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