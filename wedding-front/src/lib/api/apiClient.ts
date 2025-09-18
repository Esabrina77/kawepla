import { RSVPMessage } from '@/types';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      // Utiliser localStorage au lieu des cookies
      return localStorage.getItem('token');
    }
    return null;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // Essayer de récupérer le message d'erreur du serveur
      let errorMessage = 'Une erreur est survenue';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Si on ne peut pas parser le JSON, utiliser le message par défaut
      }
      
      if (response.status === 401) {
        // Pour les erreurs 401, nettoyer le localStorage mais préserver le message d'erreur
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        
        // Si c'est une erreur d'authentification (login/register), préserver le message
        // Sinon, utiliser "Session expirée" pour les autres cas
        const url = response.url;
        if (url && (url.includes('/auth/login') || url.includes('/auth/register'))) {
          throw new Error(errorMessage);
        } else {
          // Émettre un événement personnalisé pour la session expirée
          if (typeof window !== 'undefined') {
            const sessionExpiredEvent = new CustomEvent('sessionExpired', {
              detail: { error: 'Session expirée' }
            });
            window.dispatchEvent(sessionExpiredEvent);
          }
          throw new Error('Session expirée');
        }
      }
      
      throw new Error(errorMessage);
    }

    // Pour les réponses 204 No Content, ne pas essayer de parser du JSON
    if (response.status === 204) {
      return {} as T;
    }

    // Vérifier si la réponse a du contenu
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    // Si pas de contenu JSON, retourner un objet vide
    return {} as T;
  }

  private buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const apiEndpoint = cleanEndpoint.startsWith('/api') ? cleanEndpoint : `/api${cleanEndpoint}`;
    return `${this.baseUrl}${apiEndpoint}`;
  }

  async get<T>(endpoint: string): Promise<T> {
    const url = this.buildUrl(endpoint);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = this.buildUrl(endpoint);
    const token = this.getAuthToken();
    
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Ne pas définir Content-Type pour FormData - le navigateur le fait automatiquement

    const response = await fetch(url, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const url = this.buildUrl(endpoint);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient(); 

// Messages RSVP
export const rsvpMessagesApi = {
  // Récupérer tous les messages RSVP pour un organisateur
  getMessages: async (): Promise<RSVPMessage[]> => {
    return apiClient.get<RSVPMessage[]>('/rsvp-messages/rsvp-messages');
  },

  // Marquer un message comme lu
  markAsRead: async (rsvpId: string): Promise<void> => {
    return apiClient.put(`/rsvp-messages/rsvp-messages/${rsvpId}/read`);
  }
}; 