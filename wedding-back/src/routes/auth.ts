import { Router } from 'express';
import { AuthController } from '@/controllers/authController';
import { createUserSchema, loginSchema } from '@/middleware/validation';
import { validateBody } from '@/middleware/validation';

const router = Router();

// Routes publiques
router.post('/register', validateBody(createUserSchema), AuthController.register);
router.post('/login', validateBody(loginSchema), AuthController.login);

// Routes de vérification d'email
router.post('/send-verification-code', AuthController.sendVerificationCode);
router.post('/verify-email', AuthController.verifyEmail);

export default router; 