import { Router, Request, Response, NextFunction } from 'express';
import { PushController } from '../controllers/pushController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Wrappers pour résoudre les types Express
const subscribe = (req: Request, res: Response, next: NextFunction) => {
  PushController.subscribe(req, res, next);
};

const unsubscribe = (req: Request, res: Response, next: NextFunction) => {
  PushController.unsubscribe(req, res, next);
};

const getVapidPublicKey = (req: Request, res: Response, next: NextFunction) => {
  PushController.getVapidPublicKey(req, res, next);
};

// Routes pour les push notifications
router.post('/subscribe', subscribe);
router.delete('/unsubscribe', unsubscribe);
router.get('/vapid-public-key', getVapidPublicKey);

export default router;
