import { Request, Response, NextFunction } from 'express';
import { PushNotificationService } from '../services/pushNotificationService';
import { JWTService } from '../utils/jwt';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string()
  })
});

// Fonction d'authentification intégrée
const authenticate = async (req: Request): Promise<{ id: string; email: string; role: string } | null> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const payload = JWTService.verifyAccessToken(token);
    if (!payload || !payload.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) return null;
    return user;
  } catch {
    return null;
  }
};

export class PushController {
  static async subscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authenticate(req);
      
      if (!user) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      const validation = subscriptionSchema.safeParse(req.body);
      
      if (!validation.success) {
        res.status(400).json({ message: 'Données de subscription invalides' });
        return;
      }

      const subscription = validation.data;
      
      await PushNotificationService.saveServicePurchase(user.id, subscription);
      
      res.status(200).json({ message: 'ServicePurchase enregistrée avec succès' });
    } catch (error) {
      next(error);
    }
  }

  static async unsubscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authenticate(req);
      
      if (!user) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      await prisma.pushSubscription.delete({
        where: { userId: user.id }
      });
      
      res.status(200).json({ message: 'Désabonnement effectué avec succès' });
    } catch (error) {
      next(error);
    }
  }

  static async getVapidPublicKey(req: Request, res: Response, next: NextFunction) {
    try {
      const publicKey = PushNotificationService.getVapidPublicKey();
      
      if (!publicKey) {
        res.status(500).json({ message: 'Clé VAPID non configurée' });
        return;
      }
      
      res.status(200).json({ publicKey });
    } catch (error) {
      next(error);
    }
  }
}
