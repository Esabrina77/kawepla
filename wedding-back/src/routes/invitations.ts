import { Router, RequestHandler } from 'express';
import { InvitationController } from '../controllers/invitationController';
import { GuestController, uploadMiddleware } from '../controllers/guestController';
import { validateBody } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';
import { checkInvitationLimit, checkGuestLimit } from '../middleware/subscriptionLimits';
import { validateGuestCreation, validateGuestUpdate } from '../middleware/guestValidation';

const router = Router();


// Route publique (sans authentification)
router.get('/:id', InvitationController.getById);

// Appliquer l'authentification aux routes protégées
router.use(authMiddleware as RequestHandler);

// Routes de base (protégées)
router.get('/', InvitationController.getUserInvitations);
router.get('/active', InvitationController.getActiveInvitation);
router.post('/', checkInvitationLimit, InvitationController.create);

// Routes spécifiques avec ID (protégées)
router.get('/:id/stats', InvitationController.stats);
router.get('/:id/export', InvitationController.exportCSV);
router.post('/:id/publish', InvitationController.publish);
router.post('/:id/archive', InvitationController.archive);

// Routes pour les invités (protégées)
router.get('/:id/guests', GuestController.list);
router.get('/:id/guests/statistics', GuestController.statistics);
router.get('/:id/guests/:guestId', GuestController.getById);
router.patch('/:id/guests/:guestId', validateGuestUpdate, (req, res, next) => {
  req.params.id = req.params.guestId; // Pour que le controller reçoive l'ID de l'invité
  GuestController.update(req, res, next);
});
router.delete('/:id/guests/:guestId', (req, res, next) => {
  req.params.id = req.params.guestId; // Pour que le controller reçoive l'ID de l'invité
  GuestController.delete(req, res, next);
});
router.post('/:id/guests/preview-import', uploadMiddleware, (req, res, next) => {
  req.body.invitationId = req.params.id;
  GuestController.previewImport(req, res, next);
});
router.post('/:id/guests/bulk-import', uploadMiddleware, (req, res, next) => {
  req.body.invitationId = req.params.id;
  GuestController.bulkImport(req, res, next);
});
router.post('/:id/guests', checkGuestLimit, validateGuestCreation, (req, res, next) => {
  req.body.invitationId = req.params.id;
  GuestController.create(req, res, next);
});
router.post('/:id/guests/send-all', (req, res, next) => {
  req.body.invitationId = req.params.id;
  GuestController.sendAllInvitations(req, res, next);
});

// Routes de modification (protégées)
router.put('/:id', InvitationController.update);
router.delete('/:id', InvitationController.delete);

export default router; 