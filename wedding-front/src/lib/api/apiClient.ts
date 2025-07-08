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
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      return token ? decodeURIComponent(token) : null;
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
      if (response.status === 401) {
        // Token expiré - rediriger vers login
        if (typeof window !== 'undefined') {
          document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          window.location.href = '/auth/login';
        }
        throw new Error('Session expirée');
      }
      
      const error = await response.json().catch(() => ({ message: 'Erreur serveur' }));
      throw new Error(error.message || 'Une erreur est survenue');
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

  async get<T>(endpoint: string): Promise<T> {
    const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
    const response = await fetch(`${this.baseUrl}${apiEndpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
    const response = await fetch(`${this.baseUrl}${apiEndpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
    const token = this.getAuthToken();
    
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Ne pas définir Content-Type pour FormData - le navigateur le fait automatiquement

    const response = await fetch(`${this.baseUrl}${apiEndpoint}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
    const response = await fetch(`${this.baseUrl}${apiEndpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
    const response = await fetch(`${this.baseUrl}${apiEndpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
    const response = await fetch(`${this.baseUrl}${apiEndpoint}`, {
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
  // Récupérer tous les messages RSVP pour un couple
  getMessages: async (): Promise<RSVPMessage[]> => {
    return apiClient.get<RSVPMessage[]>('/rsvp-messages/rsvp-messages');
  },

  // Marquer un message comme lu
  markAsRead: async (rsvpId: string): Promise<void> => {
    return apiClient.put(`/rsvp-messages/rsvp-messages/${rsvpId}/read`);
  }
}; 