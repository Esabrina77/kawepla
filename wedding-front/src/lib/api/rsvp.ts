import { apiClient } from './apiClient';

export interface RSVPResponse {
  status: 'CONFIRMED' | 'DECLINED' | 'PENDING';
  numberOfGuests: number;
  message?: string;
  attendingCeremony?: boolean;
  attendingReception?: boolean;
  dietaryRestrictions?: string;
}

export interface RSVPInvitation {
  id: string;
  title: string;
  weddingDate: Date;
  ceremonyTime?: string;
  receptionTime?: string;
  venueName: string;
  venueAddress: string;
  venueCoordinates?: string;
  theme: any;
  photos: string[];
  program?: any;
  restrictions?: string;
}

export const rsvpApi = {
  // Récupérer les détails de l'invitation avec le token
  getInvitation: (token: string) => 
    apiClient.get<RSVPInvitation>(`/rsvp/${token}`),

  // Récupérer le statut RSVP actuel
  getStatus: (token: string) => 
    apiClient.get<RSVPResponse>(`/rsvp/${token}/status`),

  // Répondre à l'invitation
  respond: (token: string, data: RSVPResponse) => 
    apiClient.post<RSVPResponse>(`/rsvp/${token}/respond`, data),

  // Mettre à jour une réponse
  update: (token: string, data: Partial<RSVPResponse>) => 
    apiClient.patch<RSVPResponse>(`/rsvp/${token}`, data),
}; 