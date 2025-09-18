// Import du service worker généré par next-pwa
try {
  importScripts('./sw.js');
  console.log('Service worker next-pwa chargé avec succès');
} catch (error) {
  console.log('Service worker next-pwa non trouvé, utilisation du service worker de notifications uniquement');
}

// Service Worker pour les notifications push
self.addEventListener('push', function(event) {
  console.log('Push event reçu:', event);
  
  let notificationData = {
    title: 'Kawepla',
    body: 'Vous avez reçu une nouvelle notification',
    icon: '/icons/logo-192.png',
    badge: '/icons/logo-192.png',
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
        icon: '/icons/logo-192.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/icons/logo-192.png'
      }
    ]
  };

  if (event.data) {
    try {
      const data = event.data.json();
      console.log('Données de notification reçues:', data);
      
      // Personnaliser la notification selon le type
      switch (data.type) {
        case 'new_message':
          notificationData.title = 'Nouveau message';
          notificationData.body = `${data.senderName}: ${data.message}`;
          notificationData.data.url = '/client/discussions';
          break;
          
        case 'rsvp_response':
          notificationData.title = 'Nouvelle réponse RSVP';
          notificationData.body = `${data.guestName} a répondu à votre invitation`;
          notificationData.data.url = '/client/invitations';
          break;
          
        case 'invitation_published':
          notificationData.title = 'Invitation publiée';
          notificationData.body = 'Votre invitation a été publiée avec succès';
          notificationData.data.url = '/client/invitations';
          break;
          
        case 'guest_added':
          notificationData.title = 'Nouvel invité';
          notificationData.body = `${data.guestName} a été ajouté à votre liste d'invités`;
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
          notificationData.data.url = data.url || '/';
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
self.addEventListener('notificationclick', function(event) {
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
    }).then(function(clientList) {
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
self.addEventListener('notificationclose', function(event) {
  console.log('Notification fermée:', event.notification.tag);
});

// Gestion des messages du client principal
self.addEventListener('message', function(event) {
  console.log('Message reçu dans SW:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Installation du service worker
self.addEventListener('install', function(event) {
  console.log('Service Worker de notifications installé');
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', function(event) {
  console.log('Service Worker de notifications activé');
  event.waitUntil(self.clients.claim());
});

console.log('Service Worker de notifications chargé'); 