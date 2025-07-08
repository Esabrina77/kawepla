import { Router } from 'express';
import { RSVPController } from '../controllers/rsvpController';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Schéma de validation pour la réponse RSVP
const rsvpSchema = z.object({
  status: z.enum(['CONFIRMED', 'DECLINED', 'PENDING']),
  numberOfGuests: z.number().min(1),
  message: z.string().optional(),
  attendingCeremony: z.boolean().optional().default(true),
  attendingReception: z.boolean().optional().default(true)
});

// Schéma de validation pour la mise à jour RSVP
const rsvpUpdateSchema = z.object({
  status: z.enum(['CONFIRMED', 'DECLINED', 'PENDING']).optional(),
  numberOfGuests: z.number().min(1).optional(),
  message: z.string().optional(),
  attendingCeremony: z.boolean().optional(),
  attendingReception: z.boolean().optional()
});

/**
 * @route   GET /api/rsvp/:token/invitation
 * @desc    Récupérer les détails de l'invitation avec le token
 * @access  Public
 */
router.get('/:token/invitation', RSVPController.getInvitation);

/**
 * @route   POST /api/rsvp/:token/respond
 * @desc    Répondre à une invitation
 * @access  Public
 */
router.post('/:token/respond', validateBody(rsvpSchema), RSVPController.respond);

/**
 * @route   GET /api/rsvp/:token
 * @desc    Voir le statut d'une réponse RSVP
 * @access  Public
 */
router.get('/:token', RSVPController.getStatus);

/**
 * @route   PATCH /api/rsvp/:token
 * @desc    Mettre à jour une réponse RSVP
 * @access  Public
 */
router.patch('/:token', validateBody(rsvpUpdateSchema), RSVPController.update);

export default router; 