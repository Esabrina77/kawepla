import express, { RequestHandler } from 'express';
import { NewsletterController } from '../controllers/newsletterController';
import { authMiddleware, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Toutes les routes nécessitent une authentification admin
router.use(authMiddleware as RequestHandler);
router.use(requireAdmin as RequestHandler);

// CRUD des newsletters
router.get('/', NewsletterController.getNewsletters);
router.post('/', NewsletterController.createNewsletter);

// Gestion des utilisateurs cibles (AVANT les routes avec :id)
router.get('/target-users', NewsletterController.getTargetUsers);

// Routes avec paramètre ID (APRÈS les routes spécifiques)
router.get('/:id', NewsletterController.getNewsletterById);
router.put('/:id', NewsletterController.updateNewsletter);
router.delete('/:id', NewsletterController.deleteNewsletter);

// Actions spécifiques
router.post('/:id/send', NewsletterController.sendNewsletter);
router.post('/:id/schedule', NewsletterController.scheduleNewsletter);
router.post('/:id/cancel', NewsletterController.cancelNewsletter);
router.get('/:id/preview', NewsletterController.previewNewsletter);

// Statistiques
router.get('/:id/stats', NewsletterController.getNewsletterStats);
router.get('/:id/recipients', NewsletterController.getNewsletterRecipients);

export default router;
    