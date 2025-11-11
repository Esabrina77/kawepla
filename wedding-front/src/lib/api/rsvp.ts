import { apiClient } from './apiClient';
import { Invitation, RSVPMessage } from '@/types';

// Types pour RSVP
export interface RSVPResponse {
  status: 'CONFIRMED' | 'DECLINED' | 'PENDING';
  message?: string;
  profilePhotoUrl?: string;
  plusOne?: boolean;
  plusOneName?: string;
  dietaryRestrictions?: string;
}

export interface RSVPStatus {
  id: string;
  status: 'CONFIRMED' | 'DECLINED' | 'PENDING';
  message?: string;
  numberOfGuests: number;
  profilePhotoUrl?: string;
  respondedAt?: string;
  plusOne?: boolean;
  plusOneName?: string;
  dietaryRestrictions?: string;
  guest: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  invitation?: {
    id: string;
    eventTitle: string;
    eventType: string;
    eventDate: string;
    eventTime?: string;
    location: string;
    customText?: string;
    moreInfo?: string;
  };
}

export interface ShareableRSVPRequest {
  // Infos personnelles
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  // RSVP
  status: 'CONFIRMED' | 'DECLINED' | 'PENDING';
  message?: string;
  profilePhotoUrl?: string;
  plusOne?: boolean;
  plusOneName?: string;
  dietaryRestrictions?: string;
}

export const rsvpApi = {
  // RSVP CLASSIQUE (avec token personnel)
  async getInvitation(token: string): Promise<{
    invitation: Invitation & {
      design: {
        id: string;
        name: string;
        template: any;
        styles: any;
        variables: any;
        components?: any;
        version?: string;
      };
    };
    guest: {
      id: string;
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      plusOne: boolean;
      plusOneName?: string;
      dietaryRestrictions?: string;
    };
    rsvp?: RSVPStatus;
  }> {
    return apiClient.get(`/rsvp/${token}/invitation`);
  },

  async respond(token: string, response: RSVPResponse): Promise<RSVPStatus> {
    return apiClient.post<RSVPStatus>(`/rsvp/${token}/respond`, response);
  },

  async getStatus(token: string): Promise<RSVPStatus | null> {
    try {
      return await apiClient.get<RSVPStatus>(`/rsvp/${token}`);
    } catch (error) {
      // Si c'est un 404 ou le message spécifique, c'est normal (pas de RSVP encore)
      if (error instanceof Error && (
        error.message.includes('404') || 
        error.message.includes('Aucune réponse RSVP trouvée pour cet invité')
      )) {
        return null;
      }
      // Pour les autres erreurs, les relancer
      throw error;
    }
  },

  async updateResponse(token: string, response: Partial<RSVPResponse>): Promise<RSVPStatus> {
    return apiClient.patch<RSVPStatus>(`/rsvp/${token}`, response);
  },

  // RSVP PARTAGEABLE (avec token partageable)
  async getShareableInvitation(shareableToken: string): Promise<{
    invitation: {
      id: string;
      eventTitle: string;
      eventType: string;
      eventDate: string;
      eventTime?: string;
      location: string;
      customText?: string;
      moreInfo?: string;
      photos: string[];
      design: {
        id: string;
        name: string;
        template: any;
        styles: any;
        variables: any;
      };
    };
    shareableLink: {
      id: string;
      token: string;
      maxUses: number;
      usedCount: number;
      isActive: boolean;
      expiresAt?: string;
    };
  }> {
    return apiClient.get(`/rsvp/shared/${shareableToken}/invitation`);
  },

  async respondToShareable(shareableToken: string, response: ShareableRSVPRequest): Promise<{
    message: string;
    rsvp: RSVPStatus;
    guest: {
      id: string;
      firstName: string;
      lastName: string;
      email?: string;
      phone: string;
      inviteToken: string;
    };
  }> {
    return apiClient.post(`/rsvp/shared/${shareableToken}/respond`, response);
  },

  async getShareableStatus(shareableToken: string, phone?: string): Promise<{
    invitation: {
      eventTitle: string;
      eventType: string;
      eventDate: string;
      location: string;
    };
    shareableLink: {
      token: string;
      maxUses: number;
      usedCount: number;
      isActive: boolean;
    };
    guest?: {
      firstName: string;
      lastName: string;
      phone: string;
      rsvp: {
        status: string;
        respondedAt: string;
      };
    };
  }> {
    const params = phone ? `?phone=${encodeURIComponent(phone)}` : '';
    return apiClient.get(`/rsvp/shared/${shareableToken}/status${params}`);
  },

  // UTILITAIRES
  formatEventDate(dateString: string, timeString?: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    let formatted = date.toLocaleDateString('fr-FR', options);
    
    if (timeString) {
      formatted += ` à ${timeString}`;
    }

    return formatted;
  },

  getStatusLabel(status: string): string {
    const labels = {
      'CONFIRMED': 'Confirmé',
      'DECLINED': 'Décliné',
      'PENDING': 'En attente'
    };
    return labels[status as keyof typeof labels] || status;
  },

  getStatusColor(status: string): string {
    const colors = {
      'CONFIRMED': 'text-green-600',
      'DECLINED': 'text-red-600',
      'PENDING': 'text-yellow-600'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  },

  validatePhone(phone: string): boolean {
    // Validation simple pour numéro français
    const phoneRegex = /^(?:\+33|0)[1-9](?:[0-9]{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  formatPhoneForAPI(phone: string): string {
    // Formate le téléphone pour l'API (supprime espaces, remplace +33 par 0)
    let formatted = phone.replace(/\s/g, '');
    if (formatted.startsWith('+33')) {
      formatted = '0' + formatted.substring(3);
    }
    return formatted;
  }
};