// users.ts
import { Router, RequestHandler } from 'express';
import { UserController } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Routes utilisateur
router.get('/me', UserController.getProfile as RequestHandler);
router.patch('/me', UserController.updateProfile as RequestHandler);
router.delete('/me', UserController.deleteProfile as RequestHandler);

// Route admin pour les statistiques - AVANT / pour éviter les conflits
router.get('/stats', UserController.getAdminStats as RequestHandler);

// Routes admin pour les invitations - AVANT / pour éviter les conflits
router.get('/invitations', UserController.getAdminInvitations as RequestHandler);
router.get('/invitations/:id', UserController.getAdminInvitationDetail as RequestHandler);
router.get('/invitations/:id/design', UserController.getAdminInvitationWithDesign as RequestHandler);

// Routes admin pour gestion utilisateurs
router.get('/', UserController.list as RequestHandler);
router.get('/:id', UserController.getById as RequestHandler);
router.patch('/:id', UserController.update as RequestHandler);
router.delete('/:id', UserController.delete as RequestHandler);

export default router; 