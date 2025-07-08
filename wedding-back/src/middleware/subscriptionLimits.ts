/**
 * Middleware pour vérifier les limites d'abonnement
 * Version 1: Restrictions pour les utilisateurs gratuits
 */
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

// Limites pour les utilisateurs BASIC (gratuits)
const BASIC_LIMITS = {
  MAX_INVITATIONS: 2,
  MAX_GUESTS_PER_INVITATION: 5
};

/**
 * Vérifier si l'utilisateur peut créer une nouvelle invitation
 */
export const checkInvitationLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const userTier = (req as any).user?.subscriptionTier;

    if (!userId) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    // Les admins n'ont pas de limites
    if (userRole === 'ADMIN') {
      next();
      return;
    }

    // Seuls les utilisateurs BASIC ont des limites pour l'instant
    if (userTier !== 'BASIC') {
      next();
      return;
    }

    // Compter les invitations existantes
    const invitationCount = await prisma.invitation.count({
      where: {
        userId: userId
      }
    });

    if (invitationCount >= BASIC_LIMITS.MAX_INVITATIONS) {
      res.status(403).json({
        message: `Limite atteinte: vous ne pouvez créer que ${BASIC_LIMITS.MAX_INVITATIONS} invitations avec votre abonnement gratuit. Passez à un abonnement premium pour créer plus d'invitations.`,
        limit: BASIC_LIMITS.MAX_INVITATIONS,
        current: invitationCount
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Erreur lors de la vérification des limites d\'invitation:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

/**
 * Vérifier si l'utilisateur peut ajouter des invités à une invitation
 */
export const checkGuestLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const userTier = (req as any).user?.subscriptionTier;
    const invitationId = req.params.id || req.params.invitationId || req.body.invitationId;

    if (!userId) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    // Les admins n'ont pas de limites
    if (userRole === 'ADMIN') {
      next();
      return;
    }

    // Seuls les utilisateurs BASIC ont des limites pour l'instant
    if (userTier !== 'BASIC') {
      next();
      return;
    }

    if (!invitationId) {
      res.status(400).json({ message: 'ID d\'invitation requis' });
      return;
    }

    // Vérifier que l'invitation appartient à l'utilisateur
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        userId: userId
      }
    });

    if (!invitation) {
      res.status(404).json({ message: 'Invitation non trouvée' });
      return;
    }

    // Compter les invités existants
    const guestCount = await prisma.guest.count({
      where: {
        invitationId: invitationId
      }
    });

    // Pour l'import en masse, vérifier le nombre d'invités à ajouter
    let guestsToAdd = 1; // Par défaut, on ajoute 1 invité
    
    if (req.body.guests && Array.isArray(req.body.guests)) {
      guestsToAdd = req.body.guests.length;
    } else if (req.file) {
      // Pour les imports de fichiers, on ne peut pas vérifier à l'avance
      // On laisse passer et on vérifiera dans le service
      guestsToAdd = 0;
    }

    if (guestCount + guestsToAdd > BASIC_LIMITS.MAX_GUESTS_PER_INVITATION) {
      res.status(403).json({
        message: `Limite atteinte: vous ne pouvez avoir que ${BASIC_LIMITS.MAX_GUESTS_PER_INVITATION} invités par invitation avec votre abonnement gratuit. Passez à un abonnement premium pour inviter plus de personnes.`,
        limit: BASIC_LIMITS.MAX_GUESTS_PER_INVITATION,
        current: guestCount,
        trying_to_add: guestsToAdd
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Erreur lors de la vérification des limites d\'invités:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

/**
 * Vérifier les limites pour l'import en masse
 */
export const checkBulkImportLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const userTier = (req as any).user?.subscriptionTier;
    const invitationId = req.params.id || req.params.invitationId || req.body.invitationId;

    if (!userId) {
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    // Les admins n'ont pas de limites
    if (userRole === 'ADMIN') {
      next();
      return;
    }

    // Seuls les utilisateurs BASIC ont des limites pour l'instant
    if (userTier !== 'BASIC') {
      next();
      return;
    }

    if (!invitationId) {
      res.status(400).json({ message: 'ID d\'invitation requis' });
      return;
    }

    // Vérifier que l'invitation appartient à l'utilisateur
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        userId: userId
      }
    });

    if (!invitation) {
      res.status(404).json({ message: 'Invitation non trouvée' });
      return;
    }

    // Compter les invités existants
    const guestCount = await prisma.guest.count({
      where: {
        invitationId: invitationId
      }
    });

    // Ajouter les limites au request pour que le service puisse les utiliser
    (req as any).subscriptionLimits = {
      maxGuests: BASIC_LIMITS.MAX_GUESTS_PER_INVITATION,
      currentGuests: guestCount
    };

    next();
  } catch (error) {
    console.error('Erreur lors de la vérification des limites d\'import:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

export { BASIC_LIMITS }; 