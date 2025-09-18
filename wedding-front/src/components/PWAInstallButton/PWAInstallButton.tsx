'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Si pas de prompt disponible, rediriger vers la page d'accueil
      window.location.href = '/';
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('L\'utilisateur a accepté l\'installation');
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Erreur lors de l\'installation:', err);
    }
  };

  return (
    <Button 
      onClick={handleInstallClick}
      variant="outline"
      title="Installer Kawepla"
    >
      Installer l'application
    </Button>
  );
}; 