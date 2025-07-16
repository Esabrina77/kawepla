import { Router } from 'express';
import { ShareableInvitationService } from '../services/shareableInvitationService';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Schéma de validation pour la génération de lien partageable
const generateShareableLinkSchema = z.object({
  expiresAt: z.string().datetime().optional()
});

// Appliquer l'authentification à toutes les routes
router.use(authMiddleware as any);

/**
 * Générer un lien partageable
 */
router.post('/:id/generate-shareable-link', validateBody(generateShareableLinkSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { expiresAt } = req.body;

    const invitation = await ShareableInvitationService.generateShareableLink(id, userId, {
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    res.json({
      shareableUrl: `${process.env.FRONTEND_URL || 'http://localhost:3012'}/rsvp/shared/${invitation.shareableToken}`,
      maxUses: invitation.shareableMaxUses,
      usedCount: invitation.shareableUsedCount,
      expiresAt: invitation.shareableExpiresAt,
      remainingGuests: invitation.remainingGuests
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Désactiver le lien partageable (action manuelle de l'organisateur)
 */
router.delete('/token/:token/disable', async (req, res, next) => {
  try {
    const { token } = req.params;
    const userId = (req as any).user.id;

    await ShareableInvitationService.disableShareableLink(token, userId);

    res.json({ message: 'Lien partageable désactivé avec succès' });
  } catch (error) {
    next(error);
  }
});

/**
 * Lister tous les liens partageables d'une invitation
 */
router.get('/:id/shareable-links', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const links = await ShareableInvitationService.listShareableLinks(id, userId);

    res.json(links);
  } catch (error) {
    next(error);
  }
});

/**
 * Statistiques du lien partageable
 */
router.get('/:id/shareable-stats', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const stats = await ShareableInvitationService.getShareableStats(id, userId);

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * Récupérer une invitation via numéro de téléphone ou email
 */
router.get('/guest-invitation/:phoneOrEmail', async (req, res, next) => {
  try {
    const { phoneOrEmail } = req.params;

    const result = await ShareableInvitationService.getInvitationByGuestInfo(phoneOrEmail);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router; 