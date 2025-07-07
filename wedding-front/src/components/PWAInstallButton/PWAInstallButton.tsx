'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/Button/Button';

export const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Vérifie si l'app est déjà installée
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsInstallable(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('L\'utilisateur a accepté l\'installation');
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Erreur lors de l\'installation:', err);
    }
  };

  if (!isInstallable) return null;

  return (
    <Button 
      onClick={handleInstallClick}
      variant="outline"
      size="small"
      title="Installer KaWePla"
    >
      Installer l'application
    </Button>
  );
}; 