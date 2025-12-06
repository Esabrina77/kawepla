// Service Worker pour les notifications push
self.addEventListener('push', function (event) {
  const options = {
    body: 'Vous avez reçu une nouvelle notification',
    icon: '/icons/android-chrome-192x192.png',
    badge: '/icons/android-chrome-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
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

      // Personnaliser la notification selon le type
      switch (data.type) {
        case 'new_message':
          options.title = 'Nouveau message';
          options.body = `${data.senderName}: ${data.message}`;
          options.data.url = '/client/discussions';
          break;

        case 'rsvp_response':
          options.title = 'Nouvelle réponse RSVP';
          options.body = `${data.guestName} a répondu à votre invitation`;
          options.data.url = '/client/invitations';
          break;

        case 'invitation_published':
          options.title = 'Invitation publiée';
          options.body = 'Votre invitation a été publiée avec succès';
          options.data.url = '/client/invitations';
          break;

        case 'guest_added':
          options.title = 'Nouvel invité';
          options.body = `${data.guestName} a été ajouté à votre liste d'invités`;
          options.data.url = '/client/guests';
          break;

        default:
          options.title = data.title || 'Kawepla';
          options.body = data.body || 'Nouvelle notification';
          options.data.url = data.url || '/';
      }

      // Ajouter les données personnalisées
      options.data = { ...options.data, ...data };

    } catch (error) {
      console.error('Error parsing notification data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification('Kawepla', options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', function (event) {
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
      // Vérifier si l'app est déjà ouverte
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
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
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Gestion de la fermeture des notifications
self.addEventListener('notificationclose', function (event) {
  console.log('Notification fermée:', event.notification.tag);

  // Optionnel : envoyer une statistique au serveur
  // fetch('/api/notifications/closed', {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     notificationId: event.notification.data?.id
  //   })
  // });
});

// Synchronisation en arrière-plan pour les notifications
self.addEventListener('sync', function (event) {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Synchroniser les données si nécessaire
      syncNotifications()
    );
  }
});

async function syncNotifications() {
  try {
    // Récupérer les notifications en attente
    const response = await fetch('/api/notifications/pending');
    const notifications = await response.json();

    // Afficher les notifications en attente
    notifications.forEach(notification => {
      self.registration.showNotification(notification.title, {
        body: notification.body,
        icon: '/icons/logo-192.png',
        badge: '/icons/logo-192.png',
        data: notification.data
      });
    });
  } catch (error) {
    console.error('Error syncing notifications:', error);
  }
}

// Gestion des messages du client principal
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 