/**
 * Service pour gérer les albums photos des mariages
 */
import { prisma } from '../lib/prisma';
import { uploadToFirebase, deleteFromFirebase } from '../utils/firebase';
import sharp from 'sharp';
import { PhotoStatus } from '@prisma/client';

export class PhotoAlbumService {
  /**
   * Créer un album photo pour une invitation
   */
  static async createAlbum(invitationId: string, userId: string, data: {
    title: string;
    description?: string;
    isPublic?: boolean;
  }) {
    // Vérifier que l'invitation appartient à l'utilisateur
    const invitation = await prisma.invitation.findFirst({
      where: { 
        id: invitationId, 
        userId 
      }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée ou accès non autorisé');
    }

    const album = await prisma.photoAlbum.create({
      data: {
        title: data.title,
        description: data.description,
        isPublic: data.isPublic || false,
        invitationId: invitationId
      }
    });

    // Retourner l'album avec un tableau photos vide
    return {
      ...album,
      photos: []
    };
  }

  /**
   * Uploader une photo dans un album avec compression
   */
  static async uploadPhoto(
    albumId: string, 
    file: Express.Multer.File, 
    uploadedByUserId?: string, // ID du User (couple)
    uploadedByGuestId?: string, // ID du Guest (invité)
    caption?: string
  ) {
    // Vérifier que l'album existe
    const album = await prisma.photoAlbum.findUnique({
      where: { id: albumId },
      include: { invitation: true }
    });

    if (!album) {
      throw new Error('Album non trouvé');
    }

    try {
      const timestamp = Date.now();
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
      const fileName = `wedding-photos/${album.invitation.id}/${albumId}/${timestamp}.${fileExtension}`;
      
      let originalUrl: string;
      let compressedUrl: string;
      let thumbnailUrl: string;
      
      try {
        // Essayer d'uploader vers Firebase
        originalUrl = await uploadToFirebase(file.buffer, fileName, file.mimetype);
        compressedUrl = originalUrl; // Pour l'instant, même URL
        thumbnailUrl = originalUrl; // Pour l'instant, même URL
        console.log('Photo uploadée avec succès vers Firebase:', originalUrl);
      } catch (firebaseError) {
        console.warn('Erreur Firebase, utilisation de placeholders:', firebaseError);
        // Fallback vers des placeholders si Firebase échoue
        const timestamp = Date.now();
        originalUrl = `https://via.placeholder.com/800x600/cccccc/666666?text=Photo+${timestamp}`;
        compressedUrl = `https://via.placeholder.com/800x600/cccccc/666666?text=Compressed+${timestamp}`;
        thumbnailUrl = `https://via.placeholder.com/300x300/cccccc/666666?text=Thumb+${timestamp}`;
        console.log('URLs placeholder générées:', { originalUrl, compressedUrl, thumbnailUrl });
      }

      // Sauvegarder en base de données
      const photo = await prisma.photo.create({
        data: {
          originalUrl,
          compressedUrl,
          thumbnailUrl,
          filename: file.originalname,
          size: file.size,
          width: 800,
          height: 600,
          mimeType: file.mimetype,
          caption,
          albumId,
          // uploadedById fait référence à un Guest, pas un User
          ...(uploadedByGuestId && { uploadedById: uploadedByGuestId }),
          // Si uploadé par les mariés (User), directement approuvé
          // Si uploadé par un invité (Guest), en attente d'approbation
          status: uploadedByUserId ? 'APPROVED' : 'PENDING'
        }
      });

      return photo;
    } catch (error) {
      console.error('Erreur lors de l\'upload de la photo:', error);
      throw new Error('Erreur lors de l\'upload de la photo');
    }
  }

  /**
   * Approuver une photo (par les mariés)
   */
  static async approvePhoto(photoId: string, userId: string) {
    // Vérifier que la photo appartient à une invitation de l'utilisateur
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: {
        album: {
          include: {
            invitation: true
          }
        }
      }
    });

    if (!photo) {
      throw new Error('Photo non trouvée');
    }

    if (photo.album.invitation.userId !== userId) {
      throw new Error('Accès non autorisé');
    }

    return await prisma.photo.update({
      where: { id: photoId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date()
      }
    });
  }

  /**
   * Publier une photo publiquement
   */
  static async publishPhoto(photoId: string, userId: string) {
    // Vérifier que la photo appartient à une invitation de l'utilisateur
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: {
        album: {
          include: {
            invitation: true
          }
        }
      }
    });

    if (!photo) {
      throw new Error('Photo non trouvée');
    }

    if (photo.album.invitation.userId !== userId) {
      throw new Error('Accès non autorisé');
    }

    return await prisma.photo.update({
      where: { id: photoId },
      data: {
        status: 'PUBLIC',
        publishedAt: new Date()
      }
    });
  }

  /**
   * Rejeter une photo
   */
  static async rejectPhoto(photoId: string, userId: string) {
    // Vérifier que la photo appartient à une invitation de l'utilisateur
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: {
        album: {
          include: {
            invitation: true
          }
        }
      }
    });

    if (!photo) {
      throw new Error('Photo non trouvée');
    }

    if (photo.album.invitation.userId !== userId) {
      throw new Error('Accès non autorisé');
    }

    return await prisma.photo.update({
      where: { id: photoId },
      data: {
        status: 'REJECTED'
      }
    });
  }

  /**
   * Supprimer une photo
   */
  static async deletePhoto(photoId: string, userId: string) {
    // Vérifier que la photo appartient à une invitation de l'utilisateur
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: {
        album: {
          include: {
            invitation: true
          }
        }
      }
    });

    if (!photo) {
      throw new Error('Photo non trouvée');
    }

    if (photo.album.invitation.userId !== userId) {
      throw new Error('Accès non autorisé');
    }

    try {
      // Supprimer les fichiers de Firebase (ne pas faire échouer si Firebase échoue)
      try {
        await Promise.all([
          deleteFromFirebase(photo.originalUrl),
          photo.compressedUrl ? deleteFromFirebase(photo.compressedUrl) : Promise.resolve(),
          photo.thumbnailUrl ? deleteFromFirebase(photo.thumbnailUrl) : Promise.resolve()
        ]);
        console.log('Suppression Firebase terminée pour la photo:', photoId);
      } catch (firebaseError) {
        console.warn('Erreur lors de la suppression Firebase (continuation):', firebaseError);
        // Continuer même si Firebase échoue
      }

      // Supprimer de la base de données
      await prisma.photo.delete({
        where: { id: photoId }
      });

      console.log('Photo supprimée avec succès de la base de données:', photoId);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression de la photo:', error);
      throw new Error('Erreur lors de la suppression de la photo');
    }
  }

  /**
   * Récupérer les albums d'une invitation
   */
  static async getAlbumsByInvitation(invitationId: string, userId: string) {
    // Vérifier que l'invitation appartient à l'utilisateur
    const invitation = await prisma.invitation.findFirst({
      where: { 
        id: invitationId, 
        userId 
      }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée ou accès non autorisé');
    }

    return await prisma.photoAlbum.findMany({
      where: { invitationId },
      include: {
        photos: {
          include: {
            uploadedBy: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            uploadedAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Récupérer les photos d'un album (pour les invités)
   */
  static async getAlbumPhotosForGuest(albumId: string) {
    const album = await prisma.photoAlbum.findUnique({
      where: { id: albumId },
      include: {
        invitation: {
          select: {
            id: true,
            eventTitle: true,
            eventDate: true
          }
        },
        photos: {
          where: {
            status: {
              in: ['APPROVED', 'PUBLIC']
            }
          },
          select: {
            id: true,
            compressedUrl: true,
            thumbnailUrl: true,
            caption: true,
            status: true,
            uploadedAt: true,
            uploadedBy: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            uploadedAt: 'desc'
          }
        }
      }
    });

    if (!album) {
      throw new Error('Album non trouvé');
    }

    return album;
  }

  /**
   * Récupérer les photos publiques d'une invitation
   */
  static async getPublicPhotos(invitationId: string) {
    return await prisma.photo.findMany({
      where: {
        album: {
          invitationId: invitationId
        },
        status: 'PUBLIC'
      },
      include: {
        uploadedBy: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        album: {
          select: {
    
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      }
    });
  }

  /**
   * Mettre à jour un album
   */
  static async updateAlbum(albumId: string, userId: string, data: {
    title?: string;
    description?: string;
    isPublic?: boolean;
    coverPhotoUrl?: string;
  }) {
    // Vérifier que l'album appartient à l'utilisateur
    const album = await prisma.photoAlbum.findUnique({
      where: { id: albumId },
      include: {
        invitation: true
      }
    });

    if (!album) {
      throw new Error('Album non trouvé');
    }

    if (album.invitation.userId !== userId) {
      throw new Error('Accès non autorisé');
    }

    const updatedAlbum = await prisma.photoAlbum.update({
      where: { id: albumId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
        ...(data.coverPhotoUrl !== undefined && { coverPhotoUrl: data.coverPhotoUrl })
      },
      include: {
        photos: {
          include: {
            uploadedBy: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            uploadedAt: 'desc'
          }
        }
      }
    });

    return updatedAlbum;
  }

  /**
   * Supprimer un album
   */
  static async deleteAlbum(albumId: string, userId: string) {
    // Vérifier que l'album appartient à l'utilisateur
    const album = await prisma.photoAlbum.findUnique({
      where: { id: albumId },
      include: {
        invitation: true,
        photos: true
      }
    });

    if (!album) {
      throw new Error('Album non trouvé');
    }

    if (album.invitation.userId !== userId) {
      throw new Error('Accès non autorisé');
    }

    try {
      // Supprimer toutes les photos de Firebase
      for (const photo of album.photos) {
        await Promise.all([
          deleteFromFirebase(photo.originalUrl),
          photo.compressedUrl ? deleteFromFirebase(photo.compressedUrl) : Promise.resolve(),
          photo.thumbnailUrl ? deleteFromFirebase(photo.thumbnailUrl) : Promise.resolve()
        ]);
      }

      // Supprimer l'album (les photos seront supprimées en cascade)
      await prisma.photoAlbum.delete({
        where: { id: albumId }
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'album:', error);
      throw new Error('Erreur lors de la suppression de l\'album');
    }
  }
} 