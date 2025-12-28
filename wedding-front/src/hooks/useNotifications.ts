import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/apiClient';

// Client API spécial pour les routes push (sans authentification)
const pushApiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
    const url = `${baseUrl}/api${endpoint}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async post<T>(endpoint: string, data: any): Promise<T> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
    const url = `${baseUrl}/api${endpoint}`;
    
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async delete<T>(endpoint: string): Promise<T> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';
    const url = `${baseUrl}/api${endpoint}`;
    
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
};

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  sound?: boolean;
}

export const useNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Vérifier le support des notifications
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  // Jouer le son de notification
  const playNotificationSound = useCallback(async () => {
    try {
      const audio = new Audio('/notifications/rsvp.mp3');
      await audio.play();
    } catch (error) {
      console.error('❌ Erreur lors de la lecture du son:', error);
    }
  }, []);

  // Demander la permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('❌ Erreur lors de la demande de permission:', error);
      return false;
    }
  }, [isSupported]);

  // S'abonner aux push notifications
  const subscribeToPushNotifications = useCallback(async (): Promise<boolean> => {
    console.log('🔄 Début de l\'abonnement push...');
    console.log('📱 Support:', isSupported);
    console.log('🔐 Permission:', permission);
    
    if (!isSupported || permission !== 'granted') {
      console.log('❌ Notifications non supportées ou permission refusée');
      return false;
    }

    try {
      // Enregistrer le service worker (utiliser sw-notifications.js qui gère les push notifications)
      const registration = await navigator.serviceWorker.register('/sw-notifications.js', {
        scope: '/'
      });
      console.log('✅ Service worker enregistré:', registration);

      // Attendre que le service worker soit actif
      await navigator.serviceWorker.ready;

      // Obtenir la clé VAPID publique
      console.log('🔑 Récupération de la clé VAPID...');
      const { publicKey } = await pushApiClient.get<{ publicKey: string }>('/push/vapid-public-key');
      console.log('🔑 Clé VAPID récupérée:', publicKey ? 'OK' : 'MANQUANTE');
      console.log('🔑 Clé VAPID récupérée:', publicKey ? 'OK' : 'MANQUANTE');

      if (!publicKey) {
        console.error('❌ Clé VAPID non disponible');
        return false;
      }

      // Convertir la clé VAPID
      const vapidPublicKey = urlBase64ToUint8Array(publicKey);

      // S'abonner aux push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey as unknown as ArrayBuffer
      });

      // Envoyer la subscription au serveur
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ Token d\'authentification manquant');
        return false;
      }

      const subscribeResponse = await pushApiClient.post('/push/subscribe', subscription);

      setIsSubscribed(true);
      console.log('✅ Abonnement push réussi');
      return true;

    } catch (error) {
      console.error('❌ Erreur lors de l\'abonnement push:', error);
      return false;
    }
  }, [isSupported, permission]);

  // Se désabonner des push notifications
  const unsubscribeFromPushNotifications = useCallback(async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Informer le serveur
      await pushApiClient.delete('/push/unsubscribe');

      setIsSubscribed(false);
      console.log('✅ Désabonnement push réussi');
      return true;

    } catch (error) {
      console.error('❌ Erreur lors du désabonnement push:', error);
      return false;
    }
  }, []);

  // Vérifier l'état de l'abonnement
  const checkPurchaseStatus = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de l\'abonnement:', error);
      setIsSubscribed(false);
    }
  }, []);

  // Vérifier l'abonnement au chargement
  useEffect(() => {
    if (isSupported && permission === 'granted') {
      checkPurchaseStatus();
    }
  }, [isSupported, permission, checkPurchaseStatus]);

  // Afficher une notification
  const showNotification = useCallback(async (options: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      console.log('❌ Notifications non supportées ou permission refusée');
      return;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag || 'default',
        requireInteraction: options.requireInteraction || false
      });

      // Jouer le son si demandé
      if (options.sound) {
        await playNotificationSound();
      }

      // Fermer automatiquement après 5 secondes
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error('❌ Erreur lors de l\'affichage de la notification:', error);
    }
  }, [isSupported, permission, playNotificationSound]);

  // Notifications spécifiques
  const notifyRSVPConfirmed = useCallback((guestName: string, invitationName: string) => {
    showNotification({
      title: '🎉 RSVP Confirmé !',
      body: `${guestName} a confirmé sa présence pour ${invitationName}`,
      tag: 'rsvp_confirmed',
      sound: true
    });
  }, [showNotification]);

  const notifyRSVPDeclined = useCallback((guestName: string, invitationName: string) => {
    showNotification({
      title: '😔 RSVP Décliné',
      body: `${guestName} a décliné l'invitation pour ${invitationName}`,
      tag: 'rsvp_declined',
      sound: true
    });
  }, [showNotification]);

  const notifyNewGuest = useCallback((guestName: string, invitationName: string) => {
    showNotification({
      title: '👥 Nouvel invité !',
      body: `${guestName} a été ajouté à ${invitationName}`,
      tag: 'new_guest',
      sound: true
    });
  }, [showNotification]);

  const notifyNewMessage = useCallback((guestName: string, invitationName: string) => {
    showNotification({
      title: '💬 Nouveau message !',
      body: `${guestName} a laissé un message pour ${invitationName}`,
      tag: 'new_message',
      sound: true
    });
  }, [showNotification]);

  return {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    checkPurchaseStatus,
    showNotification,
    playNotificationSound,
    notifyRSVPConfirmed,
    notifyRSVPDeclined,
    notifyNewGuest,
    notifyNewMessage
  };
};

// Fonction utilitaire pour convertir la clé VAPID
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray as Uint8Array;
} 