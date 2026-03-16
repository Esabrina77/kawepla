import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { uploadToFirebase, deleteFromFirebase } from '@/lib/firebase';
import imageCompression from 'browser-image-compression';
import styles from './GuestProfilePhotoUpload.module.css';

interface GuestProfilePhotoUploadProps {
  currentPhotoUrl?: string | null;
  onPhotoChange: (photoUrl: string | null) => void;
  disabled?: boolean;
}

export default function GuestProfilePhotoUpload({ 
  currentPhotoUrl, 
  onPhotoChange, 
  disabled = false 
}: GuestProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('L\'image est trop volumineuse (max 10MB)');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Compresser l'image
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.2, // 200KB max
        maxWidthOrHeight: 256,
        useWebWorker: true,
        fileType: 'image/jpeg'
      });

      // Supprimer l'ancienne photo si elle existe
      if (currentPhotoUrl) {
        try {
          await deleteFromFirebase(currentPhotoUrl);
        } catch (deleteError) {
          console.warn('Erreur lors de la suppression de l\'ancienne photo:', deleteError);
        }
      }

      // Uploader la nouvelle photo
      const fileName = `guest-photos/profile/${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
      const downloadURL = await uploadToFirebase(compressedFile, fileName);

      onPhotoChange(downloadURL);
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setError('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentPhotoUrl) return;

    setUploading(true);
    setError(null);

    try {
      await deleteFromFirebase(currentPhotoUrl);
      onPhotoChange(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Erreur lors de la suppression de l\'image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.photoSection}>
        <div className={styles.photoContainer}>
          {currentPhotoUrl ? (
            <img 
              src={currentPhotoUrl} 
              alt="Votre photo" 
              className={styles.photo}
              onError={() => setError('Erreur lors du chargement de l\'image')}
            />
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>📷</span>
              <span className={styles.placeholderText}>Votre photo</span>
            </div>
          )}
          {uploading && (
            <div className={styles.uploadingOverlay}>
              <div className={styles.spinner}></div>
            </div>
          )}
        </div>
        
        <div className={styles.actions}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className={styles.fileInput}
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
          >
            {uploading ? 'Upload...' : currentPhotoUrl ? '📷 Changer' : '📷 Ajouter'}
          </Button>
          
          {currentPhotoUrl && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemovePhoto}
              disabled={disabled || uploading}
            >
              🗑️ Supprimer
            </Button>
          )}
        </div>
      </div>
      
      {error && (
        <div className={styles.error}>
          <span className={styles.errorIcon}>⚠️</span>
          <span>{error}</span>
        </div>
      )}
      
      <div className={styles.info}>
        <p>📸 Ajoutez votre photo pour que les organisateurs puissent vous reconnaître</p>
        <p>🔒 Votre photo sera visible uniquement par les organisateurs</p>
      </div>
    </div>
  );
} 