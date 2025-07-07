/**
 * Service métier pour la gestion des invités.
 * Contient la logique d'accès à la base de données via Prisma.
 */
import { prisma } from '../lib/prisma';
import { Guest } from '@prisma/client';

type GuestCreateInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isVIP?: boolean;
  dietaryRestrictions?: string;
  plusOne?: boolean;
  plusOneName?: string;
  invitationId: string;
};

type GuestUpdateInput = Partial<GuestCreateInput>;

export class GuestService {
  /**
   * Créer un nouvel invité
   */
  static async createGuest(userId: string, data: GuestCreateInput): Promise<Guest> {
    // Vérifier que l'invitation appartient à l'utilisateur
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: data.invitationId,
        userId
      }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée ou accès non autorisé');
    }

    // Générer un token unique pour l'invité
    const inviteToken = `${Date.now()}-${Math.random().toString(36).substring(2)}`;

    return prisma.guest.create({
      data: {
        ...data,
        userId,
        inviteToken
      }
    });
  }

  /**
   * Récupérer un invité par son ID
   */
  static async getGuestById(id: string, userId: string): Promise<Guest | null> {
    return prisma.guest.findFirst({
      where: {
        id,
        userId
      }
    });
  }

  /**
   * Mettre à jour un invité
   */
  static async updateGuest(id: string, userId: string, data: GuestUpdateInput): Promise<Guest> {
    const guest = await prisma.guest.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!guest) {
      throw new Error('Invité non trouvé ou accès non autorisé');
    }

    return prisma.guest.update({
      where: { id },
      data
    });
  }

  /**
   * Supprimer un invité
   */
  static async deleteGuest(id: string, userId: string): Promise<void> {
    const guest = await prisma.guest.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!guest) {
      throw new Error('Invité non trouvé ou accès non autorisé');
    }

    await prisma.guest.delete({
      where: { id }
    });
  }

  /**
   * Liste des invités d'une invitation
   */
  static async listGuests(invitationId: string, userId: string): Promise<Guest[]> {
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        userId
      }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée ou accès non autorisé');
    }

    return prisma.guest.findMany({
      where: {
        invitationId
      }
    });
  }
} 