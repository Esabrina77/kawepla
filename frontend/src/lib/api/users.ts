import { apiClient } from './apiClient';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const usersApi = {
  /**
   * Supprimer le compte de l'utilisateur connecté
   */
  async deleteAccount(): Promise<void> {
    return apiClient.delete('/users/me');
  }
};

