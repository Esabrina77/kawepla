import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, RegisterProviderData } from '@/lib/api/auth';
import { useNotifications } from './useNotifications';
import { User, TokenResponse } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false
  });

  const router = useRouter();
  const { subscribeToPushNotifications, unsubscribeFromPushNotifications } = useNotifications();

  // Fonction pour nettoyer l'authentification et rediriger
  const clearAuthAndRedirect = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false
    });

    // Rediriger vers la page de login
    router.push('/auth/login');
  }, [router]);

  // Fonction exposée pour gérer l'expiration de session depuis l'extérieur
  const handleSessionExpired = useCallback(() => {
    console.log('🔒 Session expirée détectée, redirection automatique');
    clearAuthAndRedirect();
  }, [clearAuthAndRedirect]);

  // Initialiser l'état d'authentification
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          
          // Vérifier si le token est encore valide
          if (authApi.isAuthenticated()) {
            setAuthState({
              user,
              token,
              isLoading: false,
              isAuthenticated: true
            });
          } else {
            // Token expiré ou invalide
            console.log('Token expiré, nettoyage automatique et redirection');
            clearAuthAndRedirect();
          }
          
        } catch (error) {
          console.error('Erreur lors du parsing des données utilisateur:', error);
          clearAuthAndRedirect();
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, [clearAuthAndRedirect]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });

      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      setAuthState({
        user: response.user,
        token: response.accessToken,
        isLoading: false,
        isAuthenticated: true
      });

      // Rediriger selon le rôle de l'utilisateur (HOST remplace organisateur)
      if (response.user.role === 'ADMIN') {
        router.push('/super-admin/dashboard');
      } else if (response.user.role === 'PROVIDER') {
        router.push('/provider/dashboard');
      } else {
        router.push('/client/dashboard');
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error);
      
      // Retourner l'erreur exacte du serveur
      let errorMessage = 'Email ou mot de passe incorrect';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }, [router]);

  const register = useCallback(async (userData: RegisterProviderData) => {
    try {
      const response = await authApi.register(userData);

      // Ne pas stocker le token ni rediriger automatiquement
      // L'utilisateur doit d'abord vérifier son email
      
      return { 
        success: true, 
        isProvider: response.isProvider,
        user: response.user,
        email: userData.email,
        message: response.message
      };
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      
      // Retourner l'erreur exacte du serveur
      let errorMessage = 'Erreur lors de l\'inscription';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false
    });

    router.push('/');
  }, [router]);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      await authApi.forgotPassword({ email });
      return { success: true };
    } catch (error: any) {
      console.error('Erreur de mot de passe oublié:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur lors de l\'envoi de l\'email' 
      };
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    try {
      await authApi.resetPassword({ token, password });
      return { success: true };
    } catch (error: any) {
      console.error('Erreur de réinitialisation du mot de passe:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur lors de la réinitialisation' 
      };
    }
  }, []);

  const verifyEmail = useCallback(async (email: string, code: string) => {
    try {
      const response = await authApi.verifyEmail({ email, code });
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Erreur de vérification d\'email:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur lors de la vérification' 
      };
    }
  }, []);

  const sendVerificationCode = useCallback(async (email: string) => {
    try {
      const response = await authApi.sendVerificationCode(email);
      return { success: true, message: response.message };
    } catch (error: any) {
      console.error('Erreur d\'envoi du code:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur lors de l\'envoi du code' 
      };
    }
  }, []);

  return {
    user: authState.user,
    token: authState.token,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    sendVerificationCode,
    handleSessionExpired,
    // Utilitaires
    isProvider: authApi.isProvider,
    isHost: authApi.isHost,
    isAdmin: authApi.isAdmin
  };
}; 