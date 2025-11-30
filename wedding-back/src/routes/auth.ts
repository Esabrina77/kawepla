import { Router, RequestHandler } from 'express';
import { AuthController } from '@/controllers/authController';
import { createUserSchema, loginSchema } from '@/middleware/validation';
import { validateBody } from '@/middleware/validation';
import { authRateLimiter } from '@/middleware/rateLimiter';

const router = Router();

// Routes publiques avec rate limiting strict
router.post('/register', authRateLimiter as RequestHandler, validateBody(createUserSchema), AuthController.register);
router.post('/login', authRateLimiter as RequestHandler, validateBody(loginSchema), AuthController.login);

// Routes de vérification d'email avec rate limiting
router.post('/send-verification-code', authRateLimiter as RequestHandler, AuthController.sendVerificationCode);
router.post('/verify-email', authRateLimiter as RequestHandler, AuthController.verifyEmail);

// Routes de réinitialisation de mot de passe avec rate limiting
router.post('/forgot-password', authRateLimiter as RequestHandler, AuthController.forgotPassword);
router.post('/reset-password', authRateLimiter as RequestHandler, AuthController.resetPassword);
router.post('/verify-reset-token', authRateLimiter as RequestHandler, AuthController.verifyResetToken);

export default router; 