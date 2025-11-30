/**
 * Service métier pour la gestion des invitations de mariage.
 * Contient la logique d'accès à la base de données via Prisma.
 */
import { prisma } from '../lib/prisma';
import { Prisma, InvitationStatus as PrismaInvitationStatus } from '@prisma/client';
import { S3Service } from '../utils/s3';

// Types d'invitation
type InvitationStatus = PrismaInvitationStatus;

// Types pour la création et mise à jour d'invitations - NOUVELLE ARCHITECTURE PURE
type InvitationCreateInput = {
  // CHAMPS OBLIGATOIRES
  eventTitle: string;      // "Emma & Lucas" ou "Anniversaire de Marie"
  eventDate: Date;         // Date de l'événement
  location: string;        // "Château de la Roseraie, Paris"
  designId: string;        // ID du design choisi

  // CHAMPS OPTIONNELS
  eventType?: 'WEDDING' | 'BIRTHDAY' | 'BAPTISM' | 'ANNIVERSARY' | 'GRADUATION' | 'BABY_SHOWER' | 'ENGAGEMENT' | 'COMMUNION' | 'CONFIRMATION' | 'RETIREMENT' | 'HOUSEWARMING' | 'CORPORATE' | 'OTHER';
  eventTime?: string;      // "15h00"
  customText?: string;     // Texte libre personnalisable
  moreInfo?: string;       // Informations supplémentaires

  // Champs techniques conservés
  description?: string;
  photos?: Prisma.InputJsonValue[];
  languages?: string[];
};

type InvitationUpdateInput = Partial<InvitationCreateInput>;

// Type pour les invités avec RSVP
interface GuestWithRSVP {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  isVIP: boolean;
  dietaryRestrictions: string | null;
  plusOne: boolean;
  plusOneName: string | null;
  inviteToken: string;
  usedAt: Date | null;
  rsvp: {
    status: string;
    message: string | null;
  } | null;
}

// Fonction utilitaire pour obtenir le texte par défaut selon le type d'événement
function getDefaultTextForEventType(eventType: string): string {
  switch (eventType) {
    case 'WEDDING':
      return 'Ont le plaisir de vous inviter à célébrer leur mariage';
    case 'BIRTHDAY':
      return 'Vous invite à fêter son anniversaire';
    case 'BAPTISM':
      return 'Vous invitent au baptême de';
    case 'ANNIVERSARY':
      return 'Vous invitent à célébrer leur anniversaire de mariage';
    case 'GRADUATION':
      return 'Vous invite à sa remise de diplôme';
    case 'BABY_SHOWER':
      return 'Vous invite à sa baby shower';
    case 'ENGAGEMENT':
      return 'Ont le plaisir de vous annoncer leurs fiançailles';
    case 'COMMUNION':
      return 'Vous invitent à la communion de';
    case 'CONFIRMATION':
      return 'Vous invitent à la confirmation de';
    case 'RETIREMENT':
      return 'Vous invite à fêter son départ en retraite';
    case 'HOUSEWARMING':
      return 'Vous invitent à leur crémaillère';
    case 'CORPORATE':
      return 'Vous invite à cet événement d\'entreprise';
    default:
      return 'Vous invite à cet événement spécial';
  }
}

export class InvitationService {
  /**
   * Créer une nouvelle invitation
   */
  static async createInvitation(userId: string, data: InvitationCreateInput) {
    // Vérifier si le design existe
    const design = await prisma.design.findUnique({
      where: { id: data.designId }
    });

    if (!design) {
      throw new Error('Design non trouvé');
    }

    // Créer l'invitation avec la nouvelle architecture pure
    const invitation = await prisma.invitation.create({
      data: {
        // Champs obligatoires
        eventTitle: data.eventTitle,
        eventDate: new Date(data.eventDate),
        location: data.location,
        designId: data.designId,
        userId: userId,

        // Champs optionnels
        eventType: data.eventType || 'WEDDING',
        eventTime: data.eventTime,
        customText: data.customText,
        moreInfo: data.moreInfo,

        // Champs techniques
        description: data.description,
        photos: data.photos || [],
        languages: data.languages || ['fr']
      },
      include: {
        design: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return invitation;
  }

  /**
   * Récupérer une invitation par son ID
   */
  static async getInvitationById(id: string, userId?: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { id },
      include: {
        design: true,
        guests: {
          include: {
            rsvp: true
          }
        }
      }
    });

    // Si l'invitation n'existe pas
    if (!invitation) {
      throw new Error('Invitation non trouvée');
    }

    // Si c'est une invitation publiée, on la retourne
    if (invitation.status === PrismaInvitationStatus.PUBLISHED) {
      return invitation;
    }

    // Sinon, on vérifie que l'utilisateur est le propriétaire
    if (invitation.userId !== userId) {
      throw new Error('Accès non autorisé');
    }

    return invitation;
  }

  /**
   * Mettre à jour une invitation
   */
  static async updateInvitation(id: string, userId: string, data: InvitationUpdateInput) {
    const invitation = await prisma.invitation.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée');
    }

    if (invitation.status === PrismaInvitationStatus.PUBLISHED) {
      throw new Error('Impossible de modifier une invitation publiée');
    }

    const updateData: any = {};

    // NOUVEAUX CHAMPS SIMPLIFIÉS
    if (data.eventTitle !== undefined) updateData.eventTitle = data.eventTitle;
    if (data.eventDate !== undefined) updateData.eventDate = new Date(data.eventDate);
    if (data.location !== undefined) updateData.location = data.location;
    if (data.eventType !== undefined) updateData.eventType = data.eventType;
    if (data.eventTime !== undefined) updateData.eventTime = data.eventTime;
    if (data.customText !== undefined) updateData.customText = data.customText;
    if (data.moreInfo !== undefined) updateData.moreInfo = data.moreInfo;

    // Champs techniques
    if (data.description !== undefined) updateData.description = data.description;
    if (data.photos !== undefined) updateData.photos = data.photos;
    if (data.languages !== undefined) updateData.languages = data.languages;

    if (data.designId !== undefined) {
      // Vérifier si le design existe
      const design = await prisma.design.findUnique({
        where: { id: data.designId }
      });

      if (!design) {
        throw new Error('Design non trouvé');
      }

      updateData.design = { connect: { id: data.designId } };
    }

    return prisma.invitation.update({
      where: { id },
      data: updateData
    });
  }

  /**
   * Supprimer une invitation
   */
  static async deleteInvitation(id: string, userId: string) {
    const invitation = await prisma.invitation.findFirst({
      where: {
        id,
        ...(userId !== 'admin' ? { userId } : {})
      }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée');
    }

    // Les admins peuvent supprimer toutes les invitations, les utilisateurs seulement les non publiées
    if (userId !== 'admin' && invitation.status === PrismaInvitationStatus.PUBLISHED) {
      throw new Error('Impossible de supprimer une invitation publiée');
    }

    // Nettoyer les fichiers Firebase des albums photos
    const { FirebaseCleanupService } = await import('./firebaseCleanupService');
    await FirebaseCleanupService.deleteInvitationPhotos(id);

    // Supprimer les fichiers S3 associés (ancien système)
    if (invitation.photos) {
      const photos = invitation.photos as { url: string }[];
      for (const photo of photos) {
        await S3Service.deleteFile(photo.url);
      }
    }

    return prisma.invitation.delete({
      where: { id }
    });
  }

  /**
   * Obtenir les statistiques d'une invitation
   */
  static async getStats(id: string, userId: string) {
    const invitation = await prisma.invitation.findFirst({
      where: {
        id,
        userId
      },
      include: {
        guests: {
          include: {
            rsvp: true
          }
        }
      }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée');
    }

    const guests = invitation.guests as GuestWithRSVP[];
    const totalGuests = guests.length;
    const confirmedGuests = guests.filter(g => g.rsvp?.status === 'CONFIRMED').length;
    const declinedGuests = guests.filter(g => g.rsvp?.status === 'DECLINED').length;
    const pendingGuests = guests.filter(g => !g.rsvp || g.rsvp.status === 'PENDING').length;

    return {
      guests: {
        total: totalGuests,
        confirmed: confirmedGuests,
        declined: declinedGuests,
        pending: pendingGuests
      }
    };
  }

  /**
   * Exporter la liste des invités en CSV
   */
  static async exportGuestsCSV(id: string, userId: string) {
    const invitation = await prisma.invitation.findFirst({
      where: {
        id,
        userId
      },
      include: {
        guests: {
          include: {
            rsvp: true
          }
        }
      }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée');
    }

    const guests = invitation.guests as GuestWithRSVP[];
    const csvHeader = 'Prénom,Nom,Email,Téléphone,VIP,Restrictions alimentaires,+1,Nom +1,Statut RSVP,Message RSVP\n';
    const csvRows = guests.map(guest => {
      const rsvpStatus = guest.rsvp ? guest.rsvp.status : 'PENDING';
      const rsvpMessage = guest.rsvp ? guest.rsvp.message || '' : '';
      return `${guest.firstName},${guest.lastName},${guest.email || ''},${guest.phone || ''},${guest.isVIP},${guest.dietaryRestrictions || ''},${guest.plusOne},${guest.plusOneName || ''},${rsvpStatus},${rsvpMessage}`;
    }).join('\n');

    return {
      data: csvHeader + csvRows,
      filename: `invites-${invitation.eventTitle?.toLowerCase().replace(/\s+/g, '-') || 'invitation'}.csv`
    };
  }

  /**
   * Publier une invitation
   */
  static async publishInvitation(id: string, userId: string) {
    const invitation = await prisma.invitation.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée');
    }

    if (invitation.status === PrismaInvitationStatus.PUBLISHED) {
      throw new Error('L\'invitation est déjà publiée');
    }

    return prisma.invitation.update({
      where: { id },
      data: {
        status: PrismaInvitationStatus.PUBLISHED
      }
    });
  }

  /**
   * Archiver une invitation
   */
  static async archiveInvitation(id: string, userId: string) {
    const invitation = await prisma.invitation.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée');
    }

    return prisma.invitation.update({
      where: { id },
      data: {
        status: PrismaInvitationStatus.ARCHIVED
      }
    });
  }

  /**
   * Récupérer toutes les invitations d'un utilisateur.
   */
  static async getUserInvitations(userId: string) {
    return prisma.invitation.findMany({
      where: {
        userId,
      },
      select: {
        // Champs scalaires de l'invitation
        id: true,
        eventTitle: true,
        eventDate: true,
        eventType: true,
        eventTime: true,
        location: true,
        customText: true,
        moreInfo: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        description: true,
        photos: true,
        languages: true,
        designId: true,
        shareableEnabled: true,
        shareableMaxUses: true,
        shareableToken: true,
        shareableUsedCount: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Récupérer l'invitation active d'un utilisateur.
   * L'invitation active est la plus récente invitation non archivée.
   */
  static async getActiveInvitation(userId: string) {
    return prisma.invitation.findFirst({
      where: {
        userId,
        status: {
          not: 'ARCHIVED'
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Supprimer une invitation (pour l'admin).
   */
  static async deleteInvitationAdmin(id: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { id }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée');
    }

    // Nettoyer les fichiers Firebase associés
    const { FirebaseCleanupService } = await import('./firebaseCleanupService');
    await FirebaseCleanupService.deleteInvitationPhotos(id);

    // Supprimer les fichiers S3 associés (ancien système)
    if (invitation.photos) {
      const photos = invitation.photos as { url: string }[];
      for (const photo of photos) {
        await S3Service.deleteFile(photo.url);
      }
    }

    return prisma.invitation.delete({
      where: { id }
    });
  }

  /**
   * Récupérer toutes les invitations (pour l'admin).
   */
  static async getAllInvitations() {
    return prisma.invitation.findMany({
      select: {
        // Champs scalaires de l'invitation
        id: true,
        eventTitle: true,
        eventDate: true,
        eventType: true,
        eventTime: true,
        location: true,
        customText: true,
        moreInfo: true,
        status: true,
        designId: true,
        createdAt: true,
        updatedAt: true,
        // Relations
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        // Inclure TOUTES les données du design comme pour RSVP et client
        design: true,
        _count: {
          select: {
            guests: true,
            rsvps: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Récupérer une invitation spécifique avec tous les détails (pour l'admin).
   */
  static async getInvitationByIdAdmin(id: string) {

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      include: {
        // Relations complètes (comme RSVP)
        user: true,
        design: true, // Inclure TOUTES les données du design
        guests: {
          include: {
            rsvp: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            guests: true,
            rsvps: true
          }
        }
      }
    });



    if (!invitation) {
      throw new Error('Invitation non trouvée');
    }

    return invitation;
  }
} 