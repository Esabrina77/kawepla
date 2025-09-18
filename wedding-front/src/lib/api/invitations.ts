import { apiClient } from './apiClient';
import { Invitation } from '@/types';

// Types pour la nouvelle API simplifiée
export interface CreateInvitationDto {
  // NOUVELLE ARCHITECTURE SIMPLIFIÉE
  eventTitle: string;      // "Emma & Lucas" ou "Anniversaire de Marie"
  eventDate: string;       // Date de l'événement (ISO string)
  eventTime?: string;      // "15h00" (optionnel)
  location: string;        // "Château de la Roseraie, Paris"
  eventType?: 'event' | 'BIRTHDAY' | 'BAPTISM' | 'ANNIVERSARY' | 'GRADUATION' | 'BABY_SHOWER' | 'ENGAGEMENT' | 'COMMUNION' | 'CONFIRMATION' | 'RETIREMENT' | 'HOUSEWARMING' | 'CORPORATE' | 'OTHER';
  customText?: string;     // Texte libre personnalisable
  moreInfo?: string;       // Informations supplémentaires
  
  // Champs techniques
  description?: string;
  photos?: string[];
  languages?: string[];
  designId: string;        // Obligatoire
}

export const invitationsApi = {
  async getInvitations(): Promise<Invitation[]> {
    return apiClient.get<Invitation[]>('/invitations');
  },

  async createInvitation(data: CreateInvitationDto): Promise<Invitation> {
    return apiClient.post<Invitation>('/invitations', data);
  },

  async updateInvitation(id: string, data: Partial<CreateInvitationDto>): Promise<Invitation> {
    return apiClient.put<Invitation>(`/invitations/${id}`, data);
  },

  async getInvitation(id: string): Promise<Invitation> {
    return apiClient.get<Invitation>(`/invitations/${id}`);
  },

  async deleteInvitation(id: string): Promise<void> {
    return apiClient.delete<void>(`/invitations/${id}`);
  },

  async publishInvitation(id: string): Promise<Invitation> {
    return apiClient.post<Invitation>(`/invitations/${id}/publish`);
  },

  async archiveInvitation(id: string): Promise<Invitation> {
    return apiClient.post<Invitation>(`/invitations/${id}/archive`);
  },

  async getStats(id: string): Promise<{
    totalGuests: number;
    confirmed: number;
    declined: number;
    pending: number;
    responseRate: number;
  }> {
    return apiClient.get(`/invitations/${id}/stats`);
  },

  async exportGuestsCSV(id: string): Promise<Blob> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invitations/${id}/export`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'export');
    }

    return response.blob();
  },

  async getActiveInvitation(): Promise<Invitation> {
    return apiClient.get<Invitation>('/invitations/active');
  }
}; 