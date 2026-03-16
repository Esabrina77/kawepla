import { useState } from 'react';

export interface GuestPhotoUploadResult {
  success: boolean;
  message: string;
  photoId?: string;
}

export function useGuestPhotoUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPhoto = async (
    albumId: string,
    file: File,
    guestName: string,
    caption?: string
  ): Promise<GuestPhotoUploadResult> => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('guestName', guestName);
      if (caption) {
        formData.append('caption', caption);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013'}/api/photos/albums/${albumId}/photos/guest`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'upload');
      }

      const result = await response.json();
      
      return {
        success: true,
        message: 'Photo uploadée avec succès !',
        photoId: result.id
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setUploading(false);
    }
  };

  const uploadMultiplePhotos = async (
    albumId: string,
    files: File[],
    guestName: string,
    onProgress?: (completed: number, total: number) => void
  ): Promise<{ success: number; failed: number; errors: string[] }> => {
    setUploading(true);
    setError(null);

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await uploadPhoto(
          albumId,
          files[i],
          guestName,
          `Photo ${i + 1} de ${guestName}`
        );

        if (result.success) {
          successCount++;
        } else {
          failedCount++;
          errors.push(`${files[i].name}: ${result.message}`);
        }

        if (onProgress) {
          onProgress(i + 1, files.length);
        }
      } catch (err) {
        failedCount++;
        errors.push(`${files[i].name}: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      }
    }

    setUploading(false);
    return { success: successCount, failed: failedCount, errors };
  };

  return {
    uploading,
    error,
    uploadPhoto,
    uploadMultiplePhotos,
    clearError: () => setError(null)
  };
} 