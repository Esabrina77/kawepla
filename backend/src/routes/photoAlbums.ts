/**
 * Routes pour les albums photos
 */
import { Router } from 'express';
import { PhotoAlbumController } from '../controllers/photoAlbumController';
import { authMiddleware, requireCouple } from '../middleware/auth';
import { checkPhotoLimit, checkGuestPhotoLimit } from '../middleware/subscriptionLimits';
import { prisma } from '../lib/prisma';
import JSZip from 'jszip';

const router = Router();

// Routes pour les couples (authentifiés)
router.post('/invitations/:invitationId/albums', authMiddleware as any, requireCouple as any, PhotoAlbumController.createAlbum);
router.get('/invitations/:invitationId/albums', authMiddleware as any, requireCouple as any, PhotoAlbumController.getAlbumsByInvitation);
router.put('/albums/:albumId', authMiddleware as any, requireCouple as any, PhotoAlbumController.updateAlbum);
router.delete('/albums/:albumId', authMiddleware as any, requireCouple as any, PhotoAlbumController.deleteAlbum);

// Routes pour la gestion des photos (couples)
router.post('/albums/:albumId/photos', authMiddleware as any, requireCouple as any, checkPhotoLimit, ...PhotoAlbumController.uploadPhoto);
router.put('/photos/:photoId/approve', authMiddleware as any, requireCouple as any, PhotoAlbumController.approvePhoto);
router.put('/photos/:photoId/publish', authMiddleware as any, requireCouple as any, PhotoAlbumController.publishPhoto);
router.put('/photos/:photoId/reject', authMiddleware as any, requireCouple as any, PhotoAlbumController.rejectPhoto);
router.delete('/photos/:photoId', authMiddleware as any, requireCouple as any, PhotoAlbumController.deletePhoto);

// Routes publiques pour les invités
router.get('/albums/:albumId/photos', PhotoAlbumController.getAlbumPhotosForGuest as any);
router.get('/albums/:albumId/identify', PhotoAlbumController.identifyGuest as any);
router.get('/invitations/:invitationId/photos/public', PhotoAlbumController.getPublicPhotos as any);

// Route pour l'upload par les invités (via token partageable)
router.post('/albums/:albumId/photos/guest', ...PhotoAlbumController.uploadGuestPhoto);

// Routes pour les interactions (Likes & Commentaires)
router.post('/photos/:photoId/reactions', PhotoAlbumController.toggleReaction as any);
router.post('/photos/:photoId/comments', PhotoAlbumController.addComment as any);
router.delete('/comments/:commentId', PhotoAlbumController.deleteComment as any);

// Télécharger une photo individuelle (Proxy pour forcer le téléchargement)
router.get('/photos/:photoId/download', async (req: any, res: any) => {
  try {
    const { photoId } = req.params;
    const photo = await prisma.photo.findUnique({ where: { id: photoId } });

    if (!photo) {
      return res.status(404).json({ error: 'Photo non trouvée' });
    }

    const photoUrl = photo.originalUrl || photo.compressedUrl || photo.thumbnailUrl;
    if (!photoUrl) {
      return res.status(404).json({ error: 'URL de photo non trouvée' });
    }

    const response = await fetch(photoUrl);
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    let extension = 'jpg';
    if (contentType.includes('png')) extension = 'png';
    else if (contentType.includes('webp')) extension = 'webp';
    else if (contentType.includes('heic')) extension = 'heic';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="photo_${photoId}.${extension}"`);
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Erreur téléchargement photo:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement' });
  }
});

// Télécharger un album complet en ZIP (Accessible aux invités)
router.get('/albums/:albumId/download', async (req: any, res: any) => {
  try {
    const { albumId } = req.params;
    const userId = req.user?.id;

    // Vérifier que l'album appartient à l'utilisateur
    const album = await prisma.photoAlbum.findFirst({
      where: {
        id: albumId
      },
      include: {
        photos: {
          where: {
            OR: [
              { status: 'APPROVED' },
              { status: 'PUBLIC' }
            ]
          }
        }
      }
    });

    if (!album) {
      res.status(404).json({ error: 'Album non trouvé' });
      return;
    }

    if (album.photos.length === 0) {
      res.status(400).json({ error: 'Aucune photo approuvée dans cet album' });
      return;
    }

    // Créer un zip avec toutes les photos
    const zip = new JSZip();
    
    // Télécharger chaque photo et l'ajouter au zip
    const downloadPromises = album.photos.map(async (photo, index) => {
      try {
        const photoUrl = photo.originalUrl || photo.compressedUrl || photo.thumbnailUrl;
        if (!photoUrl) return;

        const response = await fetch(photoUrl);
        const buffer = await response.arrayBuffer();
        
        // Détecter l'extension via le Content-Type
        const contentType = response.headers.get('content-type');
        let extension = 'jpg';
        if (contentType) {
          if (contentType.includes('png')) extension = 'png';
          else if (contentType.includes('webp')) extension = 'webp';
          else if (contentType.includes('heic')) extension = 'heic';
          else if (contentType.includes('gif')) extension = 'gif';
        } else {
          // Fallback sur l'extension du nom de fichier si possible
          const fileExt = photo.filename.split('.').pop();
          if (fileExt && fileExt !== 'blob') extension = fileExt;
        }

        const filename = `${album.title}_photo_${index + 1}.${extension}`;
        zip.file(filename, buffer);
      } catch (error) {
        console.error(`Erreur lors du téléchargement de la photo ${photo.id}:`, error);
      }
    });

    await Promise.all(downloadPromises);

    // Générer le zip
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Envoyer le zip
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${album.title}_photos.zip"`);
    res.send(zipBuffer);

  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'album:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement de l\'album' });
  }
});

export default router;