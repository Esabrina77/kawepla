/**
 * Script de nettoyage des photos orphelines dans Firebase
 * Ce script identifie et supprime les photos qui existent dans Firebase
 * mais qui n'ont plus de référence dans la base de données
 */
import { prisma } from '../lib/prisma';
import { deleteFromFirebase } from '../utils/firebase';

interface OrphanedPhoto {
  url: string;
  reason: string;
}

export class OrphanedPhotosCleanup {
  /**
   * Nettoyer toutes les photos orphelines
   */
  static async cleanupAll(): Promise<void> {
    console.log('🧹 Début du nettoyage des photos orphelines...');

    try {
      // Récupérer toutes les URLs de photos valides de la base de données
      const validPhotoUrls = await this.getValidPhotoUrls();
      console.log(`📊 ${validPhotoUrls.size} URLs de photos valides trouvées`);

      // Identifier les photos orphelines par type
      const orphanedPhotos: OrphanedPhoto[] = [];

      // Photos de mariage
      orphanedPhotos.push(...await this.findOrphanedWeddingPhotos(validPhotoUrls));

      // Photos d'invités
      orphanedPhotos.push(...await this.findOrphanedGuestPhotos(validPhotoUrls));

      // Photos de profil
      orphanedPhotos.push(...await this.findOrphanedProfilePhotos(validPhotoUrls));

      // Photos de providers
      orphanedPhotos.push(...await this.findOrphanedProviderPhotos(validPhotoUrls));

      console.log(`🔍 ${orphanedPhotos.length} photos orphelines identifiées`);

      if (orphanedPhotos.length === 0) {
        console.log('✅ Aucune photo orpheline trouvée');
        return;
      }

      // Supprimer les photos orphelines
      await this.deleteOrphanedPhotos(orphanedPhotos);

      console.log('✅ Nettoyage des photos orphelines terminé');
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des photos orphelines:', error);
      throw error;
    }
  }

  /**
   * Récupérer toutes les URLs de photos valides de la base de données
   */
  private static async getValidPhotoUrls(): Promise<Set<string>> {
    const validUrls = new Set<string>();

    // Photos des albums
    const photos = await prisma.photo.findMany({
      select: {
        originalUrl: true,
        compressedUrl: true,
        thumbnailUrl: true
      }
    });

    photos.forEach(photo => {
      if (photo.originalUrl) validUrls.add(photo.originalUrl);
      if (photo.compressedUrl) validUrls.add(photo.compressedUrl);
      if (photo.thumbnailUrl) validUrls.add(photo.thumbnailUrl);
    });

    // Photos de profil des invités
    const guestProfilePhotos = await prisma.guest.findMany({
      where: {
        profilePhotoUrl: {
          not: null
        }
      },
      select: {
        profilePhotoUrl: true
      }
    });

    guestProfilePhotos.forEach(guest => {
      if (guest.profilePhotoUrl) validUrls.add(guest.profilePhotoUrl);
    });

    // Photos de profil des providers
    const providerProfiles = await prisma.providerProfile.findMany({
      select: {
        profilePhoto: true,
        portfolio: true
      }
    });

    providerProfiles.forEach(profile => {
      if (profile.profilePhoto) validUrls.add(profile.profilePhoto);
      profile.portfolio.forEach(url => validUrls.add(url));
    });

    return validUrls;
  }

  /**
   * Trouver les photos de mariage orphelines
   */
  private static async findOrphanedWeddingPhotos(validUrls: Set<string>): Promise<OrphanedPhoto[]> {
    // Cette méthode devrait scanner Firebase pour les photos de mariage
    // et comparer avec les URLs valides
    // Pour l'instant, on retourne un tableau vide
    // TODO: Implémenter la logique de scan Firebase
    return [];
  }

  /**
   * Trouver les photos d'invités orphelines
   */
  private static async findOrphanedGuestPhotos(validUrls: Set<string>): Promise<OrphanedPhoto[]> {
    // Cette méthode devrait scanner Firebase pour les photos d'invités
    // et comparer avec les URLs valides
    // Pour l'instant, on retourne un tableau vide
    // TODO: Implémenter la logique de scan Firebase
    return [];
  }

  /**
   * Trouver les photos de profil orphelines
   */
  private static async findOrphanedProfilePhotos(validUrls: Set<string>): Promise<OrphanedPhoto[]> {
    // Cette méthode devrait scanner Firebase pour les photos de profil
    // et comparer avec les URLs valides
    // Pour l'instant, on retourne un tableau vide
    // TODO: Implémenter la logique de scan Firebase
    return [];
  }

  /**
   * Trouver les photos de providers orphelines
   */
  private static async findOrphanedProviderPhotos(validUrls: Set<string>): Promise<OrphanedPhoto[]> {
    // Cette méthode devrait scanner Firebase pour les photos de providers
    // et comparer avec les URLs valides
    // Pour l'instant, on retourne un tableau vide
    // TODO: Implémenter la logique de scan Firebase
    return [];
  }

  /**
   * Supprimer les photos orphelines
   */
  private static async deleteOrphanedPhotos(orphanedPhotos: OrphanedPhoto[]): Promise<void> {
    console.log(`🗑️ Suppression de ${orphanedPhotos.length} photos orphelines...`);

    let successCount = 0;
    let errorCount = 0;

    for (const photo of orphanedPhotos) {
      try {
        await deleteFromFirebase(photo.url);
        successCount++;
        console.log(`✅ Supprimé: ${photo.url} (${photo.reason})`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Erreur lors de la suppression de ${photo.url}:`, error);
      }
    }

    console.log(`📊 Résultats: ${successCount} supprimées, ${errorCount} erreurs`);
  }

  /**
   * Nettoyer les photos d'un utilisateur spécifique
   */
  static async cleanupUserPhotos(userId: string): Promise<void> {
    console.log(`🧹 Nettoyage des photos pour l'utilisateur: ${userId}`);

    try {
      // Récupérer toutes les photos de l'utilisateur
      const userPhotos = await prisma.photo.findMany({
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

      console.log(`📸 ${userPhotos.length} photos trouvées pour l'utilisateur`);

      // Supprimer toutes les photos de Firebase
      for (const photo of userPhotos) {
        try {
          await Promise.all([
            deleteFromFirebase(photo.originalUrl),
            photo.compressedUrl ? deleteFromFirebase(photo.compressedUrl) : Promise.resolve(),
            photo.thumbnailUrl ? deleteFromFirebase(photo.thumbnailUrl) : Promise.resolve()
          ]);
          console.log(`✅ Photo ${photo.id} supprimée de Firebase`);
        } catch (error) {
          console.error(`❌ Erreur lors de la suppression de la photo ${photo.id}:`, error);
        }
      }

      console.log(`✅ Nettoyage terminé pour l'utilisateur: ${userId}`);
    } catch (error) {
      console.error(`❌ Erreur lors du nettoyage des photos de l'utilisateur ${userId}:`, error);
      throw error;
    }
  }
}

// Script exécutable
if (require.main === module) {
  OrphanedPhotosCleanup.cleanupAll()
    .then(() => {
      console.log('🎉 Script de nettoyage terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}
