import { Router } from 'express';
import { AuthController } from '@/controllers/authController';
import { validateBody } from '@/middleware/validation';
import { createUserSchema, loginSchema } from '@/utils/validation';

const router = Router();

// Routes publiques
router.post('/register', validateBody(createUserSchema), AuthController.register);
router.post('/login', validateBody(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);

export default router; 