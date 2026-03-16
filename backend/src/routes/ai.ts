import { Router, RequestHandler } from 'express';
import { AIController } from '@/controllers/aiController';
import { authMiddleware } from '@/middleware/auth';
import { checkAILimit } from '@/middleware/aiLimits';
import { aiRateLimiter } from '@/middleware/rateLimiter';

const router = Router();

// Toutes les routes sont protégées, vérifient les limites AI et appliquent le rate limiting
router.post('/generate-checklist', authMiddleware as RequestHandler, aiRateLimiter as RequestHandler, checkAILimit as RequestHandler, AIController.generateChecklist);
router.post('/improve-description', authMiddleware as RequestHandler, aiRateLimiter as RequestHandler, checkAILimit as RequestHandler, AIController.improveDescription);
router.post('/chat', authMiddleware as RequestHandler, aiRateLimiter as RequestHandler, checkAILimit as RequestHandler, AIController.chat);

export default router;

