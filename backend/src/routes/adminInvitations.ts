import { Router } from 'express';
import { InvitationController } from '../controllers/invitationController';

const router = Router();

// Routes admin pour les invitations
router.get('/', InvitationController.getAllInvitations);
router.get('/:id', InvitationController.getInvitationByIdAdmin);
router.delete('/:id', InvitationController.deleteInvitationAdmin);

export default router;
