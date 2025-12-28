import { useEffect } from 'react';

export const useServiceWorker = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      console.log('🔄 Début enregistrement service worker...');
      
      // Récupérer toutes les registrations existantes
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      // Désinscrire tous les service workers existants pour éviter les conflits
      for (const registration of registrations) {
        console.log('🗑️ Désinscription du service worker existant:', registration.scope);
        await registration.unregister();
      }
      
      // Attendre un peu pour que la désinscription soit complète
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Enregistrer notre service worker personnalisé
      console.log('📱 Enregistrement de sw-notifications.js...');
      const registration = await navigator.serviceWorker.register('/sw-notifications.js', {
        scope: '/',
        updateViaCache: 'none' // Toujours vérifier les mises à jour
      });
      
      console.log('✅ Service Worker de notifications enregistré:', registration);
      console.log('📋 Scope:', registration.scope);
      console.log('📋 Active:', registration.active?.scriptURL);
      
      // Attendre que le service worker soit activé
      await navigator.serviceWorker.ready;
      console.log('✅ Service worker prêt et actif !');
      
      // Vérifier l'état du service worker
      if (registration.active) {
        console.log('✅ Service worker actif:', registration.active.scriptURL);
      } else if (registration.installing) {
        console.log('⏳ Service worker en cours d\'installation...');
      } else if (registration.waiting) {
        console.log('⏳ Service worker en attente...');
      }
      
      // Écouter les messages du service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📨 Message reçu du service worker:', event.data);
        if (event.data.type === 'NAVIGATE') {
          window.location.href = event.data.url;
        }
      });
      
      // Écouter les erreurs du service worker
      registration.addEventListener('updatefound', () => {
        console.log('🔄 Mise à jour du service worker détectée');
      });
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement du service worker:', error);
      console.error('Détails:', error instanceof Error ? error.message : error);
    }
  };
}; 