import { Router } from 'express';
import { GuestController } from '../controllers/guestController';
import { validateBody } from '../middleware/validation';
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
  plusOneName: z.string().optional().nullable(),
  invitationId: z.string().min(1, 'L\'ID de l\'invitation est requis')
});

/**
 * @route   POST /api/guests
 * @desc    Créer un nouvel invité
 * @access  Privé (authentifié)
 */
router.post('/', validateBody(guestSchema), GuestController.create);

/**
 * @route   GET /api/guests/:id
 * @desc    Voir un invité
 * @access  Privé (authentifié)
 */
router.get('/:id', GuestController.getById);

/**
 * @route   PATCH /api/guests/:id
 * @desc    Modifier un invité
 * @access  Privé (authentifié)
 */
router.patch('/:id', validateBody(guestSchema.partial()), GuestController.update);

/**
 * @route   DELETE /api/guests/:id
 * @desc    Supprimer un invité
 * @access  Privé (authentifié)
 */
router.delete('/:id', GuestController.delete);

/**
 * @route   GET /api/invitations/:id/guests
 * @desc    Liste des invités d'une invitation
 * @access  Privé (authentifié)
 */
router.get('/invitations/:id/guests', GuestController.list);

export default router; 