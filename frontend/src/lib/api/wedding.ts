import { apiClient } from './apiClient';
import { eventConfig } from '@/types';

export type UpdateeventConfigData = Partial<Omit<eventConfig, 'id' | 'designId'>>;

export const eventApi = {
  // Récupérer la configuration actuelle
  getConfig: () => apiClient.get<eventConfig>('/event/config'),

  // Mettre à jour la configuration
  updateConfig: (data: UpdateeventConfigData) => 
    apiClient.patch<eventConfig>('/event/config', data),

  // Ajouter des photos
  uploadPhotos: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('photos', file));
    return apiClient.post<{ urls: string[] }>('/event/photos', formData);
  },

  // Supprimer une photo
  deletePhoto: (photoUrl: string) => 
    apiClient.delete<void>(`/event/photos?url=${encodeURIComponent(photoUrl)}`),

  // Mettre à jour le planning
  updateSchedule: (schedule: eventConfig['schedule']) => 
    apiClient.patch<eventConfig>('/event/schedule', { schedule }),

  // Mettre à jour les informations de localisation
  updateLocation: (location: eventConfig['location']) => 
    apiClient.patch<eventConfig>('/event/location', { location }),

  // Mettre à jour les langues disponibles
  updateLanguages: (languages: string[]) => 
    apiClient.patch<eventConfig>('/event/languages', { languages }),
}; 