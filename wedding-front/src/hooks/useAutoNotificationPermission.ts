import { useEffect, useRef } from 'react';
import { useNotifications } from './useNotifications';
import { useAuth } from './useAuth';

/**
 * Hook pour demander automatiquement la permission de notification à la connexion
 * Ne redemande pas si la permission est déjà accordée ou refusée
 */
export const useAutoNotificationPermission = () => {
  const { isSupported, permission, requestPermission, subscribeToPushNotifications, isSubscribed } = useNotifications();
  const { isAuthenticated, token } = useAuth();
  const hasRequestedRef = useRef(false);
  const permissionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Vérifier périodiquement si la permission a changé (si l'utilisateur l'a modifiée dans les paramètres du navigateur)
  useEffect(() => {
    if (!isSupported || !isAuthenticated) return;

    // Vérifier la permission toutes les 30 secondes
    permissionCheckIntervalRef.current = setInterval(() => {
      const currentPermission = Notification.permission;
      
      // Si la permission est passée de 'denied' à 'default' ou 'granted', on peut redemander
      if (currentPermission === 'default' && permission === 'denied') {
        console.log('🔄 Permission de notification réinitialisée, on peut redemander');
        hasRequestedRef.current = false;
      }
    }, 30000);

    return () => {
      if (permissionCheckIntervalRef.current) {
        clearInterval(permissionCheckIntervalRef.current);
      }
    };
  }, [isSupported, isAuthenticated, permission]);

  // Demander la permission automatiquement à la connexion
  useEffect(() => {
    if (!isSupported || !isAuthenticated || !token) {
      return;
    }

    // Vérifier la permission réelle du navigateur (peut avoir changé dans les paramètres)
    const currentBrowserPermission = Notification.permission;
    console.log('🔔 État de la permission:', {
      local: permission,
      browser: currentBrowserPermission,
      hasRequested: hasRequestedRef.current,
      isSubscribed
    });

    // Ne pas redemander si on a déjà demandé dans cette session ET que la permission n'a pas changé
    if (hasRequestedRef.current && currentBrowserPermission === permission) {
      // Si la permission est accordée mais pas abonné, s'abonner
      if (currentBrowserPermission === 'granted' && !isSubscribed) {
        console.log('🔔 Permission accordée mais pas abonné, abonnement automatique...');
        subscribeToPushNotifications().then((success) => {
          if (success) {
            console.log('✅ Abonnement automatique réussi');
          } else {
            console.log('⚠️ Échec de l\'abonnement automatique');
          }
        });
      }
      return;
    }

    // Si la permission a changé dans les paramètres du navigateur, réinitialiser
    if (currentBrowserPermission !== permission) {
      console.log('🔄 Permission modifiée dans les paramètres du navigateur, réinitialisation');
      hasRequestedRef.current = false;
    }

    // Ne pas redemander si la permission est déjà accordée
    if (currentBrowserPermission === 'granted') {
      hasRequestedRef.current = true;
      
      // S'abonner automatiquement aux push notifications si pas déjà abonné
      if (!isSubscribed) {
        console.log('🔔 Permission déjà accordée, abonnement automatique aux push notifications...');
        subscribeToPushNotifications().then((success) => {
          if (success) {
            console.log('✅ Abonnement automatique réussi');
          } else {
            console.log('⚠️ Échec de l\'abonnement automatique');
          }
        });
      }
      return;
    }

    // Ne pas redemander si la permission est refusée
    if (currentBrowserPermission === 'denied') {
      hasRequestedRef.current = true;
      console.log('⚠️ Permission refusée, on ne redemande pas');
      return;
    }

    // Si la permission est 'default', demander automatiquement après un court délai
    if (currentBrowserPermission === 'default' && !hasRequestedRef.current) {
      console.log('🔔 Demande automatique de permission de notification...');
      
      // Attendre 2 secondes après la connexion pour une meilleure UX
      const timeoutId = setTimeout(async () => {
        try {
          const granted = await requestPermission();
          hasRequestedRef.current = true;
          
          if (granted) {
            console.log('✅ Permission accordée, abonnement automatique aux push notifications...');
            // S'abonner automatiquement aux push notifications
            const subscribed = await subscribeToPushNotifications();
            if (subscribed) {
              console.log('✅ Abonnement automatique réussi');
            } else {
              console.log('⚠️ Échec de l\'abonnement automatique');
            }
          } else {
            console.log('⚠️ Permission refusée par l\'utilisateur');
          }
        } catch (error) {
          console.error('❌ Erreur lors de la demande de permission:', error);
          hasRequestedRef.current = true;
        }
      }, 2000);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [isSupported, isAuthenticated, token, permission, requestPermission, subscribeToPushNotifications, isSubscribed]);

  // Réinitialiser le flag si l'utilisateur se déconnecte
  useEffect(() => {
    if (!isAuthenticated) {
      hasRequestedRef.current = false;
    }
  }, [isAuthenticated]);
};

