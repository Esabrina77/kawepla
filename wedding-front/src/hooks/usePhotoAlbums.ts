/**
 * Hook pour gérer les albums photos
 */
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/apiClient';
import { useBillingLimits } from './useBillingLimits';

export interface Photo {
  id: string;
  originalUrl: string;
  compressedUrl?: string;
  thumbnailUrl?: string;
  filename: string;
  size: number;
  width?: number;
  height?: number;
  mimeType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLIC';
  caption?: string;
  uploadedAt: string;
  approvedAt?: string;
  publishedAt?: string;
  uploadedBy?: {
    firstName: string;
    lastName: string;
  };
}

export interface PhotoAlbum {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  coverPhotoUrl?: string;
  createdAt: string;
  updatedAt: string;
  photos: Photo[];
}

export function usePhotoAlbums(invitationId: string) {
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { limitsData } = useBillingLimits();

  // Récupérer les albums
  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/photos/invitations/${invitationId}/albums`);
      // S'assurer que chaque album a un tableau photos
      const albumsWithPhotos = (response as PhotoAlbum[]).map(album => ({
        ...album,
        photos: album.photos || []
      }));
      setAlbums(albumsWithPhotos);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des albums');
    } finally {
      setLoading(false);
    }
  };

  // Créer un album
  const createAlbum = async (data: { title: string; description?: string; isPublic?: boolean }) => {
    try {
      const response = await apiClient.post(`/photos/invitations/${invitationId}/albums`, data);
      const newAlbum = { ...response as PhotoAlbum, photos: [] };
      setAlbums(prev => [newAlbum, ...prev]);
      return newAlbum;
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la création de l\'album');
    }
  };

  // Mettre à jour un album
  const updateAlbum = async (albumId: string, data: { title?: string; description?: string; isPublic?: boolean; coverPhotoUrl?: string }) => {
    try {
      const response = await apiClient.put(`/photos/albums/${albumId}`, data);
      const updatedAlbum = { ...response as PhotoAlbum, photos: (response as PhotoAlbum).photos || [] };
      setAlbums(prev => prev.map(album => 
        album.id === albumId ? updatedAlbum : album
      ));
      return updatedAlbum;
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la mise à jour de l\'album');
    }
  };

  // Supprimer un album
  const deleteAlbum = async (albumId: string) => {
    try {
      await apiClient.delete(`/photos/albums/${albumId}`);
      setAlbums(prev => prev.filter(album => album.id !== albumId));
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la suppression de l\'album');
    }
  };

  // Uploader une photo
  const uploadPhoto = async (albumId: string, file: File, caption?: string) => {
    try {
      // Vérifier les limites de photos avant l'upload
      if (limitsData) {
        const currentPhotoCount = albums.reduce((total, album) => total + album.photos.length, 0);
        const photoLimit = limitsData.limits.photos;
        
        if (photoLimit !== 999999 && currentPhotoCount >= photoLimit) {
          throw new Error(`Limite atteinte: vous ne pouvez avoir que ${photoLimit} photo(s) avec votre forfait actuel. Passez à un forfait supérieur pour ajouter plus de photos.`);
        }
      }

      const formData = new FormData();
      formData.append('photo', file);
      if (caption) formData.append('caption', caption);

      const response = await apiClient.postFormData(`/photos/albums/${albumId}/photos`, formData);
      const newPhoto = response as Photo;
      
      // Mettre à jour l'album avec la nouvelle photo
      setAlbums(prev => prev.map(album => 
        album.id === albumId 
          ? { ...album, photos: [newPhoto, ...album.photos] }
          : album
      ));
      
      return newPhoto;
    } catch (err: any) {
      console.error('Erreur upload photo:', err);
      
      // Si c'est une erreur Firebase, afficher un message informatif
      if (err.message?.includes('Firebase') || err.message?.includes('storage')) {
        throw new Error('Erreur de stockage temporaire. L\'upload a été sauvegardé avec une image placeholder.');
      }
      
      throw new Error(err.message || 'Erreur lors de l\'upload de la photo');
    }
  };

  // Approuver une photo
  const approvePhoto = async (photoId: string) => {
    try {
      const response = await apiClient.put(`/photos/photos/${photoId}/approve`);
      const updatedPhoto = response as Photo;
      
      // Mettre à jour la photo dans l'album
      setAlbums(prev => prev.map(album => ({
        ...album,
        photos: album.photos.map(photo => 
          photo.id === photoId ? updatedPhoto : photo
        )
      })));
      
      return updatedPhoto;
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de l\'approbation de la photo');
    }
  };

  // Publier une photo
  const publishPhoto = async (photoId: string) => {
    try {
      const response = await apiClient.put(`/photos/photos/${photoId}/publish`);
      const updatedPhoto = response as Photo;
      
      // Mettre à jour la photo dans l'album
      setAlbums(prev => prev.map(album => ({
        ...album,
        photos: album.photos.map(photo => 
          photo.id === photoId ? updatedPhoto : photo
        )
      })));
      
      return updatedPhoto;
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la publication de la photo');
    }
  };

  // Rejeter une photo
  const rejectPhoto = async (photoId: string) => {
    try {
      const response = await apiClient.put(`/photos/photos/${photoId}/reject`);
      const updatedPhoto = response as Photo;
      
      // Mettre à jour la photo dans l'album
      setAlbums(prev => prev.map(album => ({
        ...album,
        photos: album.photos.map(photo => 
          photo.id === photoId ? updatedPhoto : photo
        )
      })));
      
      return updatedPhoto;
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors du rejet de la photo');
    }
  };

  // Supprimer une photo
  const deletePhoto = async (photoId: string) => {
    try {
      await apiClient.delete(`/photos/photos/${photoId}`);
      
      // Supprimer la photo de l'album
      setAlbums(prev => prev.map(album => ({
        ...album,
        photos: album.photos.filter(photo => photo.id !== photoId)
      })));
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la suppression de la photo');
    }
  };

  useEffect(() => {
    if (invitationId) {
      fetchAlbums();
    }
  }, [invitationId]);

  return {
    albums,
    loading,
    error,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    uploadPhoto,
    approvePhoto,
    publishPhoto,
    rejectPhoto,
    deletePhoto,
    refetch: fetchAlbums
  };
}

// Hook pour les photos publiques (pour les invités)
export function usePublicPhotos(invitationId: string) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicPhotos = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/photos/invitations/${invitationId}/photos/public`);
      setPhotos(response as Photo[]);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (invitationId) {
      fetchPublicPhotos();
    }
  }, [invitationId]);

  return {
    photos,
    loading,
    error,
    refetch: fetchPublicPhotos
  };
} 