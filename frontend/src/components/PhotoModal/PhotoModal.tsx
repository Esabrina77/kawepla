import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, Trash2, Download } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Keyboard, EffectFade, Thumbs, FreeMode } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { Photo } from '@/hooks/usePhotoAlbums';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import styles from './PhotoModal.module.css';

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  initialIndex: number;
  onPhotoAction?: (photoId: string, action: 'approve' | 'publish' | 'reject' | 'delete') => Promise<void> | void;
}

export default function PhotoModal({ isOpen, onClose, photos: initialPhotos, initialIndex, onPhotoAction }: PhotoModalProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [localPhotos, setLocalPhotos] = useState<Photo[]>(initialPhotos);

  useEffect(() => {
    setLocalPhotos(initialPhotos);
    setCurrentIndex(initialIndex);
  }, [initialPhotos, initialIndex]);

  if (!isOpen) return null;

  const currentPhoto = localPhotos[currentIndex];
  if (!currentPhoto && localPhotos.length > 0) {
     // Si l'index est hors limites après suppression, on ajuste
     setCurrentIndex(Math.max(0, localPhotos.length - 1));
     return null;
  }
  
  if (localPhotos.length === 0) {
    onClose();
    return null;
  }

  const isPending = currentPhoto.status === 'PENDING';

  const handleDelete = async () => {
    if (!currentPhoto || !onPhotoAction) return;
    
    const photoIdToDelete = currentPhoto.id;
    
    // 1. Appel API
    await onPhotoAction(photoIdToDelete, 'delete');
    
    // 2. Mise à jour locale pour la réactivité
    const newList = localPhotos.filter(p => p.id !== photoIdToDelete);
    setLocalPhotos(newList);
    
    // 3. Navigation
    if (newList.length === 0) {
      onClose();
    } else {
      // Swiper gérera le changement d'index si on est en boucle
      // Mais on s'assure que currentIndex reste valide
      if (currentIndex >= newList.length) {
        setCurrentIndex(newList.length - 1);
      }
    }
  };

  const handleDownload = async () => {
    const url = currentPhoto.originalUrl || currentPhoto.compressedUrl || currentPhoto.thumbnailUrl;
    if (url) {
      window.open(url, '_blank');
    }
  };

  const isLoopable = localPhotos.length >= 4;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        {/* Header avec Retour à gauche et Compteur/Actions à droite */}
        <div className={styles.header}>
          <button onClick={onClose} className={styles.backBtn} title="Retour">
            <ArrowLeft size={28} />
          </button>
          
          <div className={styles.headerRight}>
            <div className={styles.counter}>
              {currentIndex + 1} / {localPhotos.length}
            </div>
            
            <div className={styles.actions}>
              {onPhotoAction && (
                <button 
                  onClick={handleDelete}
                  className={`${styles.actionBtn} ${styles.delete}`}
                  title="Supprimer"
                >
                  <Trash2 size={20} />
                </button>
              )}
              <button onClick={handleDownload} className={styles.actionBtn} title="Télécharger">
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Galerie Principale */}
        <div className={styles.galleryWrapper}>
          <Swiper
            modules={[Navigation, Keyboard, EffectFade, Thumbs]}
            initialSlide={initialIndex}
            onSlideChange={(s) => setCurrentIndex(s.activeIndex)}
            navigation={{
              nextEl: `.${styles.nextBtn}`,
              prevEl: `.${styles.prevBtn}`,
            }}
            keyboard={{ enabled: true }}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            loop={isLoopable}
            loopedSlides={isLoopable ? localPhotos.length : undefined}
            loopAdditionalSlides={isLoopable ? 2 : 0}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            className={styles.swiperMain}
          >
            {localPhotos.map((photo, index) => (
              <SwiperSlide key={photo.id || index} className={styles.slide}>
                <div className={styles.imageWrapper}>
                  <img 
                    src={photo.compressedUrl || photo.originalUrl || photo.thumbnailUrl} 
                    alt={photo.caption || ''} 
                    className={styles.image}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {(!isLoopable && currentIndex === 0) ? null : (
            <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={(e) => e.stopPropagation()}>
              <ChevronLeft size={32} />
            </button>
          )}
          
          {(!isLoopable && currentIndex === localPhotos.length - 1) ? null : (
            <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={(e) => e.stopPropagation()}>
              <ChevronRight size={32} />
            </button>
          )}
        </div>

        {/* Barre de vignettes (Thumbnails) */}
        <div className={styles.thumbsContainer}>
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView="auto"
            freeMode={true}
            watchSlidesProgress={true}
            loop={isLoopable}
            loopedSlides={isLoopable ? localPhotos.length : undefined}
            loopAdditionalSlides={isLoopable ? 2 : 0}
            slideToClickedSlide={true}
            modules={[FreeMode, Thumbs]}
            className={styles.thumbsSwiper}
          >
            {localPhotos.map((photo, index) => (
              <SwiperSlide key={`thumb-${photo.id || index}`} className={styles.thumbSlide}>
                <div className={`${styles.thumbWrapper} ${currentIndex === index ? styles.activeThumb : ''}`}>
                  <img 
                    src={photo.thumbnailUrl || photo.compressedUrl} 
                    alt="Thumbnail" 
                    className={styles.thumbImage} 
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Footer avec infos photo */}
        <div className={styles.footer}>
          {currentPhoto.caption && <p className={styles.caption}>{currentPhoto.caption}</p>}
          <div className={styles.meta}>
            {currentPhoto.uploadedBy ? `Par ${currentPhoto.uploadedBy.firstName} ${currentPhoto.uploadedBy.lastName} • ` : ''}
            Le {new Date(currentPhoto.uploadedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}