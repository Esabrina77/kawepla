/**
 * Service métier pour la gestion des réponses RSVP.
 * Contient la logique d'accès à la base de données via Prisma.
 */
import { prisma } from '../lib/prisma';
import { RSVPStatus } from '@prisma/client';

// Types pour la création et mise à jour de RSVP
type RSVPCreateInput = {
  status: RSVPStatus;
  message?: string;
  attendingCeremony?: boolean;
  attendingReception?: boolean;
  profilePhotoUrl?: string;
  plusOne?: boolean;
  plusOneName?: string;
  dietaryRestrictions?: string;
};

type RSVPUpdateInput = {
  status?: RSVPStatus;
  message?: string;
  attendingCeremony?: boolean;
  attendingReception?: boolean;
  profilePhotoUrl?: string;
  plusOne?: boolean;
  plusOneName?: string;
  dietaryRestrictions?: string;
};

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

    // Retourner la structure attendue par le frontend
    return {
      invitation: guest.invitation,
      guest: {
        id: guest.id,
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone,
        plusOne: guest.plusOne,
        plusOneName: guest.plusOneName,
        dietaryRestrictions: guest.dietaryRestrictions
      }
    };
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

    // Note: L'utilisateur peut changer sa décision concernant l'accompagnant
    // La vérification se fait au niveau de l'interface utilisateur

    // Calculer le nombre d'invités basé sur plusOne
    const numberOfGuests = data.plusOne ? 2 : 1;

    // Créer la réponse RSVP
    const rsvp = await prisma.rSVP.create({
      data: {
        status: data.status,
        numberOfGuests: numberOfGuests,
        message: data.message,
        attendingCeremony: data.attendingCeremony ?? true,
        attendingReception: data.attendingReception ?? true,
        profilePhotoUrl: data.profilePhotoUrl,
        guestId: guest.id,
        invitationId: guest.invitationId,
        respondedAt: new Date()
      }
    });

    // Marquer le token comme utilisé ET mettre à jour les informations de l'invité
    await prisma.guest.update({
      where: {
        id: guest.id
      },
      data: {
        usedAt: new Date(),
        profilePhotoUrl: data.profilePhotoUrl || null,
        plusOne: data.plusOne || false,
        plusOneName: data.plusOneName || null,
        dietaryRestrictions: data.dietaryRestrictions || null
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

    if (!guest.rsvp) {
      // Pas d'erreur, c'est normal qu'il n'y ait pas encore de RSVP
      return null;
    }

    // Retourner les données RSVP avec les informations de l'invité
    return {
      ...guest.rsvp,
      plusOne: guest.plusOne,
      plusOneName: guest.plusOneName,
      dietaryRestrictions: guest.dietaryRestrictions,
      profilePhotoUrl: guest.profilePhotoUrl,
      guest: {
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone
      }
    };
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

    // Note: L'utilisateur peut changer sa décision concernant l'accompagnant
    // La vérification se fait au niveau de l'interface utilisateur

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
   * Mettre à jour la photo de profil de l'invité quand le RSVP est mis à jour
   */
  static async updateRSVPWithPhotoUpdate(inviteToken: string, data: RSVPUpdateInput) {
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

    // Note: L'utilisateur peut changer sa décision concernant l'accompagnant
    // La vérification se fait au niveau de l'interface utilisateur

    // Calculer le nombre d'invités basé sur plusOne si fourni
    const numberOfGuests = data.plusOne !== undefined ? (data.plusOne ? 2 : 1) : undefined;

    // Mettre à jour le RSVP
    const updatedRSVP = await prisma.rSVP.update({
      where: {
        id: guest.rsvp.id
      },
      data: {
        ...data,
        numberOfGuests: numberOfGuests !== undefined ? numberOfGuests : guest.rsvp.numberOfGuests,
        respondedAt: new Date()
      }
    });

    // Mettre à jour les informations de l'invité si nécessaire
    const guestUpdateData: any = {};
    if (data.profilePhotoUrl !== undefined) {
      guestUpdateData.profilePhotoUrl = data.profilePhotoUrl;
    }
    if (data.plusOne !== undefined) {
      guestUpdateData.plusOne = data.plusOne;
    }
    if (data.plusOneName !== undefined) {
      guestUpdateData.plusOneName = data.plusOneName;
    }
    if (data.dietaryRestrictions !== undefined) {
      guestUpdateData.dietaryRestrictions = data.dietaryRestrictions;
    }

    if (Object.keys(guestUpdateData).length > 0) {
      await prisma.guest.update({
        where: {
          id: guest.id
        },
        data: guestUpdateData
      });
    }

    return updatedRSVP;
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
      },
      orderBy: {
        respondedAt: 'desc'
      }
    });
  }

  /**
   * Créer un invité via lien partageable
   */
  static async createGuestFromShareableLink(invitationId: string, data: any, shareableToken: string) {
    // Validation côté service
    if (!data.firstName || data.firstName.trim().length < 2) {
      throw new Error('Le prénom est requis (minimum 2 caractères)');
    }
    if (!data.lastName || data.lastName.trim().length < 2) {
      throw new Error('Le nom est requis (minimum 2 caractères)');
    }
    
    // Téléphone requis
    if (!data.phone || data.phone.trim().length < 8) {
      throw new Error('Le numéro de téléphone est requis (minimum 8 caractères)');
    }

    // Récupérer l'invitation et son propriétaire
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      select: { userId: true }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée');
    }

    // Vérifier l'unicité de l'email pour cette invitation (si email fourni)
    if (data.email) {
      const existingGuest = await prisma.guest.findFirst({
        where: {
          invitationId: invitationId,
          email: data.email
        }
      });

      if (existingGuest) {
        throw new Error('Cet email est déjà utilisé par un autre invité pour cette invitation');
      }
    }

    // Générer un token unique pour cet invité
    const inviteToken = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Créer l'invité en liant au propriétaire de l'invitation
    const guest = await prisma.guest.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone,
        invitationId: invitationId,
        userId: invitation.userId, // Lier au propriétaire de l'invitation
        inviteToken: inviteToken,
        plusOne: data.plusOne || false,
        plusOneName: data.plusOneName || null,
        invitationType: 'SHAREABLE',
        sharedLinkUsed: true,
        profilePhotoUrl: data.profilePhotoUrl || null // Ajouter la photo de profil
      }
    });

    // Associer le lien partageable au guest
    await prisma.shareableLink.update({
      where: { token: shareableToken },
      data: {
        status: 'USED',
        guestId: guest.id,
        usedCount: {
          increment: 1
        }
      }
    });

    return guest;
  }
} 