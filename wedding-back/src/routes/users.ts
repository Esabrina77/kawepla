import { Router, RequestHandler } from 'express';
import { UserController } from '../controllers/userController';

const router = Router();

// Routes utilisateur
router.get('/me', UserController.getProfile as RequestHandler);
router.patch('/me', UserController.updateProfile as RequestHandler);
router.delete('/me', UserController.deleteProfile as RequestHandler);

// Routes admin
router.get('/', UserController.list as RequestHandler);
router.get('/:id', UserController.getById as RequestHandler);
router.patch('/:id', UserController.update as RequestHandler);
router.delete('/:id', UserController.delete as RequestHandler);

export default router; 