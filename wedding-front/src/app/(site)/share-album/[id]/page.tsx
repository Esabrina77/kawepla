'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Camera, 
  Upload, 
  Heart, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  ChevronLeft, 
  ChevronRight,
  Star,
  Sparkles,
  Image as ImageIcon,
  Gift,
  Crown,
  Flower2,
  X,
  ZoomIn,
  Download,
  Grid3X3,
  Eye,
  Share2,
  Copy
} from 'lucide-react';
import { uploadToFirebase } from '@/lib/firebase';
import imageCompression from 'browser-image-compression';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import styles from './share-album.module.css';

interface Album {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  invitation: {
    id: string;
    organisateurName: string;
    eventDate: string;
  };
  photos: Array<{
    id: string;
    compressedUrl: string;
    thumbnailUrl: string;
    caption?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLIC';
    uploadedAt: string;
    uploadedBy?: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export default function ShareAlbumPage() {
  const params = useParams();
  const albumId = params.id as string;
  
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  
  // Formulaire d'upload
  const [guestName, setGuestName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    loadAlbum();
  }, [albumId]);

  const loadAlbum = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013'}/api/photos/albums/${albumId}/photos`);
      
      if (!response.ok) {
        throw new Error('Album non trouvé');
      }
      
      const data = await response.json();
      setAlbum(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Vérifier le nombre de fichiers (max 10)
    if (files.length > 10) {
      setError('Vous ne pouvez uploader que 10 photos maximum à la fois');
      return;
    }
    
    // Vérifier le type et la taille des fichiers
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Seules les images sont autorisées');
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB max
        setError('Les images doivent faire moins de 10MB');
        return false;
      }
      return true;
    });
    
    if (validFiles.length !== files.length) {
      return;
    }
    
    setSelectedFiles(validFiles);
    setError(null);
    
    // Créer les previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Veuillez sélectionner au moins une photo');
      return;
    }
    
    setUploading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      let uploadedCount = 0;
      const uploaderName = guestName.trim() || 'Invité anonyme';
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileId = `file-${i}`;
        
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        
        // Compresser l'image
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/jpeg'
        });
        
        setUploadProgress(prev => ({ ...prev, [fileId]: 50 }));
        
        // Générer un nom de fichier unique avec l'extension correcte
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const originalName = file.name.split('.')[0]; // Nom sans extension
        const fileName = `guest-photos/album/${albumId}/${timestamp}-${random}-${originalName}.jpg`;
        
        // Créer un nouveau fichier avec le bon nom et extension
        const renamedFile = new File([compressedFile], `${timestamp}-${random}-${originalName}.jpg`, {
          type: 'image/jpeg'
        });
        
        // Uploader vers Firebase avec le nom correct
        const downloadURL = await uploadToFirebase(renamedFile, fileName);
        
        setUploadProgress(prev => ({ ...prev, [fileId]: 75 }));
        
        // Envoyer vers l'API backend
        const formData = new FormData();
        formData.append('photo', renamedFile);
        formData.append('caption', `Photo de ${uploaderName}`);
        formData.append('guestName', uploaderName);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013'}/api/photos/albums/${albumId}/photos/guest`, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Erreur lors de l'upload de ${file.name}`);
        }
        
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        uploadedCount++;
      }
      
      setSuccessMessage(`${uploadedCount} photo(s) uploadée(s) avec succès ! Les organisateurs les valideront bientôt.`);
      
      // Réinitialiser le formulaire
      setSelectedFiles([]);
      setPreviews([]);
      setGuestName('');
      setUploadProgress({});
      
      // Recharger l'album
      loadAlbum();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setUploadProgress({});
  };

  const openPhotoModal = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closePhotoModal = () => {
    setSelectedPhotoIndex(null);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (selectedPhotoIndex === null) return;
    
    const newIndex = direction === 'prev' 
      ? Math.max(0, selectedPhotoIndex - 1)
      : Math.min(approvedPhotos.length - 1, selectedPhotoIndex + 1);
    
    setSelectedPhotoIndex(newIndex);
  };

  const approvedPhotos = album?.photos?.filter(photo => photo.status === 'APPROVED' || photo.status === 'PUBLIC') || [];
  const recentPhotos = approvedPhotos.slice(-10).reverse(); // 10 dernières photos, les plus récentes en premier

  // Fonction pour obtenir l'URL d'affichage d'une photo avec fallback
  const getPhotoDisplayUrl = (photo: any): string => {
    // Essayer dans l'ordre : thumbnail, compressed, original
    const url = photo.thumbnailUrl || photo.compressedUrl || photo.originalUrl;
    
    if (!url) {
      console.warn('No photo URL available for photo:', photo.id);
      // Retourner une image placeholder
      return `https://via.placeholder.com/300x300/cccccc/666666?text=Photo+${photo.id}`;
    }
    
    return url;
  };

  // Fonction pour gérer les erreurs de chargement d'image
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>, photo: any) => {
    console.warn('Image failed to load:', photo);
    const img = event.target as HTMLImageElement;
    img.src = `https://via.placeholder.com/300x300/cccccc/666666?text=Photo+${photo.id}`;
    img.alt = 'Photo non disponible';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingAnimation}>
            <div className={styles.loadingRing}></div>
            <div className={styles.loadingRing}></div>
            <div className={styles.loadingRing}></div>
            <Crown className={styles.loadingIcon} />
          </div>
          <p className={styles.loadingText}>Chargement de l'album...</p>
        </div>
      </div>
    );
  }

  if (error && !album) {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <AlertCircle className={styles.errorIcon} />
          <h2>Album non accessible</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* En-tête luxueux */}
      <div className={styles.headerSection}>
        <div className={styles.badge}>
          <Camera style={{ width: '16px', height: '16px' }} />
          Album photos partagé
        </div>
        
        <h1 className={styles.title}>
          {album?.title}
        </h1>
        
        <div className={styles.organisateurInfo}>
          <Flower2 className={styles.flowerIcon} />
          <span className={styles.organisateurName}>événement de {album?.invitation.organisateurName}</span>
          <Flower2 className={styles.flowerIcon} />
        </div>
        
        <div className={styles.eventDate}>
          {new Date(album?.invitation.eventDate || '').toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* Galerie de photos */}
      {approvedPhotos.length > 0 && (
        <div className={styles.photoGallery}>
          <div className={styles.galleryHeader}>
            <div className={styles.galleryTitle}>
              <ImageIcon />
              <span>Galerie Photos</span>
              <span className={styles.photoCount}>({approvedPhotos.length} photos)</span>
            </div>
            <p className={styles.gallerySubtitle}>Cliquez sur une photo pour la voir en grand</p>
          </div>

          <div className={styles.photoGrid}>
            {approvedPhotos.map((photo, index) => (
              <div 
                key={photo.id} 
                className={styles.photoGridItem}
                onClick={() => openPhotoModal(index)}
              >
                <img 
                  src={getPhotoDisplayUrl(photo)} 
                  alt={photo.caption || 'Photo du événement'} 
                  className={styles.gridImage}
                  onError={(e) => handleImageError(e, photo)}
                />
                <div className={styles.photoGridOverlay}>
                  <ZoomIn className={styles.zoomIcon} />
                  {photo.uploadedBy && (
                    <div className={styles.photoAuthor}>
                      <Users className={styles.authorIcon} />
                      {photo.uploadedBy.firstName} {photo.uploadedBy.lastName}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de visualisation photo */}
      {selectedPhotoIndex !== null && (
        <div className={styles.photoModal} onClick={closePhotoModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closePhotoModal}>
              <X />
            </button>
            
            <div className={styles.modalNavigation}>
              <button 
                className={`${styles.modalNavButton} ${styles.prevButton}`}
                onClick={() => navigatePhoto('prev')}
                disabled={selectedPhotoIndex === 0}
              >
                <ChevronLeft />
              </button>
              <button 
                className={`${styles.modalNavButton} ${styles.nextButton}`}
                onClick={() => navigatePhoto('next')}
                disabled={selectedPhotoIndex === approvedPhotos.length - 1}
              >
                <ChevronRight />
              </button>
            </div>

            <div className={styles.modalImageContainer}>
              <img 
                src={getPhotoDisplayUrl(approvedPhotos[selectedPhotoIndex])} 
                alt={approvedPhotos[selectedPhotoIndex].caption || 'Photo du événement'}
                className={styles.modalImage}
                onError={(e) => handleImageError(e, approvedPhotos[selectedPhotoIndex])}
              />
            </div>

            <div className={styles.modalInfo}>
              {approvedPhotos[selectedPhotoIndex].uploadedBy && (
                <div className={styles.modalAuthor}>
                  <Users className={styles.authorIcon} />
                  <span>
                    {approvedPhotos[selectedPhotoIndex].uploadedBy!.firstName} {approvedPhotos[selectedPhotoIndex].uploadedBy!.lastName}
                  </span>
                </div>
              )}
              {approvedPhotos[selectedPhotoIndex].caption && (
                <p className={styles.modalCaption}>{approvedPhotos[selectedPhotoIndex].caption}</p>
              )}
              <div className={styles.modalActions}>
                <button 
                  className={styles.downloadButton}
                  onClick={async () => {
                    try {
                      const imageUrl = getPhotoDisplayUrl(approvedPhotos[selectedPhotoIndex]);
                      const response = await fetch(imageUrl, {
                        mode: 'cors',
                        headers: {
                          'Access-Control-Allow-Origin': '*',
                        }
                      });
                      
                      if (!response.ok) {
                        throw new Error('Erreur lors du téléchargement');
                      }
                      
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `photo_événement_${selectedPhotoIndex + 1}.jpg`;
                      
                      // Déclencher le téléchargement
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      
                      // Nettoyer l'URL blob
                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error('Erreur lors du téléchargement:', error);
                      // Fallback vers l'ancienne méthode
                      window.open(getPhotoDisplayUrl(approvedPhotos[selectedPhotoIndex]), '_blank');
                    }
                  }}
                >
                  <Download className={styles.downloadIcon} />
                  Télécharger
                </button>
              </div>
            </div>

            <div className={styles.modalCounter}>
              {selectedPhotoIndex + 1} / {approvedPhotos.length}
            </div>
          </div>
        </div>
      )}

      {/* Section d'upload luxueuse */}
      <div className={styles.uploadSection}>
        <div className={styles.uploadHeader}>
          <div className={styles.uploadIcon}>
            <Gift className={styles.giftIcon} />
          </div>
          <h2 className={styles.uploadTitle}>Partagez vos Souvenirs</h2>
          <p className={styles.uploadSubtitle}>
            Contribuez à créer un album inoubliable pour les organisateurs
          </p>
        </div>

        {/* Messages de statut */}
        {error && (
          <div className={styles.errorMessage}>
            <AlertCircle className={styles.messageIcon} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className={styles.successMessage}>
            <CheckCircle className={styles.messageIcon} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Formulaire d'upload élégant */}
        <div className={styles.uploadForm}>
          <div className={styles.formGroup}>
            <label className={styles.elegantLabel}>
              <Star className={styles.labelIcon} />
              Votre nom (optionnel)
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Votre nom ou laissez vide pour 'Invité anonyme'"
              className={styles.elegantInput}
              disabled={uploading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.elegantLabel}>
              <Camera className={styles.labelIcon} />
              Sélectionnez vos photos
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className={styles.fileInput}
              disabled={uploading}
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className={styles.elegantFileLabel}>
              <Upload className={styles.uploadIcon} />
              <span>Choisir des photos</span>
              <span className={styles.fileHint}>(maximum 10 photos)</span>
            </label>
          </div>

          {/* Previews avec carousel */}
          {previews.length > 0 && (
            <div className={styles.previewSection}>
              <h3 className={styles.previewTitle}>
                <Sparkles className={styles.previewIcon} />
                Photos sélectionnées ({previews.length})
              </h3>
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                loop={true}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                navigation={{
                  nextEl: '.preview-next',
                  prevEl: '.preview-prev',
                }}
                pagination={{ 
                  clickable: true,
                  dynamicBullets: true,
                }}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  1024: { slidesPerView: 4 },
                }}
                className={styles.previewSwiper}
              >
                {previews.map((preview, index) => (
                  <SwiperSlide key={index}>
                    <div className={styles.previewItem}>
                      <img src={preview} alt={`Preview ${index + 1}`} className={styles.previewImage} />
                      {uploadProgress[`file-${index}`] !== undefined && (
                        <div className={styles.progressOverlay}>
                          <div className={styles.progressBar}>
                            <div 
                              className={styles.progressFill} 
                              style={{ width: `${uploadProgress[`file-${index}`]}%` }}
                            />
                          </div>
                          <span className={styles.progressText}>{uploadProgress[`file-${index}`]}%</span>
                        </div>
                      )}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className={styles.previewNavigation}>
                <button className={`${styles.navButton} preview-prev`}>
                  <ChevronLeft />
                </button>
                <button className={`${styles.navButton} preview-next`}>
                  <ChevronRight />
                </button>
              </div>
            </div>
          )}

          {/* Boutons d'action élégants */}
          <div className={styles.actionButtons}>
            {selectedFiles.length > 0 && (
              <button
                onClick={clearSelection}
                disabled={uploading}
                className={styles.cancelButton}
              >
                Annuler
              </button>
            )}
            <button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className={styles.primaryButton}
            >
              {uploading ? (
                <>
                  <Loader className={styles.buttonIcon} />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className={styles.buttonIcon} />
                  Partager {selectedFiles.length} photo(s)
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Conseils élégants */}
      <div className={styles.tipsSection}>
        <div className={styles.tipsHeader}>
          <Crown className={styles.tipsIcon} />
          <h3>Conseils pour de magnifiques photos</h3>
        </div>
        <div className={styles.tipsGrid}>
          <div className={styles.tip}>
            <Camera className={styles.tipIcon} />
            <p>Capturez les moments authentiques et les émotions</p>
          </div>
          <div className={styles.tip}>
            <Heart className={styles.tipIcon} />
            <p>Privilégiez la qualité à la quantité</p>
          </div>
          <div className={styles.tip}>
            <Star className={styles.tipIcon} />
            <p>Variez les angles et les perspectives</p>
          </div>
          <div className={styles.tip}>
            <CheckCircle className={styles.tipIcon} />
            <p>Vos photos seront validées par les organisateurs</p>
          </div>
        </div>
      </div>
    </div>
  );
} 