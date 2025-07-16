import { Router } from 'express';
import { RSVPController } from '../controllers/rsvpController';
import { ShareableInvitationService } from '../services/shareableInvitationService';
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

// Schéma de validation pour la réponse RSVP partageable
const shareableRSVPSchema = z.object({
  // Infos personnelles
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(8, 'Le numéro de téléphone doit contenir au moins 8 caractères'),
  // RSVP classique
  status: z.enum(['CONFIRMED', 'DECLINED', 'PENDING']),
  numberOfGuests: z.number().min(1),
  message: z.string().optional(),
  attendingCeremony: z.boolean().optional().default(true),
  attendingReception: z.boolean().optional().default(true)
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

/**
 * @route   GET /api/rsvp/shared/:shareableToken/invitation
 * @desc    Récupérer l'invitation via token partageable
 * @access  Public
 */
router.get('/shared/:shareableToken/invitation', async (req, res, next) => {
  try {
    const { shareableToken } = req.params;
    // Pour l'affichage, on ne vérifie pas les limites strictes
    const invitation = await ShareableInvitationService.getInvitationByShareableToken(shareableToken, false);
    res.json(invitation);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/rsvp/shared/:shareableToken/respond
 * @desc    Répondre via lien partageable avec infos personnelles
 * @access  Public
 */
router.post('/shared/:shareableToken/respond', validateBody(shareableRSVPSchema), async (req, res, next) => {
  try {
    const { shareableToken } = req.params;
    // Pour le RSVP, on vérifie les limites strictes
    const result = await RSVPController.createRSVPFromShareableLink(shareableToken, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/rsvp/shared/:shareableToken/status
 * @desc    Obtenir le statut d'une réponse via lien partageable
 * @access  Public
 */
router.get('/shared/:shareableToken/status', async (req, res, next) => {
  try {
    const { shareableToken } = req.params;
    const { phone } = req.query;
    
    if (phone) {
      // Récupérer le statut spécifique d'un invité
      const status = await ShareableInvitationService.getRSVPStatusByShareableToken(shareableToken, phone as string);
      res.json(status);
    } else {
      // Statut général
      const status = await RSVPController.getStatusFromShareableLink(shareableToken);
      res.json(status);
    }
  } catch (error) {
    next(error);
  }
});

export default router; 