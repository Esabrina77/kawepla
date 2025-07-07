import { apiClient } from './apiClient';
import { WeddingConfig } from '@/types';

export type UpdateWeddingConfigData = Partial<Omit<WeddingConfig, 'id' | 'designId'>>;

export const weddingApi = {
  // Récupérer la configuration actuelle
  getConfig: () => apiClient.get<WeddingConfig>('/wedding/config'),

  // Mettre à jour la configuration
  updateConfig: (data: UpdateWeddingConfigData) => 
    apiClient.patch<WeddingConfig>('/wedding/config', data),

  // Ajouter des photos
  uploadPhotos: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('photos', file));
    return apiClient.post<{ urls: string[] }>('/wedding/photos', formData);
  },

  // Supprimer une photo
  deletePhoto: (photoUrl: string) => 
    apiClient.delete<void>(`/wedding/photos?url=${encodeURIComponent(photoUrl)}`),

  // Mettre à jour le planning
  updateSchedule: (schedule: WeddingConfig['schedule']) => 
    apiClient.patch<WeddingConfig>('/wedding/schedule', { schedule }),

  // Mettre à jour les informations de localisation
  updateLocation: (location: WeddingConfig['location']) => 
    apiClient.patch<WeddingConfig>('/wedding/location', { location }),

  // Mettre à jour les langues disponibles
  updateLanguages: (languages: string[]) => 
    apiClient.patch<WeddingConfig>('/wedding/languages', { languages }),
}; 