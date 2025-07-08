import { Router } from 'express';
import { InvitationController } from '../controllers/invitationController';
import { GuestController, uploadMiddleware } from '../controllers/guestController';
import { validateInvitation, validateBody } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Schéma de validation pour un invité
const guestSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  isVIP: z.boolean().default(false),
  dietaryRestrictions: z.string().optional().nullable(),
  plusOne: z.boolean().default(false),
  plusOneName: z.string().optional().nullable()
});

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

// Routes pour les invités d'une invitation
router.get('/:id/guests', GuestController.list);
router.get('/:id/guests/statistics', GuestController.statistics);

// Créer un invité pour une invitation
router.post('/:id/guests', validateBody(guestSchema), (req, res, next) => {
  // Ajouter l'invitationId aux données
  req.body.invitationId = req.params.id;
  GuestController.create(req, res, next);
});

// Gestion individuelle des invités
router.get('/:id/guests/:guestId', (req, res, next) => {
  // Passer l'ID de l'invité comme paramètre principal
  req.params.id = req.params.guestId;
  GuestController.getById(req, res, next);
});

router.patch('/:id/guests/:guestId', validateBody(guestSchema.partial()), (req, res, next) => {
  req.params.id = req.params.guestId;
  GuestController.update(req, res, next);
});

router.delete('/:id/guests/:guestId', (req, res, next) => {
  req.params.id = req.params.guestId;
  GuestController.delete(req, res, next);
});

// Actions en masse
router.post('/:id/guests/send-all', (req, res, next) => {
  (req.params as any).invitationId = req.params.id;
  GuestController.sendAllInvitations(req, res, next);
});

router.post('/:id/guests/preview-import', uploadMiddleware, (req, res, next) => {
  (req.params as any).invitationId = req.params.id;
  GuestController.previewImport(req, res, next);
});

router.post('/:id/guests/bulk-import', uploadMiddleware, (req, res, next) => {
  (req.params as any).invitationId = req.params.id;
  GuestController.bulkImport(req, res, next);
});

router.post('/:id/guests/bulk-send', (req, res, next) => {
  (req.params as any).invitationId = req.params.id;
  GuestController.bulkSendAfterImport(req, res, next);
});

export default router; 