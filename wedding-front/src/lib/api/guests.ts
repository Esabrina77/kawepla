import { apiClient } from './apiClient';
import { Guest } from '@/types';

export type CreateGuestData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isVIP?: boolean;
  invitationId: string;
};

export type UpdateGuestData = Partial<CreateGuestData> & {
  status?: 'pending' | 'confirmed' | 'declined';
  dietaryRestrictions?: string;
};

export const guestsApi = {
  // Récupérer tous les invités d'une invitation
  getAll: (invitationId: string) => 
    apiClient.get<Guest[]>(`/invitations/${invitationId}/guests`),

  // Récupérer un invité par son ID
  getById: (invitationId: string, id: string) => 
    apiClient.get<Guest>(`/invitations/${invitationId}/guests/${id}`),

  // Créer un nouvel invité
  create: (data: CreateGuestData) => 
    apiClient.post<Guest>(`/invitations/${data.invitationId}/guests`, data),

  // Mettre à jour un invité
  update: (invitationId: string, id: string, data: UpdateGuestData) => 
    apiClient.patch<Guest>(`/invitations/${invitationId}/guests/${id}`, data),

  // Supprimer un invité
  delete: (invitationId: string, id: string) => 
    apiClient.delete<void>(`/invitations/${invitationId}/guests/${id}`),

  // Importer des invités depuis un fichier CSV
  importFromCsv: (invitationId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<{ imported: number; errors: any[] }>(
      `/invitations/${invitationId}/guests/import`,
      formData
    );
  },

  // Obtenir les statistiques des invités d'une invitation
  getStatistics: (invitationId: string) => 
    apiClient.get<{
      total: number;
      confirmed: number;
      declined: number;
      pending: number;
      responseRate: number;
    }>(`/invitations/${invitationId}/guests/statistics`),

  // Envoyer une invitation par email à un invité
  sendInvitation: (guestId: string) => 
    apiClient.post(`/guests/${guestId}/send-invitation`),

  // Envoyer un rappel à un invité
  sendReminder: (guestId: string) => 
    apiClient.post(`/guests/${guestId}/send-reminder`),

  // Envoyer toutes les invitations d'une invitation
  sendAllInvitations: (invitationId: string) => 
    apiClient.post(`/invitations/${invitationId}/guests/send-all`),

  // Mettre à jour la photo de profil d'un invité
  updateProfilePhoto: (guestId: string, profilePhotoUrl: string | null) => 
    apiClient.patch<Guest>(`/guests/${guestId}/profile-photo`, { profilePhotoUrl }),
}; 