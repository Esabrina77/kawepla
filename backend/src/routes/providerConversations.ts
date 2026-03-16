import { Router, RequestHandler } from 'express';
import { ProviderConversationController } from '../controllers/providerConversationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware as RequestHandler);

// Créer ou récupérer une conversation
router.post('/', ProviderConversationController.getOrCreateConversation);

// Récupérer les conversations d'un client
router.get('/client', ProviderConversationController.getClientConversations);

// Récupérer les conversations d'un provider
router.get('/provider', ProviderConversationController.getProviderConversations);

// Récupérer une conversation par ID
router.get('/:conversationId', ProviderConversationController.getConversationById);

// Récupérer les messages d'une conversation
router.get('/:conversationId/messages', ProviderConversationController.getMessages);

// Envoyer un message
router.post('/:conversationId/messages', ProviderConversationController.sendMessage);

// Marquer comme lu
router.put('/:conversationId/read', ProviderConversationController.markAsRead);

// Extraire les infos pour pré-remplir le formulaire de réservation
router.get('/:conversationId/booking-info', ProviderConversationController.extractBookingInfo);

export default router;

