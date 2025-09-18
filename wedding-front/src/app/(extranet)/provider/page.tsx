'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProviderProfile } from '@/hooks/useProviderProfile';
import { useAuth } from '@/hooks/useAuth';

export default function ProviderPage() {
  const router = useRouter();
  const { profile, loading } = useProviderProfile();
  const { user } = useAuth();

  useEffect(() => {
    if (loading) return; // Attendre le chargement

    // Vérifier le rôle utilisateur
    if (user && user.role !== 'PROVIDER') {
      router.push('/');
      return;
    }

    // Rediriger selon l'état du profil
    if (profile) {
      router.push('/provider/dashboard');
    } else {
      router.push('/provider/setup');
    }
  }, [profile, loading, user, router]);

  // Affichage de chargement
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'var(--bg-primary)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--luxury-champagne-gold)',
          borderTop: '3px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}></div>
        <p style={{ color: 'var(--text-secondary)' }}>Chargement...</p>
      </div>
    </div>
  );
}
