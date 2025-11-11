/**
 * Service pour gérer les liens d'invitation partageables
 * NOUVEAU: Utilise la table ShareableLink avec statuts et association guest
 */
import { prisma } from '../lib/prisma';
import crypto from 'crypto';
import { StripeService } from '../services/stripeService';

export class ShareableInvitationService {
  /**
   * Générer un nouveau lien partageable
   */
  static async generateShareableLink(invitationId: string, userId: string, options: {
    expiresAt?: Date;
  }) {
    // Utiliser une transaction pour garantir la cohérence
    return await prisma.$transaction(async (tx) => {
      // Vérifier que l'invitation appartient à l'utilisateur
      const invitation = await tx.invitation.findFirst({
        where: { 
          id: invitationId, 
          userId 
        },
        include: {
          user: {
            select: {
              id: true
            }
          },
          guests: {
            where: {
              invitationType: 'SHAREABLE'
            }
          }
        }
      });

      if (!invitation) {
        throw new Error('Invitation non trouvée ou accès non autorisé');
      }

      // Obtenir les limites totales du forfait (incluant les services supplémentaires)
      const userLimits = await StripeService.getUserTotalLimits(userId);
      if (!userLimits) {
        throw new Error('Limites de forfait non trouvées');
      }

      // Calculer le nombre d'invités restants
      const currentGuestCount = invitation.guests.length;
      const maxGuests = userLimits.guests;
      const remainingGuests = maxGuests - currentGuestCount;

      if (remainingGuests <= 0) {
        throw new Error('Vous avez atteint la limite d\'invités de votre forfait');
      }

      // Générer un token unique
      const shareableToken = `share-${Date.now()}-${crypto.randomUUID()}`;
      
      // Calculer l'expiration automatique (20 minutes)
      const expiresAt = options.expiresAt || new Date(Date.now() + 20 * 60 * 1000);
      
      // Créer un nouveau lien dans la table ShareableLink avec la limite basée sur les invités restants
      const shareableLink = await tx.shareableLink.create({
        data: {
          token: shareableToken,
          status: 'SHARED',
          isActive: true,
          maxUses: remainingGuests,
          usedCount: 0,
          expiresAt: expiresAt,
          invitationId: invitationId
        }
      });

      // Retourner les informations du lien créé
      return {
        shareableToken: shareableLink.token,
        shareableEnabled: shareableLink.isActive,
        shareableMaxUses: shareableLink.maxUses,
        shareableUsedCount: shareableLink.usedCount,
        shareableExpiresAt: shareableLink.expiresAt || null,
        remainingGuests
      };
    });
  }

  /**
   * Associer un lien partageable à un guest et marquer comme utilisé
   * Annule la suppression automatique car le lien est maintenant utilisé
   */
  static async associateGuestToLink(shareableToken: string, guestId: string) {
    const updatedLink = await prisma.shareableLink.update({
      where: { token: shareableToken },
      data: {
        status: 'USED',
        guestId: guestId,
        usedCount: {
          increment: 1
        }
      }
    });

    console.log(`🔗 Lien partageable ${shareableToken} marqué comme USED, suppression automatique annulée`);
    return updatedLink;
  }

  /**
   * Marquer un lien partageable comme CONFIRMED après RSVP réussi
   * Le lien est définitivement fermé et ne sera jamais supprimé
   * On supprime expiresAt pour indiquer qu'il n'expire jamais
   */
  static async confirmShareableLink(shareableToken: string) {
    const updatedLink = await prisma.shareableLink.update({
      where: { token: shareableToken },
      data: {
        status: 'CONFIRMED',
        expiresAt: null // Supprimer l'expiration = lien permanent
      }
    });

    console.log(`✅ Lien partageable ${shareableToken} marqué comme CONFIRMED et rendu permanent (expiresAt supprimé)`);
    return updatedLink;
  }

  /**
   * Récupérer une invitation via numéro de téléphone ou email après RSVP
   */
  static async getInvitationByGuestInfo(phoneOrEmail: string) {
    const guest = await prisma.guest.findFirst({
      where: {
        OR: [
          { phone: phoneOrEmail },
          { email: phoneOrEmail }
        ],
        invitationType: 'SHAREABLE'
      },
      include: {
        invitation: {
          include: {
            design: true,
            photoAlbums: {
              include: {
                photos: {
                  where: {
                    status: {
                      in: ['APPROVED', 'PUBLIC']
                    }
                  }
                }
              }
            }
          }
        },
        rsvp: true,
        shareableLink: true
      }
    });

    if (!guest) {
      throw new Error('Aucune invitation trouvée pour ce numéro ou email');
    }

    return {
      guest: {
        id: guest.id,
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone,
        profilePhotoUrl: guest.profilePhotoUrl
      },
      invitation: guest.invitation,
      rsvp: guest.rsvp,
      shareableLink: guest.shareableLink
    };
  }

  /**
   * Nettoyer les liens expirés
   * Supprime seulement les liens avec expiresAt défini et expiré
   * Les liens CONFIRMED ont expiresAt = null donc ne sont jamais supprimés
   */
  static async cleanupUnusedLinks() {
    const now = new Date();
    
    const deletedLinks = await prisma.shareableLink.deleteMany({
      where: {
        expiresAt: {
          lt: now // Seulement les liens avec expiresAt défini et expiré
        }
      }
    });

    console.log(`🧹 Cleanup: ${deletedLinks.count} liens partageables expirés supprimés`);
    return deletedLinks.count;
  }

  /**
   * Désactiver un lien partageable spécifique
   */
  static async disableShareableLink(token: string, userId: string) {
    // Trouver le lien et vérifier les permissions
    const shareableLink = await prisma.shareableLink.findUnique({
      where: { token },
      include: {
        invitation: {
          select: { userId: true }
        }
      }
    });

    if (!shareableLink) {
      throw new Error('Lien partageable non trouvé');
    }

    if (shareableLink.invitation.userId !== userId) {
      throw new Error('Accès non autorisé');
    }

    // Désactiver le lien (ne pas le supprimer pour garder l'historique)
    return await prisma.shareableLink.update({
      where: { token },
      data: { isActive: false }
    });
  }

  /**
   * Récupérer l'invitation via token partageable
   */
  static async getInvitationByShareableToken(shareableToken: string, forRSVP: boolean = false) {
    // Chercher dans la nouvelle table ShareableLink
    const shareableLink = await prisma.shareableLink.findUnique({
      where: { token: shareableToken },
      include: {
        invitation: {
          include: { 
            design: true,
            guests: {
              where: {
                invitationType: 'SHAREABLE'
              },
              include: {
                rsvp: true
              }
            },
            photoAlbums: {
              include: {
                photos: {
                  where: {
                    status: {
                      in: ['APPROVED', 'PUBLIC']
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!shareableLink) {
      throw new Error('Lien d\'invitation invalide ou expiré');
    }

    if (!shareableLink.isActive) {
      throw new Error('Lien d\'invitation désactivé');
    }

    // Vérifier l'expiration (expiresAt = null = permanent)
    if (shareableLink.expiresAt) {
      const now = new Date();
      if (shareableLink.expiresAt < now) {
        // Supprimer automatiquement le lien expiré
        await prisma.shareableLink.delete({
          where: { token: shareableToken }
        });
        throw new Error('Lien d\'invitation expiré (20 minutes). Veuillez demander un nouveau lien.');
      }
    }
    // Si expiresAt est null, le lien est permanent (CONFIRMED)

    return shareableLink.invitation;
  }

  /**
   * Récupérer le statut RSVP d'un invité via token partageable
   */
  static async getRSVPStatusByShareableToken(shareableToken: string, guestPhone?: string) {
    // Chercher dans la nouvelle table ShareableLink
    const shareableLink = await prisma.shareableLink.findUnique({
      where: { token: shareableToken },
      include: {
        invitation: {
          include: { 
            guests: {
              where: {
                invitationType: 'SHAREABLE',
                ...(guestPhone && { phone: guestPhone })
              },
              include: {
                rsvp: true
              }
            }
          }
        }
      }
    });

    if (!shareableLink) {
      throw new Error('Lien d\'invitation invalide ou expiré');
    }

    const invitation = shareableLink.invitation;

    // Si un téléphone est fourni, retourner le statut spécifique de cet invité
    if (guestPhone && invitation.guests.length > 0) {
      const guest = invitation.guests[0];
      return {
        guest: {
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          phone: guest.phone
        },
        rsvp: guest.rsvp ? {
          status: guest.rsvp.status,
          numberOfGuests: guest.rsvp.numberOfGuests,
          message: guest.rsvp.message,
          respondedAt: guest.rsvp.respondedAt,
          plusOne: guest.plusOne,
          plusOneName: guest.plusOneName,
          dietaryRestrictions: guest.dietaryRestrictions,
          profilePhotoUrl: guest.profilePhotoUrl
        } : null,
        invitation: {
          eventTitle: invitation.eventTitle,
          eventDate: invitation.eventDate,
          eventTime: invitation.eventTime,
          location: invitation.location,
          eventType: invitation.eventType,
          customText: invitation.customText,
          moreInfo: invitation.moreInfo
        }
      };
    }

    // Retourner les informations générales de l'invitation
    return {
      invitation: {
        eventTitle: invitation.eventTitle,
        eventDate: invitation.eventDate,
        eventTime: invitation.eventTime,
        location: invitation.location,
        eventType: invitation.eventType,
        customText: invitation.customText,
        moreInfo: invitation.moreInfo
      },
      shareableToken
    };
  }

  /**
   * Obtenir les statistiques des liens partageables d'une invitation
   */
  static async getShareableStats(invitationId: string, userId: string) {
    // Vérifier que l'invitation appartient à l'utilisateur
    const invitation = await prisma.invitation.findFirst({
      where: { 
        id: invitationId, 
        userId 
      },
      include: {
        user: {
          select: {
            id: true
          }
        }
      }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée ou accès non autorisé');
    }

    // Récupérer le lien le plus récent et actif
    const latestShareableLink = await prisma.shareableLink.findFirst({
      where: {
        invitationId: invitationId,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Compter tous les invités via liens partageables
    const shareableGuests = await prisma.guest.count({
      where: {
        invitationId: invitationId,
        invitationType: 'SHAREABLE'
      }
    });

    // Calculer les invités restants
    const userLimits = await StripeService.getUserTotalLimits(userId);
    const maxGuests = userLimits?.guests || 0;
    const remainingGuests = maxGuests - shareableGuests;

    return {
      shareableEnabled: latestShareableLink ? latestShareableLink.isActive : false,
      shareableToken: latestShareableLink ? latestShareableLink.token : null,
      shareableMaxUses: latestShareableLink ? latestShareableLink.maxUses : null,
      shareableUsedCount: latestShareableLink ? latestShareableLink.usedCount : 0,
      shareableExpiresAt: latestShareableLink ? latestShareableLink.expiresAt : null,
      guestsCount: shareableGuests,
      remainingGuests: remainingGuests,
      shareableUrl: latestShareableLink ? 
        `${process.env.FRONTEND_URL || 'http://localhost:3012'}/rsvp/shared/${latestShareableLink.token}` : 
        null
    };
  }

  /**
   * Incrémenter le compteur d'utilisation d'un lien spécifique
   */
  static async incrementUsageCount(shareableToken: string) {
    return await prisma.shareableLink.update({
      where: { token: shareableToken },
      data: {
        usedCount: {
          increment: 1
        }
      }
    });
  }

  /**
   * Lister tous les liens partageables d'une invitation
   */
  static async listShareableLinks(invitationId: string, userId: string) {
    // Vérifier que l'invitation appartient à l'utilisateur
    const invitation = await prisma.invitation.findFirst({
      where: { 
        id: invitationId, 
        userId 
      }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée ou accès non autorisé');
    }

    return await prisma.shareableLink.findMany({
      where: {
        invitationId: invitationId
      },
      include: {
        guest: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
} 