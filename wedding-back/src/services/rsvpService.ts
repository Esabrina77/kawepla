/**
 * Service métier pour la gestion des réponses RSVP.
 * Contient la logique d'accès à la base de données via Prisma.
 */
import { prisma } from '../lib/prisma';
import { RSVPStatus } from '@prisma/client';

// Types pour la création et mise à jour de RSVP
type RSVPCreateInput = {
  status: RSVPStatus;
  numberOfGuests: number;
  message?: string;
  attendingCeremony?: boolean;
  attendingReception?: boolean;
};

type RSVPUpdateInput = Partial<RSVPCreateInput>;

export class RSVPService {
  /**
   * Récupérer les détails de l'invitation avec le token
   */
  static async getInvitationByToken(inviteToken: string) {
    const guest = await prisma.guest.findUnique({
      where: {
        inviteToken: inviteToken
      },
      include: {
        invitation: {
          include: {
            design: true // Inclure toutes les données du design
          }
        }
      }
    });

    if (!guest) {
      throw new Error('Invité non trouvé');
    }

    // Vérifier si l'invitation est publiée
    if (guest.invitation.status !== 'PUBLISHED') {
      throw new Error('Cette invitation n\'est pas encore publiée');
    }

    return guest.invitation;
  }

  /**
   * Créer une nouvelle réponse RSVP
   */
  static async createRSVP(inviteToken: string, data: RSVPCreateInput) {
    if (!inviteToken) {
      throw new Error('Token d\'invitation requis');
    }

    const guest = await prisma.guest.findUnique({
      where: {
        inviteToken: inviteToken
      },
      include: {
        invitation: true
      }
    });

    if (!guest) {
      throw new Error('Invité non trouvé');
    }

    // Vérifier si l'invitation est publiée
    if (guest.invitation.status !== 'PUBLISHED') {
      throw new Error('Cette invitation n\'est pas encore publiée');
    }

    // Vérifier si le token a déjà été utilisé
    if (guest.usedAt) {
      throw new Error('Ce lien d\'invitation a déjà été utilisé');
    }

    // Vérifier le nombre d'invités autorisé
    if (guest.plusOne === false && data.numberOfGuests > 1) {
      throw new Error('Nombre d\'invités non autorisé');
    }

    // Créer la réponse RSVP
    const rsvp = await prisma.rSVP.create({
      data: {
        status: data.status,
        numberOfGuests: data.numberOfGuests,
        message: data.message,
        attendingCeremony: data.attendingCeremony ?? true,
        attendingReception: data.attendingReception ?? true,
        guestId: guest.id,
        invitationId: guest.invitationId,
        respondedAt: new Date()
      }
    });

    // Marquer le token comme utilisé
    await prisma.guest.update({
      where: {
        id: guest.id
      },
      data: {
        usedAt: new Date()
      }
    });

    return rsvp;
  }

  /**
   * Récupérer une réponse RSVP par token d'invitation
   */
  static async getRSVPByToken(inviteToken: string) {
    const guest = await prisma.guest.findUnique({
      where: {
        inviteToken: inviteToken
      },
      include: {
        rsvp: true
      }
    });

    if (!guest) {
      throw new Error('Invité non trouvé');
    }

    return guest.rsvp;
  }

  /**
   * Mettre à jour une réponse RSVP
   */
  static async updateRSVP(inviteToken: string, data: RSVPUpdateInput) {
    const guest = await prisma.guest.findUnique({
      where: {
        inviteToken: inviteToken
      },
      include: {
        rsvp: true,
        invitation: true
      }
    });

    if (!guest) {
      throw new Error('Invité non trouvé');
    }

    if (!guest.rsvp) {
      throw new Error('Aucune réponse RSVP trouvée');
    }

    // Vérifier si l'invitation est publiée
    if (guest.invitation.status !== 'PUBLISHED') {
      throw new Error('Cette invitation n\'est pas encore publiée');
    }

    // Vérifier le nombre d'invités autorisé
    if (guest.plusOne === false && data.numberOfGuests && data.numberOfGuests > 1) {
      throw new Error('Nombre d\'invités non autorisé');
    }

    return prisma.rSVP.update({
      where: {
        id: guest.rsvp.id
      },
      data: {
        ...data,
        respondedAt: new Date()
      }
    });
  }

  /**
   * Liste des RSVPs d'une invitation
   */
  static async listRSVPs(invitationId: string, userId: string) {
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        userId: userId
      }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée ou accès non autorisé');
    }

    return prisma.rSVP.findMany({
      where: {
        invitationId: invitationId
      },
      include: {
        guest: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            isVIP: true,
            dietaryRestrictions: true,
            plusOne: true,
            plusOneName: true
          }
        }
      }
    });
  }
} 