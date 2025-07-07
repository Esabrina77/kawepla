import { Router, Request, Response, NextFunction } from 'express';
import { DesignController } from '../controllers/designController';
import { requireAdmin, authMiddleware } from '../middleware/auth';

const router = Router();

// Helper pour gérer les handlers async
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes publiques (nécessitent authentification)
router.get('/', asyncHandler(authMiddleware), asyncHandler(DesignController.getAll));
router.get('/filter', asyncHandler(authMiddleware), asyncHandler(DesignController.getByFilter));
router.get('/:id', asyncHandler(authMiddleware), asyncHandler(DesignController.getById));

// Routes admin (nécessitent le rôle admin)
router.post('/', asyncHandler(requireAdmin), asyncHandler(DesignController.create));
router.put('/:id', asyncHandler(requireAdmin), asyncHandler(DesignController.update));
router.delete('/:id', asyncHandler(requireAdmin), asyncHandler(DesignController.delete));

export default router; 