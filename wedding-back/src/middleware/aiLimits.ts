/**
 * Middleware pour vérifier les limites de requêtes AI
 */
import { Request, Response, NextFunction } from 'express';
import { AIRequestService } from '../services/aiRequestService';

/**
 * Vérifier si l'utilisateur peut utiliser une requête AI
 */
export const checkAILimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (!userId) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    // Les admins n'ont pas de limites
    if (userRole === 'ADMIN') {
      next();
      return;
    }

    // Vérifier les limites AI selon le rôle
    let aiLimits;
    if (userRole === 'PROVIDER') {
      // Pour les providers, fixer 20 requêtes IA pour améliorer les descriptions
      const limit = 20;
      const used = await AIRequestService.getAIRequestCount(userId);
      const remaining = Math.max(0, limit - used);
      
      aiLimits = {
        canUse: remaining > 0,
        limit,
        used,
        remaining
      };
    } else {
      // Pour les clients, utiliser les limites standard
      aiLimits = await AIRequestService.canUseAIRequest(userId);
    }

    if (!aiLimits.canUse) {
      res.status(403).json({
        message: `Limite atteinte: vous avez utilisé toutes vos ${aiLimits.limit} requêtes IA. Passez à un forfait supérieur ou achetez un pack de requêtes supplémentaires pour continuer.`,
        limit: aiLimits.limit,
        used: aiLimits.used,
        remaining: aiLimits.remaining,
        upgradeRequired: true
      });
      return;
    }

    // Ajouter les informations de limite à la requête pour utilisation ultérieure
    (req as any).aiLimits = aiLimits;

    next();
  } catch (error) {
    console.error('Erreur lors de la vérification des limites AI:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la vérification des limites' });
  }
};

