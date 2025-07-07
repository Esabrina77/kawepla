import { apiClient } from './apiClient';
import { Guest } from '@/types';

export type CreateGuestData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isVip?: boolean;
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
}; 