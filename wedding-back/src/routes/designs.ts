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
router.get('/templates', asyncHandler(authMiddleware), asyncHandler(DesignController.getTemplates));
router.get('/my-designs', asyncHandler(authMiddleware), asyncHandler(DesignController.getUserDesigns));
router.get('/filter', asyncHandler(authMiddleware), asyncHandler(DesignController.getByFilter));
router.get('/:id', asyncHandler(authMiddleware), asyncHandler(DesignController.getById));

// Routes admin (nécessitent le rôle admin) - Création de modèles
router.post('/', asyncHandler(requireAdmin), asyncHandler(DesignController.create));

// Routes utilisateur - Création de designs personnalisés (tous les users authentifiés)
router.post('/personalize', asyncHandler(authMiddleware), asyncHandler(DesignController.create));

// Routes modification/suppression (vérification des droits dans le contrôleur)
router.put('/:id', asyncHandler(authMiddleware), asyncHandler(DesignController.update));
router.delete('/:id', asyncHandler(authMiddleware), asyncHandler(DesignController.delete));

export default router; 