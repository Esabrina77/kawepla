'use client'
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { RateLimitModal } from "@/components/RateLimitModal/RateLimitModal";
import Chatbot from "@/components/Chatbot/Chatbot";
import styles from './extranetLayout.module.css';

export default function ExtranetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user, handleSessionExpired } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Écouter les erreurs de session expirée
  useEffect(() => {
    const handleSessionError = (event: CustomEvent) => {
      if (event.detail?.error === 'Session expirée') {
        handleSessionExpired();
      }
    };

    // Écouter les événements personnalisés d'erreur de session
    window.addEventListener('sessionExpired', handleSessionError as EventListener);
    
    return () => {
      window.removeEventListener('sessionExpired', handleSessionError as EventListener);
    };
  }, [handleSessionExpired]);

  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className={`${styles.layout}`}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1.2rem',
          color: 'var(--text-primary)'
        }}>
          Chargement...
        </div>
      </div>
    );
  }

  // Si pas authentifié, ne rien afficher (redirection en cours)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`${styles.layout}`}>
      {children}
      <RateLimitModal />
      <Chatbot />
    </div>
  );
} 