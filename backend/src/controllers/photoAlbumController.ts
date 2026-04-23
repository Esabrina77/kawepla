/**
 * Contrôleur pour les albums photos
 */
import { Request, Response, NextFunction } from 'express';
import { PhotoAlbumService } from '../services/photoAlbumService';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration Multer pour l'upload en mémoire
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Vérifier que c'est une image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});

export class PhotoAlbumController {
  /**
   * Identifier un invité via son code d'accès
   */
  static async identifyGuest(req: Request, res: Response, next: NextFunction) {
    try {
      const { albumId } = req.params;
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Code d\'accès requis' });
      }

      // 1. Trouver l'invitation liée à cet album
      const album = await prisma.photoAlbum.findUnique({
        where: { id: albumId },
        select: { invitationId: true }
      });

      if (!album) {
        return res.status(404).json({ error: 'Album non trouvé' });
      }

      // 2. Trouver l'invité avec ce code pour cette invitation
      const guest = await prisma.guest.findUnique({
        where: {
          unique_access_code_per_invitation: {
            invitationId: album.invitationId,
            albumAccessCode: code
          }
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profilePhotoUrl: true
        }
      });

      if (!guest) {
        return res.status(404).json({ error: 'Code d\'accès invalide pour cet événement' });
      }

      res.json(guest);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Créer un album photo
   */
  static async createAlbum(req: Request, res: Response, next: NextFunction) {
    try {
      const { invitationId } = req.params;
      const userId = (req as any).user.id;
      const { title, description, isPublic } = req.body;

      const album = await PhotoAlbumService.createAlbum(invitationId, userId, {
        title,
        description,
        isPublic
      });

      res.status(201).json(album);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupérer les albums d'une invitation
   */
  static async getAlbumsByInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const { invitationId } = req.params;
      const userId = (req as any).user.id;

      const albums = await PhotoAlbumService.getAlbumsByInvitation(invitationId, userId);

      res.json(albums);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupérer les photos d'un album (pour les invités)
   */
  static async getAlbumPhotosForGuest(req: Request, res: Response, next: NextFunction) {
    try {
      const { albumId } = req.params;

      const album = await PhotoAlbumService.getAlbumPhotosForGuest(albumId);

      res.json(album);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupérer les photos publiques d'une invitation
   */
  static async getPublicPhotos(req: Request, res: Response, next: NextFunction) {
    try {
      const { invitationId } = req.params;

      const photos = await PhotoAlbumService.getPublicPhotos(invitationId);

      res.json(photos);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Uploader une photo dans un album
   */
  static uploadPhoto = [
    upload.single('photo'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { albumId } = req.params;
        const { caption } = req.body;
        const uploadedByUserId = (req as any).user?.id; // ID du User (couple)

        if (!req.file) {
          res.status(400).json({ error: 'Aucune photo fournie' });
          return;
        }

        // Vérifier que l'utilisateur existe si uploadedByUserId est fourni
        if (uploadedByUserId) {
          const user = await prisma.user.findUnique({
            where: { id: uploadedByUserId }
          });
          if (!user) {
            res.status(401).json({ error: 'Utilisateur non trouvé' });
            return;
          }
        }

        const photo = await PhotoAlbumService.uploadPhoto(
          albumId,
          req.file,
          uploadedByUserId, // User ID pour les mariés
          undefined, // Pas de Guest ID
          caption
        );

        res.status(201).json(photo);
      } catch (error) {
        next(error);
      }
    }
  ];

  /**
   * Uploader une photo par un invité (via lien partageable)
   * Accessible à tous ceux qui ont le lien
   */
  static uploadGuestPhoto = [
    upload.single('photo'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { albumId } = req.params;
        const { caption, guestName, uploadedById } = req.body;

        if (!req.file) {
          res.status(400).json({ error: 'Aucune photo fournie' });
          return;
        }

        // Le nom d'invité est optionnel - peut être "Invité anonyme" si non fourni
        const uploaderName = guestName || 'Invité anonyme';

        const photo = await PhotoAlbumService.uploadPhoto(
          albumId,
          req.file,
          undefined, // Pas de User ID
          uploadedById || undefined, // ID de l'invité si identifié
          caption || `Photo de ${uploaderName}`
        );

        res.status(201).json(photo);
      } catch (error) {
        next(error);
      }
    }
  ];

  /**
   * Approuver une photo
   */
  static async approvePhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const { photoId } = req.params;
      const userId = (req as any).user.id;

      const photo = await PhotoAlbumService.approvePhoto(photoId, userId);

      res.json(photo);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Publier une photo publiquement
   */
  static async publishPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const { photoId } = req.params;
      const userId = (req as any).user.id;

      const photo = await PhotoAlbumService.publishPhoto(photoId, userId);

      res.json(photo);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Rejeter une photo
   */
  static async rejectPhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const { photoId } = req.params;
      const userId = (req as any).user.id;

      const photo = await PhotoAlbumService.rejectPhoto(photoId, userId);

      res.json(photo);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Supprimer une photo
   */
  static async deletePhoto(req: Request, res: Response, next: NextFunction) {
    try {
      const { photoId } = req.params;
      const userId = (req as any).user.id;

      await PhotoAlbumService.deletePhoto(photoId, userId);

      res.json({ message: 'Photo supprimée avec succès' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mettre à jour un album
   */
  static async updateAlbum(req: Request, res: Response, next: NextFunction) {
    try {
      const { albumId } = req.params;
      const userId = (req as any).user.id;
      const { title, description, isPublic, coverPhotoUrl } = req.body;

      const album = await PhotoAlbumService.updateAlbum(albumId, userId, {
        title,
        description,
        isPublic,
        coverPhotoUrl
      });

      res.json(album);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Supprimer un album
   */
  static async deleteAlbum(req: Request, res: Response, next: NextFunction) {
    try {
      const { albumId } = req.params;
      const userId = (req as any).user.id;

      await PhotoAlbumService.deleteAlbum(albumId, userId);

      res.json({ message: 'Album supprimé avec succès' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Ajouter ou retirer une réaction à une photo
   */
  static async toggleReaction(req: Request, res: Response, next: NextFunction) {
    try {
      const { photoId } = req.params;
      const { type, guestId, userId } = req.body;

      if (!type) {
        return res.status(400).json({ error: 'Type de réaction requis' });
      }

      const result = await PhotoAlbumService.toggleReaction(photoId, {
        type,
        guestId,
        userId: userId || (req as any).user?.id
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Ajouter un commentaire à une photo
   */
  static async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { photoId } = req.params;
      const { content, guestId, userId } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'Contenu du commentaire requis' });
      }

      const comment = await PhotoAlbumService.addComment(photoId, {
        content,
        guestId,
        userId: userId || (req as any).user?.id
      });

      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Supprimer un commentaire
   */
  static async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { commentId } = req.params;
      const { guestId, userId } = req.body;

      await PhotoAlbumService.deleteComment(commentId, { 
        guestId, 
        userId: userId || (req as any).user?.id 
      });

      res.json({ message: 'Commentaire supprimé' });
    } catch (error) {
      next(error);
    }
  }
}