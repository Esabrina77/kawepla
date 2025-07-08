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
  title?: string;
  coupleName: string;
  weddingDate: string;
  ceremonyTime?: string;
  receptionTime?: string;
  venueName: string;
  venueAddress: string;
  venueCoordinates?: string;
  invitationText?: string;
  message?: string;
  blessingText?: string;
  welcomeMessage?: string;
  dressCode?: string;
  contact?: string;
  moreInfo?: string;
  rsvpDetails?: string;
  rsvpForm?: string;
  rsvpDate?: string;
  photos?: any[];
  program?: any;
  restrictions?: string;
  status: string;
  designId: string;
  design: {
    id: string;
    name: string;
    template: any;
    styles: any;
    variables: any;
    components?: any;
    version?: string;
  };
}

export const rsvpApi = {
  // Récupérer les détails de l'invitation avec le token
  getInvitation: (token: string) => 
    apiClient.get<RSVPInvitation>(`/rsvp/${token}/invitation`),

  // Récupérer le statut RSVP actuel
  getStatus: (token: string) => 
    apiClient.get<RSVPResponse>(`/rsvp/${token}`),

  // Répondre à l'invitation
  respond: (token: string, data: RSVPResponse) => 
    apiClient.post<RSVPResponse>(`/rsvp/${token}/respond`, data),

  // Mettre à jour une réponse
  update: (token: string, data: Partial<RSVPResponse>) => 
    apiClient.patch<RSVPResponse>(`/rsvp/${token}`, data),
}; 