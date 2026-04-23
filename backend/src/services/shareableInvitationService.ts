/**
 * Service pour gérer les liens d'invitation partageables
 * NOUVEAU: Utilise la table ShareableLink avec statuts et association guest
 */
import { prisma } from '../lib/prisma';
import crypto from 'crypto';
import { StripeService } from '../services/stripeService';
import { cache } from '../lib/redis';

export class ShareableInvitationService {
  /**
   * Générer un nouveau lien partageable
   */
  static async generateShareableLink(invitationId: string, userId: string, options: {
    expiresAt?: Date;
    forceNew?: boolean;
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

      // Si on ne force pas un nouveau lien, on cherche d'abord s'il en existe un actif
      if (!options.forceNew) {
        const existingLink = await tx.shareableLink.findFirst({
          where: {
            invitationId,
            isActive: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ],
            guestId: null
          },
          orderBy: { createdAt: 'desc' }
        });

        if (existingLink) {
          // Recalculer les limites
          const userLimits = await StripeService.getUserTotalLimits(userId);
          const currentGuestCount = invitation.guests.length;
          const maxGuests = userLimits?.guests || 0;
          const remainingGuests = maxGuests - currentGuestCount;

          return {
            shareableToken: existingLink.token,
            shareableEnabled: existingLink.isActive,
            shareableMaxUses: existingLink.maxUses,
            shareableUsedCount: existingLink.usedCount,
            shareableExpiresAt: existingLink.expiresAt || null,
            remainingGuests
          };
        }
      }

      // Si on force un nouveau lien ou s'il n'en existe pas, on désactive d'abord les anciens liens actifs
      if (options.forceNew) {
        await tx.shareableLink.updateMany({
          where: {
            invitationId,
            isActive: true,
            guestId: null // On ne désactive que les liens "maîtres"
          },
          data: { isActive: false }
        });
      }

      // Obtenir les limites totales du forfait
      const userLimits = await StripeService.getUserTotalLimits(userId);
      if (!userLimits) {
        throw new Error('Limites de forfait non trouvées');
      }

      const currentGuestCount = invitation.guests.length;
      const maxGuests = userLimits.guests;
      const remainingGuests = maxGuests - currentGuestCount;

      if (remainingGuests <= 0) {
        throw new Error('Vous avez atteint la limite d\'invités de votre forfait');
      }

      // Générer un token unique
      const shareableToken = `share-${Date.now()}-${crypto.randomUUID()}`;

      // NOUVEAU: Les liens sont permanents par défaut (expiresAt = null)
      const expiresAt = options.expiresAt || null;

      // Créer un nouveau lien dans la table ShareableLink
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
        // On incrémente le compteur sans changer le statut ni lier à un guestId unique
        // Cela permet au lien de rester "SHARED" et d'être réutilisé
        usedCount: {
          increment: 1
        }
      }
    });

    console.log(`🔗 Lien partageable ${shareableToken} marqué comme USED, suppression automatique annulée`);

    // Invalider le cache car le lien a changé
    await cache.del(`invitation:shareable:${shareableToken}`);

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
        // Le lien reste permanent et actif pour les autres invités
        expiresAt: null
      }
    });

    console.log(`✅ Lien partageable ${shareableToken} marqué comme CONFIRMED et rendu permanent (expiresAt supprimé)`);

    // Invalider le cache
    await cache.del(`invitation:shareable:${shareableToken}`);

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
            design: {
              select: {
                id: true,
                name: true,
                backgroundImage: true,
                thumbnail: true,
                previewImage: true,
                canvasWidth: true,
                canvasHeight: true,
                canvasFormat: true
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
        profilePhotoUrl: guest.profilePhotoUrl,
        albumAccessCode: guest.albumAccessCode
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

    // On récupère les tokens avant de supprimer pour le cache (optionnel mais propre)
    const linksToCleanup = await prisma.shareableLink.findMany({
      where: {
        expiresAt: {
          lt: now
        }
      },
      select: { token: true }
    });

    const deletedLinks = await prisma.shareableLink.deleteMany({
      where: {
        expiresAt: {
          lt: now
        }
      }
    });

    for (const link of linksToCleanup) {
      await cache.del(`invitation:shareable:${link.token}`);
    }

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
    const result = await prisma.shareableLink.update({
      where: { token },
      data: { isActive: false }
    });

    await cache.del(`invitation:shareable:${token}`);
    return result;
  }

  /**
   * Récupérer l'invitation via token partageable
   */
  static async getInvitationByShareableToken(shareableToken: string, forRSVP: boolean = false) {
    // Tenter de récupérer depuis le cache
    const cacheKey = `invitation:shareable:${shareableToken}`;
    const cachedData = await cache.get<any>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Chercher dans la nouvelle table ShareableLink
    const shareableLink = await prisma.shareableLink.findUnique({
      where: { token: shareableToken },
      include: {
        invitation: {
          include: {
            design: {
              select: {
                id: true,
                name: true,
                backgroundImage: true,
                thumbnail: true,
                previewImage: true,
                canvasWidth: true,
                canvasHeight: true,
                canvasFormat: true
              }
            },
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

    const invitation = shareableLink.invitation;

    // Sauvegarder dans le cache pour 1h
    await cache.set(cacheKey, invitation, 3600);

    return invitation;
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
          id: guest.id,
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          phone: guest.phone,
          albumAccessCode: guest.albumAccessCode
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
    const result = await prisma.shareableLink.update({
      where: { token: shareableToken },
      data: {
        usedCount: {
          increment: 1
        }
      }
    });

    await cache.del(`invitation:shareable:${shareableToken}`);
    return result;
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