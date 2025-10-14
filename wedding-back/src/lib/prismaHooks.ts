/**
 * Hooks Prisma pour gérer les suppressions en cascade avec Firebase
 */
import { PrismaClient } from '@prisma/client';
import { FirebaseCleanupService } from '../services/firebaseCleanupService';

export function setupPrismaHooks(prisma: PrismaClient) {
  // Hook pour la suppression d'utilisateur
  prisma.$use(async (params, next) => {
    if (params.model === 'User' && params.action === 'delete') {
      const userId = params.args.where.id;
      
      try {
        // Nettoyer les fichiers Firebase avant la suppression
        await FirebaseCleanupService.deleteUserFiles(userId);
        console.log(`🧹 Nettoyage Firebase terminé pour l'utilisateur: ${userId}`);
      } catch (error) {
        console.error(`❌ Erreur lors du nettoyage Firebase pour l'utilisateur ${userId}:`, error);
        // Continuer même si Firebase échoue
      }
    }

    return next(params);
  });

  // Hook pour la suppression d'invitation
  prisma.$use(async (params, next) => {
    if (params.model === 'Invitation' && params.action === 'delete') {
      const invitationId = params.args.where.id;
      
      try {
        // Nettoyer les fichiers Firebase avant la suppression
        await FirebaseCleanupService.deleteInvitationPhotos(invitationId);
        console.log(`🧹 Nettoyage Firebase terminé pour l'invitation: ${invitationId}`);
      } catch (error) {
        console.error(`❌ Erreur lors du nettoyage Firebase pour l'invitation ${invitationId}:`, error);
        // Continuer même si Firebase échoue
      }
    }

    return next(params);
  });

  // Hook pour la suppression d'album
  prisma.$use(async (params, next) => {
    if (params.model === 'PhotoAlbum' && params.action === 'delete') {
      const albumId = params.args.where.id;
      
      try {
        // Nettoyer les fichiers Firebase avant la suppression
        await FirebaseCleanupService.deleteAlbumPhotos(albumId);
        console.log(`🧹 Nettoyage Firebase terminé pour l'album: ${albumId}`);
      } catch (error) {
        console.error(`❌ Erreur lors du nettoyage Firebase pour l'album ${albumId}:`, error);
        // Continuer même si Firebase échoue
      }
    }

    return next(params);
  });

  // Hook pour la suppression d'invité
  prisma.$use(async (params, next) => {
    if (params.model === 'Guest' && params.action === 'delete') {
      const guestId = params.args.where.id;
      
      try {
        // Nettoyer les fichiers Firebase avant la suppression
        await FirebaseCleanupService.deleteGuestPhotos(guestId);
        console.log(`🧹 Nettoyage Firebase terminé pour l'invité: ${guestId}`);
      } catch (error) {
        console.error(`❌ Erreur lors du nettoyage Firebase pour l'invité ${guestId}:`, error);
        // Continuer même si Firebase échoue
      }
    }

    return next(params);
  });

  // Hook pour la suppression de photo
  prisma.$use(async (params, next) => {
    if (params.model === 'Photo' && params.action === 'delete') {
      const photoId = params.args.where.id;
      
      try {
        // Récupérer la photo avant suppression pour obtenir les URLs
        const photo = await prisma.photo.findUnique({
          where: { id: photoId },
          select: {
            originalUrl: true,
            compressedUrl: true,
            thumbnailUrl: true
          }
        });

        if (photo) {
          // Nettoyer les fichiers Firebase
          const { deleteFromFirebase } = await import('../utils/firebase');
          await Promise.all([
            deleteFromFirebase(photo.originalUrl),
            photo.compressedUrl ? deleteFromFirebase(photo.compressedUrl) : Promise.resolve(),
            photo.thumbnailUrl ? deleteFromFirebase(photo.thumbnailUrl) : Promise.resolve()
          ]);
          console.log(`🧹 Nettoyage Firebase terminé pour la photo: ${photoId}`);
        }
      } catch (error) {
        console.error(`❌ Erreur lors du nettoyage Firebase pour la photo ${photoId}:`, error);
        // Continuer même si Firebase échoue
      }
    }

    return next(params);
  });

  console.log('🔧 Hooks Prisma configurés pour le nettoyage Firebase');
}
