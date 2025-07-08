/**
 * Routes pour la messagerie
 */
import { Router, RequestHandler } from 'express';
import { MessageController } from '../controllers/messageController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware as RequestHandler);

// Routes pour les conversations
router.get('/conversations/admin', MessageController.getAdminConversations as RequestHandler);
router.get('/conversations/:invitationId', MessageController.getOrCreateConversation as RequestHandler);
router.patch('/conversations/:conversationId/assign', MessageController.assignAdmin as RequestHandler);
router.patch('/conversations/:conversationId/archive', MessageController.archiveConversation as RequestHandler);
router.patch('/conversations/:conversationId/restore', MessageController.restoreConversation as RequestHandler);

// Routes pour les messages
router.get('/conversations/:conversationId/messages', MessageController.getMessages as RequestHandler);
router.post('/conversations/:conversationId/messages', MessageController.sendMessage as RequestHandler);
router.patch('/conversations/:conversationId/read', MessageController.markAsRead as RequestHandler);
router.get('/conversations/:conversationId/search', MessageController.searchMessages as RequestHandler);

// Route pour les notifications
router.get('/unread-count', MessageController.getUnreadCount as RequestHandler);

export default router; 