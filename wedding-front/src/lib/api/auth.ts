import { apiClient } from './apiClient';
import { User, TokenResponse, LoginCredentials, RegisterData } from '@/types';

// Types pour l'auth V1 (avec support provider)
export interface RegisterProviderData extends RegisterData {
  role: 'HOST' | 'PROVIDER';
  // Champs spécifiques aux prestataires (optionnels à l'inscription)
  businessName?: string;
  description?: string;
  phone?: string;
  city?: string;
  postalCode?: string;
}

export interface EmailVerificationData {
  email: string;
  code: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export const authApi = {
  // INSCRIPTION (HOST ou PROVIDER)
  async register(data: RegisterProviderData): Promise<{ 
    message: string; 
    user: User; 
    isProvider?: boolean 
  }> {
    return apiClient.post<{ 
      message: string; 
      user: User; 
      isProvider?: boolean 
    }>('/auth/register', data);
  },

  // CONNEXION
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    return apiClient.post<TokenResponse>('/auth/login', credentials);
  },

  // VÉRIFICATION EMAIL
  async sendVerificationCode(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/send-verification-code', { email });
  },

  async verifyEmail(data: EmailVerificationData): Promise<{ message: string; user: User }> {
    return apiClient.post<{ message: string; user: User }>('/auth/verify-email', data);
  },

  // RÉINITIALISATION MOT DE PASSE
  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/forgot-password', data);
  },

  async verifyResetToken(token: string): Promise<{ valid: boolean; message: string }> {
    return apiClient.post<{ valid: boolean; message: string }>('/auth/verify-reset-token', { token });
  },

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/reset-password', data);
  },

  // UTILITAIRES
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const user = this.getCurrentUser();
      return !!(token && user);
    }
    return false;
  },

  isProvider(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'PROVIDER';
  },

  isHost(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'HOST';
  },

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }
};