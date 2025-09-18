import { useEffect } from 'react';

export const useServiceWorker = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      console.log('Début enregistrement service worker...');
      
      // Vérifier si le service worker est déjà enregistré
      const existingRegistration = await navigator.serviceWorker.getRegistration();
      if (existingRegistration) {
        console.log('Service worker déjà enregistré:', existingRegistration);
        return;
      }
      
      // Enregistrer notre service worker personnalisé
      const registration = await navigator.serviceWorker.register('/sw-notifications.js', {
        scope: '/'
      });
      
      console.log('Service Worker de notifications enregistré:', registration);
      
      // Attendre que le service worker soit activé
      await navigator.serviceWorker.ready;
      console.log('Service worker prêt !');
      
      // Écouter les messages du service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'NAVIGATE') {
          window.location.href = event.data.url;
        }
      });
      
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du service worker:', error);
      // En cas d'erreur, essayer avec le service worker par défaut
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('Service worker par défaut enregistré en fallback');
      } catch (fallbackError) {
        console.error('Erreur fallback service worker:', fallbackError);
      }
    }
  };
}; 