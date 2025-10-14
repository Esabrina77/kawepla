/**
 * Service de nettoyage Firebase pour les suppressions en cascade
 */
import { prisma } from '../lib/prisma';
import { deleteFromFirebase } from '../utils/firebase';

export class FirebaseCleanupService {
  /**
   * Supprimer toutes les photos d'un utilisateur de Firebase
   */
  static async deleteUserPhotos(userId: string): Promise<void> {
    try {
      console.log(`🧹 Nettoyage Firebase pour l'utilisateur: ${userId}`);

      // Récupérer toutes les photos liées à l'utilisateur
      const photos = await prisma.photo.findMany({
        where: {
          album: {
            invitation: {
              userId: userId
            }
          }
        },
        select: {
          id: true,
          originalUrl: true,
          compressedUrl: true,
          thumbnailUrl: true
        }
      });

      console.log(`📸 ${photos.length} photos trouvées pour l'utilisateur ${userId}`);

      // Supprimer toutes les photos de Firebase
      for (const photo of photos) {
        await this.deletePhotoFromFirebase(photo);
      }

      console.log(`✅ Nettoyage Firebase terminé pour l'utilisateur: ${userId}`);
    } catch (error) {
      console.error(`❌ Erreur lors du nettoyage Firebase pour l'utilisateur ${userId}:`, error);
      // Ne pas faire échouer la suppression de l'utilisateur si Firebase échoue
    }
  }

  /**
   * Supprimer toutes les photos d'une invitation de Firebase
   */
  static async deleteInvitationPhotos(invitationId: string): Promise<void> {
    try {
      console.log(`🧹 Nettoyage Firebase pour l'invitation: ${invitationId}`);

      // Récupérer toutes les photos de l'invitation
      const photos = await prisma.photo.findMany({
        where: {
          album: {
            invitationId: invitationId
          }
        },
        select: {
          id: true,
          originalUrl: true,
          compressedUrl: true,
          thumbnailUrl: true
        }
      });

      console.log(`📸 ${photos.length} photos trouvées pour l'invitation ${invitationId}`);

      // Supprimer toutes les photos de Firebase
      for (const photo of photos) {
        await this.deletePhotoFromFirebase(photo);
      }

      console.log(`✅ Nettoyage Firebase terminé pour l'invitation: ${invitationId}`);
    } catch (error) {
      console.error(`❌ Erreur lors du nettoyage Firebase pour l'invitation ${invitationId}:`, error);
      // Ne pas faire échouer la suppression de l'invitation si Firebase échoue
    }
  }

  /**
   * Supprimer toutes les photos d'un album de Firebase
   */
  static async deleteAlbumPhotos(albumId: string): Promise<void> {
    try {
      console.log(`🧹 Nettoyage Firebase pour l'album: ${albumId}`);

      // Récupérer toutes les photos de l'album
      const photos = await prisma.photo.findMany({
        where: {
          albumId: albumId
        },
        select: {
          id: true,
          originalUrl: true,
          compressedUrl: true,
          thumbnailUrl: true
        }
      });

      console.log(`📸 ${photos.length} photos trouvées pour l'album ${albumId}`);

      // Supprimer toutes les photos de Firebase
      for (const photo of photos) {
        await this.deletePhotoFromFirebase(photo);
      }

      console.log(`✅ Nettoyage Firebase terminé pour l'album: ${albumId}`);
    } catch (error) {
      console.error(`❌ Erreur lors du nettoyage Firebase pour l'album ${albumId}:`, error);
      // Ne pas faire échouer la suppression de l'album si Firebase échoue
    }
  }

  /**
   * Supprimer toutes les photos d'un invité de Firebase
   */
  static async deleteGuestPhotos(guestId: string): Promise<void> {
    try {
      console.log(`🧹 Nettoyage Firebase pour l'invité: ${guestId}`);

      // Récupérer toutes les photos uploadées par l'invité
      const photos = await prisma.photo.findMany({
        where: {
          uploadedById: guestId
        },
        select: {
          id: true,
          originalUrl: true,
          compressedUrl: true,
          thumbnailUrl: true
        }
      });

      console.log(`📸 ${photos.length} photos trouvées pour l'invité ${guestId}`);

      // Supprimer toutes les photos de Firebase
      for (const photo of photos) {
        await this.deletePhotoFromFirebase(photo);
      }

      console.log(`✅ Nettoyage Firebase terminé pour l'invité: ${guestId}`);
    } catch (error) {
      console.error(`❌ Erreur lors du nettoyage Firebase pour l'invité ${guestId}:`, error);
      // Ne pas faire échouer la suppression de l'invité si Firebase échoue
    }
  }

  /**
   * Supprimer une photo spécifique de Firebase
   */
  private static async deletePhotoFromFirebase(photo: {
    id: string;
    originalUrl: string;
    compressedUrl: string | null;
    thumbnailUrl: string | null;
  }): Promise<void> {
    try {
      await Promise.all([
        deleteFromFirebase(photo.originalUrl),
        photo.compressedUrl ? deleteFromFirebase(photo.compressedUrl) : Promise.resolve(),
        photo.thumbnailUrl ? deleteFromFirebase(photo.thumbnailUrl) : Promise.resolve()
      ]);
      console.log(`🗑️ Photo ${photo.id} supprimée de Firebase`);
    } catch (error) {
      console.warn(`⚠️ Erreur lors de la suppression de la photo ${photo.id} de Firebase:`, error);
      // Continuer même si une photo échoue
    }
  }

  /**
   * Nettoyage complet pour un utilisateur (photos + autres fichiers)
   */
  static async deleteUserFiles(userId: string): Promise<void> {
    try {
      console.log(`🧹 Nettoyage complet Firebase pour l'utilisateur: ${userId}`);

      // Supprimer les photos
      await this.deleteUserPhotos(userId);

      // Supprimer les photos de profil des invités
      await this.deleteGuestProfilePhotos(userId);

      // Supprimer les photos de profil des providers (si applicable)
      await this.deleteProviderProfilePhotos(userId);

      console.log(`✅ Nettoyage complet Firebase terminé pour l'utilisateur: ${userId}`);
    } catch (error) {
      console.error(`❌ Erreur lors du nettoyage complet Firebase pour l'utilisateur ${userId}:`, error);
    }
  }

  /**
   * Supprimer les photos de profil des invités d'un utilisateur
   */
  private static async deleteGuestProfilePhotos(userId: string): Promise<void> {
    try {
      const guests = await prisma.guest.findMany({
        where: {
          userId: userId
        },
        select: {
          id: true,
          profilePhotoUrl: true
        }
      });

      for (const guest of guests) {
        if (guest.profilePhotoUrl) {
          try {
            await deleteFromFirebase(guest.profilePhotoUrl);
            console.log(`🗑️ Photo de profil invité ${guest.id} supprimée de Firebase`);
          } catch (error) {
            console.warn(`⚠️ Erreur lors de la suppression de la photo de profil invité ${guest.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression des photos de profil des invités:`, error);
    }
  }

  /**
   * Supprimer les photos de profil des providers d'un utilisateur
   */
  private static async deleteProviderProfilePhotos(userId: string): Promise<void> {
    try {
      const providerProfile = await prisma.providerProfile.findUnique({
        where: {
          userId: userId
        },
        select: {
          id: true,
          profilePhoto: true,
          portfolio: true
        }
      });

      if (providerProfile) {
        // Supprimer la photo de profil
        if (providerProfile.profilePhoto) {
          try {
            await deleteFromFirebase(providerProfile.profilePhoto);
            console.log(`🗑️ Photo de profil provider ${providerProfile.id} supprimée de Firebase`);
          } catch (error) {
            console.warn(`⚠️ Erreur lors de la suppression de la photo de profil provider:`, error);
          }
        }

        // Supprimer le portfolio
        for (const portfolioUrl of providerProfile.portfolio) {
          try {
            await deleteFromFirebase(portfolioUrl);
            console.log(`🗑️ Photo portfolio provider supprimée de Firebase`);
          } catch (error) {
            console.warn(`⚠️ Erreur lors de la suppression d'une photo portfolio:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression des photos de profil provider:`, error);
    }
  }
}
