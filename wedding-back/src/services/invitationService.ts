/**
 * Service métier pour la gestion des invitations de mariage.
 * Contient la logique d'accès à la base de données via Prisma.
 */
import { prisma } from '../lib/prisma';
import { Prisma, InvitationStatus as PrismaInvitationStatus } from '@prisma/client';
import { S3Service } from '../utils/s3';

// Types d'invitation
type InvitationStatus = PrismaInvitationStatus;

// Types pour la création et mise à jour d'invitations
type InvitationCreateInput = {
  // Informations du couple
  coupleName: string;
  
  // Date et heure
  weddingDate: Date;
  ceremonyTime?: string;
  receptionTime?: string;
  
  // Textes d'invitation
  invitationText?: string;
  saveDate?: string;
  celebrationText?: string;
  
  // Lieu et détails
  venueName: string;
  venueAddress: string;
  venueCoordinates?: string;
  moreInfo?: string;
  details?: string;
  
  // RSVP
  rsvpDetails?: string;
  rsvpForm?: string;
  rsvpDate?: Date;
  
  // Messages personnalisés
  message?: string;
  blessingText?: string;
  welcomeMessage?: string;
  
  // Informations supplémentaires
  dressCode?: string;
  contact?: string;
  
  // Champs existants (optionnels maintenant)
  title?: string;
  description?: string;
  customDomain?: string;
  photos?: Prisma.InputJsonValue[];
  program?: Prisma.InputJsonValue;
  restrictions?: string;
  languages?: string[];
  maxGuests?: number;
  designId: string;
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

    const invitation = await prisma.invitation.create({
      data: {
        coupleName: data.coupleName,
        weddingDate: new Date(data.weddingDate),
        venueName: data.venueName,
        venueAddress: data.venueAddress,
        designId: data.designId,
        userId: userId,
        ceremonyTime: data.ceremonyTime,
        receptionTime: data.receptionTime,
        invitationText: data.invitationText,
        moreInfo: data.moreInfo,
        rsvpDetails: data.rsvpDetails,
        rsvpForm: data.rsvpForm,
        rsvpDate: data.rsvpDate ? new Date(data.rsvpDate) : null,
        message: data.message,
        blessingText: data.blessingText,
        welcomeMessage: data.welcomeMessage,
        dressCode: data.dressCode,
        contact: data.contact,
        title: data.title,
        description: data.description,
        customDomain: data.customDomain,
        photos: data.photos || [],
        program: data.program || {},
        restrictions: data.restrictions,
        languages: data.languages || ['fr'],
        maxGuests: data.maxGuests
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
    
    if (data.coupleName !== undefined) updateData.coupleName = data.coupleName;
    if (data.weddingDate !== undefined) updateData.weddingDate = new Date(data.weddingDate);
    if (data.venueName !== undefined) updateData.venueName = data.venueName;
    if (data.venueAddress !== undefined) updateData.venueAddress = data.venueAddress;
    if (data.ceremonyTime !== undefined) updateData.ceremonyTime = data.ceremonyTime;
    if (data.receptionTime !== undefined) updateData.receptionTime = data.receptionTime;
    if (data.invitationText !== undefined) updateData.invitationText = data.invitationText;
    if (data.moreInfo !== undefined) updateData.moreInfo = data.moreInfo;
    if (data.rsvpDetails !== undefined) updateData.rsvpDetails = data.rsvpDetails;
    if (data.rsvpForm !== undefined) updateData.rsvpForm = data.rsvpForm;
    if (data.rsvpDate !== undefined) updateData.rsvpDate = data.rsvpDate ? new Date(data.rsvpDate) : null;
    if (data.message !== undefined) updateData.message = data.message;
    if (data.blessingText !== undefined) updateData.blessingText = data.blessingText;
    if (data.welcomeMessage !== undefined) updateData.welcomeMessage = data.welcomeMessage;
    if (data.dressCode !== undefined) updateData.dressCode = data.dressCode;
    if (data.contact !== undefined) updateData.contact = data.contact;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.customDomain !== undefined) updateData.customDomain = data.customDomain;
    if (data.photos !== undefined) updateData.photos = data.photos;
    if (data.program !== undefined) updateData.program = data.program;
    if (data.restrictions !== undefined) updateData.restrictions = data.restrictions;
    if (data.languages !== undefined) updateData.languages = data.languages;
    if (data.maxGuests !== undefined) updateData.maxGuests = data.maxGuests;
    
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
        userId
      }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée');
    }

    if (invitation.status === PrismaInvitationStatus.PUBLISHED) {
      throw new Error('Impossible de supprimer une invitation publiée');
    }

    // Supprimer les fichiers S3 associés
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
      filename: `invites-${invitation.title?.toLowerCase().replace(/\s+/g, '-') || 'invitation'}.csv`
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
} 