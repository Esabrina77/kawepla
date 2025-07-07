import { Router } from 'express';
import { InvitationController } from '../controllers/invitationController';
import { validateInvitation } from '../middleware/validation';

const router = Router();

// Routes pour récupérer les invitations
router.get('/', InvitationController.getUserInvitations);
router.get('/active', InvitationController.getActiveInvitation);

// Routes publiques
router.get('/:id', InvitationController.getById);

// Routes CRUD
router.post('/', validateInvitation(false), InvitationController.create);
router.patch('/:id', validateInvitation(true), InvitationController.update);
router.delete('/:id', InvitationController.delete);

// Routes additionnelles
router.get('/:id/stats', InvitationController.stats);
router.get('/:id/export', InvitationController.exportCSV);
router.post('/:id/publish', InvitationController.publish);
router.post('/:id/archive', InvitationController.archive);

export default router; 