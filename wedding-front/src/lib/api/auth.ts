import { LoginCredentials, RegisterData, TokenResponse, User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax; secure=${window.location.protocol === 'https:'}`;
  console.log(`Cookie ${name} set:`, value);
};

export const authApi = {
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const apiUrl = `${API_URL}/api/auth/login`;
    console.log('Sending login request to:', apiUrl);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la connexion');
    }

    const data = await response.json();
    console.log('Login response:', data);
    
    // Stockage sécurisé des informations
    if (data.accessToken) {
      setCookie('token', data.accessToken);
    } else {
      console.error('No accessToken in response');
    }
    
    if (data.user) {
      setCookie('user', JSON.stringify(data.user));
    } else {
      console.error('No user in response');
    }

    return data;
  },

  async register(data: RegisterData): Promise<TokenResponse> {
    const apiUrl = `${API_URL}/api/auth/register`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de l\'inscription');
    }

    const authData = await response.json();
    
    if (authData.accessToken) {
      setCookie('token', authData.accessToken);
    }
    
    if (authData.user) {
      setCookie('user', JSON.stringify(authData.user));
    }

    return authData;
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
    if (!match) return null;
    try {
      return decodeURIComponent(match[2]);
    } catch {
      return null;
    }
  },

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )user=([^;]+)'));
    if (!match) return null;
    try {
      return JSON.parse(decodeURIComponent(match[2]));
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  async logout() {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  }
}; 