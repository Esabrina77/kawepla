import { apiClient } from './apiClient';
import { Invitation } from '@/types';

export const invitationsApi = {
  async getInvitations(): Promise<Invitation[]> {
    return apiClient.get<Invitation[]>('/invitations');
  },

  async createInvitation(data: Partial<Invitation>): Promise<Invitation> {
    return apiClient.post<Invitation>('/invitations', data);
  },

  async updateInvitation(id: string, data: Partial<Invitation>): Promise<Invitation> {
    return apiClient.put<Invitation>(`/invitations/${id}`, data);
  }
}; 