import { apiClient } from './apiClient';
import { Guest, Statistics } from '@/types';

export interface CreateGuestDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  isVIP?: boolean;
  invitationId: string; // Ajouté automatiquement par les routes
}

export interface ImportPreview {
  validGuests: CreateGuestDto[];
  errors: {
    row: number;
    guest: Partial<CreateGuestDto>;
    error: string;
  }[];
  totalRows: number;
  validRows: number;
  errorRows: number;
}

export interface ImportResult {
  success: Guest[];
  errors: {
    guest: Partial<CreateGuestDto>;
    error: string;
  }[];
  totalProcessed: number;
  successCount: number;
  errorCount: number;
}

export const guestsApi = {
  // GESTION DES INVITÉS (via routes d'invitation)
  async getGuestsByInvitation(invitationId: string): Promise<Guest[]> {
    return apiClient.get<Guest[]>(`/invitations/${invitationId}/guests`);
  },

  async createGuest(invitationId: string, guest: Omit<CreateGuestDto, 'invitationId'>): Promise<Guest> {
    return apiClient.post<Guest>(`/invitations/${invitationId}/guests`, guest);
  },

  async updateGuest(invitationId: string, guestId: string, guest: Partial<CreateGuestDto>): Promise<Guest> {
    return apiClient.patch<Guest>(`/invitations/${invitationId}/guests/${guestId}`, guest);
  },

  async deleteGuest(invitationId: string, guestId: string): Promise<void> {
    return apiClient.delete<void>(`/invitations/${invitationId}/guests/${guestId}`);
  },

  async getGuestById(invitationId: string, guestId: string): Promise<Guest> {
    return apiClient.get<Guest>(`/invitations/${invitationId}/guests/${guestId}`);
  },

  // STATISTIQUES
  async getStatistics(invitationId: string): Promise<Statistics> {
    return apiClient.get<Statistics>(`/invitations/${invitationId}/guests/statistics`);
  },

  // ENVOI D'INVITATIONS
  async sendInvitation(guestId: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/guests/${guestId}/send-invitation`);
  },

  async sendReminder(guestId: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/guests/${guestId}/send-reminder`);
  },

  // PHOTO DE PROFIL
  async updateProfilePhoto(guestId: string, photoData: FormData): Promise<{ profilePhotoUrl: string }> {
    return apiClient.postFormData<{ profilePhotoUrl: string }>(`/guests/${guestId}/profile-photo`, photoData);
  },

  // IMPORT/EXPORT
  async previewImport(invitationId: string, file: File): Promise<ImportPreview> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postFormData<ImportPreview>(`/invitations/${invitationId}/guests/preview-import`, formData);
  },

  async bulkImport(invitationId: string, file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postFormData<ImportResult>(`/invitations/${invitationId}/guests/bulk-import`, formData);
  },

  // Alternative pour l'import général
  async previewImportGeneral(file: File): Promise<ImportPreview> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postFormData<ImportPreview>('/guests/preview-import', formData);
  },

  // TÉLÉCHARGEMENT DE TEMPLATES
  async downloadTemplate(format: 'csv' | 'txt'): Promise<Blob> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/guests/template/${format}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement du template');
    }

    return response.blob();
  },

  // UTILITAIRES
  async sendBulkInvitations(guestIds: string[]): Promise<{
    sent: string[];
    failed: { guestId: string; error: string }[];
  }> {
    const results = await Promise.allSettled(
      guestIds.map(async (guestId) => {
        try {
          await this.sendInvitation(guestId);
          return { success: true, guestId };
        } catch (error) {
          return { 
            success: false, 
            guestId, 
            error: error instanceof Error ? error.message : 'Erreur inconnue' 
          };
        }
      })
    );

    const sent: string[] = [];
    const failed: { guestId: string; error: string }[] = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        sent.push(result.value.guestId);
      } else if (result.status === 'fulfilled' && !result.value.success) {
        failed.push({
          guestId: result.value.guestId,
          error: result.value.error || 'Erreur inconnue'
        });
      } else {
        // result.status === 'rejected'
        failed.push({
          guestId: 'unknown',
          error: (result as PromiseRejectedResult).reason?.message || 'Erreur inconnue'
        });
      }
    });

    return { sent, failed };
  },

  async sendBulkReminders(guestIds: string[]): Promise<{
    sent: string[];
    failed: { guestId: string; error: string }[];
  }> {
    const results = await Promise.allSettled(
      guestIds.map(async (guestId) => {
        try {
          await this.sendReminder(guestId);
          return { success: true, guestId };
        } catch (error) {
          return { 
            success: false, 
            guestId, 
            error: error instanceof Error ? error.message : 'Erreur inconnue' 
          };
        }
      })
    );

    const sent: string[] = [];
    const failed: { guestId: string; error: string }[] = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        sent.push(result.value.guestId);
      } else if (result.status === 'fulfilled' && !result.value.success) {
        failed.push({
          guestId: result.value.guestId,
          error: result.value.error || 'Erreur inconnue'
        });
      }
    });

    return { sent, failed };
  }
};