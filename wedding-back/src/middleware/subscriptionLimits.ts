/**
 * Middleware pour vérifier les limites d'abonnement
 */
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { StripeService } from '../services/stripeService';

/**
 * Obtenir les limites d'un utilisateur selon ses achats et services supplémentaires
 */
export const getUserLimits = async (tier: string, userId?: string) => {
  if (userId) {
    // Utiliser les limites totales incluant tous les achats et services supplémentaires
    return await StripeService.getUserTotalLimits(userId);
  }
  
  // Fallback vers les limites de base
  const plan = StripeService.getPlanDetails(tier as any);
  return plan ? plan.limits : {
    invitations: 1,
    guests: 30,
    photos: 20,
    designs: 1
  };
};

/**
 * Vérifier si l'utilisateur peut créer une nouvelle invitation
 */
export const checkInvitationLimit = async (req: Request, res: Response, next: NextFunction) => {
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

    const limits = await getUserLimits('FREE', userId);

    // Compter les invitations existantes
    const invitationCount = await prisma.invitation.count({
      where: {
        userId: userId
      }
    });

    if (invitationCount >= limits.invitations) {
      res.status(403).json({
        message: `Limite atteinte: vous ne pouvez créer que ${limits.invitations} invitation(s) avec votre forfait actuel. Passez à un forfait supérieur pour créer plus d'invitations.`,
        limit: limits.invitations,
        current: invitationCount,
        upgradeRequired: true
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Erreur lors de la vérification des limites d\'invitation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Vérifier si l'utilisateur peut ajouter des invités
 */
export const checkGuestLimit = async (req: Request, res: Response, next: NextFunction) => {
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

    const limits = await getUserLimits('FREE', userId);

    // Compter les invités existants
    const guestCount = await prisma.guest.count({
      where: {
        invitation: {
          userId: userId
        }
      }
    });

    // Nombre d'invités à ajouter (depuis le body de la requête)
    const guestsToAdd = Array.isArray(req.body) ? req.body.length : 1;

    if (guestCount + guestsToAdd > limits.guests) {
      res.status(403).json({
        message: `Limite atteinte: vous ne pouvez avoir que ${limits.guests} invité(s) avec votre forfait actuel. Passez à un forfait supérieur pour inviter plus de personnes.`,
        limit: limits.guests,
        current: guestCount,
        upgradeRequired: true
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Erreur lors de la vérification des limites d\'invités:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Vérifier si l'utilisateur peut uploader des photos
 */
export const checkPhotoLimit = async (req: Request, res: Response, next: NextFunction) => {
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

    const limits = await getUserLimits('FREE', userId);

    // Si photos illimitées
    if (limits.photos === 999999) {
      next();
      return;
    }

    // Compter les photos existantes
    const photoCount = await prisma.photo.count({
      where: {
        album: {
          invitation: {
            userId: userId
          }
        }
      }
    });

    if (photoCount >= limits.photos) {
      res.status(403).json({
        message: `Limite atteinte: vous ne pouvez avoir que ${limits.photos} photo(s) avec votre forfait actuel. Passez à un forfait supérieur pour ajouter plus de photos.`,
        limit: limits.photos,
        current: photoCount,
        upgradeRequired: true
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Erreur lors de la vérification des limites de photos:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Vérifier les limites de photos pour les invités (sans authentification)
 * Les invités peuvent toujours uploader, les limites s'appliquent au propriétaire de l'album
 */
export const checkGuestPhotoLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { albumId } = req.params;

    // Récupérer l'album et son propriétaire
    const album = await prisma.photoAlbum.findUnique({
      where: { id: albumId },
      include: {
        invitation: {
          include: {
            user: true
          }
        }
      }
    });

    if (!album) {
      res.status(404).json({ message: 'Album non trouvé' });
      return;
    }

    const userId = album.invitation.userId;
    const userRole = album.invitation.user.role;

    // Les admins n'ont pas de limites
    if (userRole === 'ADMIN') {
      next();
      return;
    }

    const limits = await getUserLimits('FREE', userId);

    // Si photos illimitées
    if (limits.photos === 999999) {
      next();
      return;
    }

    // Compter les photos existantes dans cet album
    const photoCount = await prisma.photo.count({
      where: {
        album: {
          invitation: {
            userId: userId
          }
        }
      }
    });

    if (photoCount >= limits.photos) {
      res.status(403).json({
        message: `Limite atteinte: l'organisateur ne peut accepter que ${limits.photos} photo(s) avec son forfait actuel.`,
        limit: limits.photos,
        current: photoCount,
        upgradeRequired: true
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Erreur lors de la vérification des limites de photos pour invités:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/**
 * Obtenir les limites et l'utilisation d'un utilisateur
 */
export const getUserLimitsAndUsage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    // Récupérer le tier actuel basé sur les achats
    const userTier = await StripeService.getUserCurrentTier(userId);
    
    // Récupérer les limites totales (tous les achats + services supplémentaires)
    const limits = await getUserLimits(userTier, userId);

    // Compter l'utilisation actuelle
    const [invitationCount, guestCount, photoCount] = await Promise.all([
      prisma.invitation.count({
        where: { userId: userId }
      }),
      prisma.guest.count({
        where: { invitation: { userId: userId } }
      }),
      prisma.photo.count({
        where: { 
          album: { 
            invitation: { userId: userId } 
          } 
        }
      })
    ]);

    const usage = {
      invitations: invitationCount,
      guests: guestCount,
      photos: photoCount,
      designs: 0 // TODO: Implémenter le comptage des designs
    };

    const remaining = {
      invitations: Math.max(0, limits.invitations - usage.invitations),
      guests: Math.max(0, limits.guests - usage.guests),
      photos: limits.photos === 999999 ? 999999 : Math.max(0, limits.photos - usage.photos),
      designs: Math.max(0, limits.designs - usage.designs)
    };

    res.json({
      tier: userTier,
      limits,
      usage,
      remaining
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des limites:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}; 