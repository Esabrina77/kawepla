import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { User, LoginCredentials, RegisterData } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Charger l'utilisateur depuis les cookies au montage
    const loadUser = () => {
      try {
        const currentUser = authApi.getUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Erreur lors du chargement de l\'utilisateur:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authApi.login({ email, password });
      
      if (response.user) {
        setUser(response.user);
        
        // Attendre que les cookies soient définis
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Rediriger en fonction du rôle
        const redirectPath = response.user.role === 'ADMIN' 
          ? '/super-admin/dashboard'
          : '/client/dashboard';
          
        router.push(redirectPath);
        
        return response;
      } else {
        throw new Error('Réponse de connexion invalide');
      }
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      
      // Vérifier si c'est une erreur de vérification d'email
      if (error.message && error.message.includes('vérifier votre email')) {
        setError(error.message);
        // Relancer l'erreur avec plus d'informations
        const emailVerificationError = new Error(error.message);
        (emailVerificationError as any).emailNotVerified = true;
        throw emailVerificationError;
      } else {
        setError(error.message || 'Erreur lors de la connexion');
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authApi.register(data);
      
      if (response.user) {
        setUser(response.user);
        window.location.href = '/client/dashboard';
      }
      
      return response;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Erreur lors de l\'inscription');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setError(null);
      setLoading(true);
      await authApi.forgotPassword(email);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Erreur lors de l\'envoi du lien de réinitialisation');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyResetToken = async (token: string) => {
    try {
      setError(null);
      setLoading(true);
      await authApi.verifyResetToken(token);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Token invalide ou expiré');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      setError(null);
      setLoading(true);
      await authApi.resetPassword(token, newPassword);
      router.push('/auth/login?message=password-reset-success');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Erreur lors de la réinitialisation du mot de passe');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const updatedUser = await authApi.fetchUser();
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement de l\'utilisateur:', error);
      return null;
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    verifyResetToken,
    resetPassword,
    refreshUser,
    isAuthenticated: authApi.isAuthenticated(),
    isAdmin: user?.role === 'ADMIN',
    isCouple: user?.role === 'COUPLE',
    token: authApi.getToken(),
  };
} 