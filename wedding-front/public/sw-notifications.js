// IMPORTANT : Ne PAS importer sw.js en production
// sw.js contient workbox qui essaie de precache des fichiers qui n'existent pas (404)
// Cela fait échouer le service worker et le rend "redundant"
// 
// En production, on utilise uniquement sw-notifications.js pour les push notifications
// Le cache est géré par Next.js, pas par workbox

// Désactiver complètement l'import de sw.js en production
// Si vous avez besoin de workbox, configurez-le séparément
console.log('📱 Service Worker de notifications chargé (sans workbox)');

// Service Worker pour les notifications push
self.addEventListener('push', function (event) {
  console.log('Push event reçu:', event);

  let notificationData = {
    title: 'Kawepla',
    body: 'Vous avez reçu une nouvelle notification',
    icon: '/icons/android-chrome-192x192.png',
    badge: '/icons/android-chrome-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: '/'
    },
    actions: [
      {
        action: 'explore',
        title: 'Voir',
        icon: '/icons/android-chrome-192x192.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/icons/android-chrome-192x192.png'
      }
    ]
  };

  if (event.data) {
    try {
      const data = event.data.json();
      console.log('Données de notification reçues:', data);

      // Personnaliser la notification selon le type
      // Utiliser directement title et body du backend si présents
      if (data.title && data.body) {
        notificationData.title = data.title;
        notificationData.body = data.body;
      } else {
        // Fallback sur les types spécifiques
        switch (data.type) {
          case 'new_message':
            notificationData.title = '💬 Nouveau message';
            notificationData.body = `${data.senderName || 'Un invité'}: ${data.message || 'Nouveau message'}`;
            notificationData.data.url = '/client/discussions';
            break;

          case 'rsvp_confirmed':
            notificationData.title = data.title || '🎉 RSVP Confirmé !';
            notificationData.body = data.body || `${data.guestName || 'Un invité'} a confirmé sa présence`;
            notificationData.data.url = data.data?.invitationId ? `/client/invitations/${data.data.invitationId}` : '/client/invitations';
            break;

          case 'rsvp_declined':
            notificationData.title = data.title || '😔 RSVP Refusé';
            notificationData.body = data.body || `${data.guestName || 'Un invité'} a décliné l'invitation`;
            notificationData.data.url = data.data?.invitationId ? `/client/invitations/${data.data.invitationId}` : '/client/invitations';
            break;

          case 'rsvp_response':
            notificationData.title = 'Nouvelle réponse RSVP';
            notificationData.body = `${data.guestName || 'Un invité'} a répondu à votre invitation`;
            notificationData.data.url = '/client/invitations';
            break;

          case 'new_guest':
            notificationData.title = data.title || '👥 Nouvel invité';
            notificationData.body = data.body || `${data.guestName || 'Un invité'} a été ajouté à votre liste d'invités`;
            notificationData.data.url = data.data?.invitationId ? `/client/invitations/${data.data.invitationId}` : '/client/invitations';
            break;

          case 'invitation_published':
            notificationData.title = 'Invitation publiée';
            notificationData.body = 'Votre invitation a été publiée avec succès';
            notificationData.data.url = '/client/invitations';
            break;

          case 'guest_added':
            notificationData.title = 'Nouvel invité';
            notificationData.body = `${data.guestName || 'Un invité'} a été ajouté à votre liste d'invités`;
            notificationData.data.url = '/client/guests';
            break;

          case 'test':
            notificationData.title = data.title || 'Test de notification';
            notificationData.body = data.body || 'Ceci est un test de notification push';
            notificationData.data.url = data.url || '/client/dashboard';
            break;

          default:
            notificationData.title = data.title || 'Kawepla';
            notificationData.body = data.body || 'Nouvelle notification';
            notificationData.data.url = data.url || data.data?.url || '/';
        }
      }

      // Ajouter les données personnalisées
      notificationData.data = { ...notificationData.data, ...data };

    } catch (error) {
      console.error('Erreur lors du parsing des données de notification:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', function (event) {
  console.log('Clic sur notification:', event);
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function (clientList) {
      console.log('Clients trouvés:', clientList.length);

      // Vérifier si l'app est déjà ouverte
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          console.log('App déjà ouverte, navigation vers:', urlToOpen);
          // Naviguer vers l'URL appropriée
          client.postMessage({
            type: 'NAVIGATE',
            url: urlToOpen
          });
          return client.focus();
        }
      }

      // Ouvrir une nouvelle fenêtre si aucune n'est ouverte
      if (clients.openWindow) {
        console.log('Ouverture nouvelle fenêtre:', urlToOpen);
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Gestion de la fermeture des notifications
self.addEventListener('notificationclose', function (event) {
  console.log('Notification fermée:', event.notification.tag);
});

// Gestion des messages du client principal
self.addEventListener('message', function (event) {
  console.log('Message reçu dans SW:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Installation du service worker
self.addEventListener('install', function (event) {
  console.log('✅ Service Worker de notifications installé');
  console.log('📍 Scope:', self.registration?.scope || 'unknown');
  console.log('📍 URL:', self.location.href);
  
  // Forcer l'activation immédiate sans attendre
  event.waitUntil(
    self.skipWaiting().then(() => {
      console.log('✅ skipWaiting() exécuté');
    }).catch((error) => {
      console.error('❌ Erreur lors de skipWaiting():', error);
    })
  );
});

// Activation du service worker
self.addEventListener('activate', function (event) {
  console.log('✅ Service Worker de notifications activé');
  console.log('📍 Scope:', self.registration?.scope || 'unknown');
  console.log('📍 URL:', self.location.href);
  
  // Réclamer tous les clients immédiatement
  event.waitUntil(
    Promise.all([
      // Réclamer les clients
      self.clients.claim().then(() => {
        console.log('✅ clients.claim() exécuté - Service worker contrôle maintenant tous les clients');
      }).catch((error) => {
        console.error('❌ Erreur lors de clients.claim():', error);
      }),
      // Nettoyer les anciens caches si nécessaire
      caches.keys().then(cacheNames => {
        const oldCaches = cacheNames.filter(cacheName => cacheName.startsWith('old-'));
        if (oldCaches.length > 0) {
          console.log('🗑️ Suppression des caches obsolètes:', oldCaches);
          return Promise.all(
            oldCaches.map(cacheName => caches.delete(cacheName))
          );
        }
        return Promise.resolve();
      }).catch((error) => {
        console.error('❌ Erreur lors du nettoyage des caches:', error);
      })
    ]).then(() => {
      console.log('✅ Service Worker de notifications prêt à recevoir des push notifications');
    }).catch((error) => {
      console.error('❌ Erreur lors de l\'activation:', error);
    })
  );
}); 