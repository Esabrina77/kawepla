import dotenv from 'dotenv';
import { createServer } from 'http';
import app from './app';
import { initializeSocketService } from './services/socketService';
import { NotificationService } from './services/notificationService';
import { PushNotificationService } from './services/pushNotificationService';

// Charger les variables d'environnement
dotenv.config();

const PORT = process.env.PORT || 3013;

// Créer le serveur HTTP
const server = createServer(app);

// Initialiser WebSocket
const socketService = initializeSocketService(server);

// Initialiser le service de notifications avec Socket.IO
NotificationService.initialize(socketService.getIO());

// Initialiser le service de push notifications
PushNotificationService.initialize();

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 WebSocket activé pour la messagerie en temps réel`);
  console.log(`🔔 Service de notifications activé`);
  console.log(`📱 Service de push notifications activé`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
}); 