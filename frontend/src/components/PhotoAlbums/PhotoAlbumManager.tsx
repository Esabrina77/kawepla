/**
 * Composant pour gérer les albums photos des organisateurs
 * Style adapté selon la maquette vos_albums_photos
 */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePhotoAlbums, PhotoAlbum, Photo } from '@/hooks/usePhotoAlbums';
import { QRCodeModal } from '@/components/QRCodeModal/QRCodeModal';
import PhotoModal from '@/components/PhotoModal/PhotoModal';
import {
  Plus,
  MoreVertical,
  Verified,
  Clock,
  QrCode,
  Copy,
  ExternalLink,
  Trash2,
  ImagePlus,
  Upload,
  Check,
  X,
  Globe,
  Image as ImageIcon,
  Download,
  CheckSquare,
  Square,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import styles from './PhotoAlbumManager.module.css';
import { ConfirmModal, SuccessModal, ErrorModal } from '@/components/ui/modal';

interface PhotoAlbumManagerProps {
  invitationId: string;
}

export function PhotoAlbumManager({ invitationId }: PhotoAlbumManagerProps) {
  const {
    albums,
    loading,
    error,
    createAlbum,
    deleteAlbum,
    uploadPhoto,
    approvePhoto,
    publishPhoto,
    rejectPhoto,
    deletePhoto,
    refetch: fetchAlbums
  } = usePhotoAlbums(invitationId);

  // États du composant
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  // État pour la navigation style Google Photos
  const [currentView, setCurrentView] = useState<'albums' | 'photos'>('albums');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // État pour le modal QR Code
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedAlbumForQR, setSelectedAlbumForQR] = useState<PhotoAlbum | null>(null);

  // État pour le modal de photo
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const [currentPhotosList, setCurrentPhotosList] = useState<Photo[]>([]);

  // États pour la sélection et le téléchargement
  const [selectionMode, setSelectionMode] = useState<string | null>(null); // ID de l'album en mode sélection
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // États pour les modales
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({ isOpen: false, type: 'success', title: '', message: '' });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void> | void;
    isLoading: boolean;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => { }, isLoading: false });

  const closeAlertModal = () => setAlertModal(prev => ({ ...prev, isOpen: false }));
  const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

  const handleConfirmAction = async () => {
    if (!confirmModal.onConfirm) return;

    setConfirmModal(prev => ({ ...prev, isLoading: true }));
    try {
      await confirmModal.onConfirm();
      setConfirmModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
    } catch (error) {
      console.error(error);
      setConfirmModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Fermer les menus déroulants au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.values(dropdownRefs.current).forEach(ref => {
        if (ref && !ref.contains(event.target as Node)) {
          setOpenDropdownId(null);
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fonction pour obtenir l'URL d'affichage d'une photo
  const getPhotoDisplayUrl = (photo: Photo): string => {
    return photo.thumbnailUrl || photo.compressedUrl || photo.originalUrl || '';
  };

  // Fonction pour ouvrir une photo en grand (style Google Photos)
  const handlePhotoClick = (index: number, photos: Photo[]) => {
    setCurrentPhotosList(photos);
    setCurrentPhotoIndex(index);
    setPhotoModalOpen(true);
  };

  // Naviguer dans l'album sélectionné
  const handleAlbumClick = (albumId: string) => {
    setSelectedAlbumId(albumId);
    setCurrentView('photos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Revenir à la liste des albums
  const handleBackToAlbums = () => {
    setCurrentView('albums');
    setSelectedAlbumId(null);
    setSelectionMode(null);
    setSelectedPhotos(new Set());
  };

  // Créer un nouvel album
  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumTitle.trim()) return;

    setCreating(true);
    try {
      await createAlbum({
        title: albumTitle.trim(),
        description: albumDescription.trim() || undefined,
        isPublic: false
      });
      setShowCreateForm(false);
      setAlbumTitle('');
      setAlbumDescription('');
    } catch (error: any) {
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Erreur',
        message: `Erreur lors de la création de l'album : ${error.message || 'Une erreur est survenue'}`
      });
    } finally {
      setCreating(false);
    }
  };

  // Ouvrir le modal QR Code
  const handleOpenQRModal = (album: PhotoAlbum) => {
    setSelectedAlbumForQR(album);
    setQrModalOpen(true);
    setOpenDropdownId(null);
  };

  // Fermer le modal QR Code
  const handleCloseQRModal = () => {
    setQrModalOpen(false);
    setSelectedAlbumForQR(null);
  };

  // Copier le lien de partage
  const handleCopyShareLink = async (albumId: string) => {
    const shareUrl = `${window.location.origin}/share-album/${albumId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setAlertModal({
        isOpen: true,
        type: 'success',
        title: 'Lien copié',
        message: 'Lien copié dans le presse-papiers !'
      });
      setOpenDropdownId(null);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de copier le lien.'
      });
    }
  };

  // Ouvrir le lien de partage
  const handleOpenShareLink = (albumId: string) => {
    const shareUrl = `${window.location.origin}/share-album/${albumId}`;
    window.open(shareUrl, '_blank');
    setOpenDropdownId(null);
  };

  // Supprimer un album
  const handleDeleteAlbum = (album: PhotoAlbum) => {
    setConfirmModal({
      isOpen: true,
      title: 'Supprimer l\'album',
      message: `Êtes-vous sûr de vouloir supprimer l'album "${album.title}" ?`,
      isLoading: false,
      onConfirm: async () => {
        try {
          await deleteAlbum(album.id);
          await fetchAlbums();
          handleBackToAlbums();
          setOpenDropdownId(null);
          setAlertModal({ isOpen: true, type: 'success', title: 'Succès', message: 'Album supprimé avec succès' });
        } catch (error: any) {
          setAlertModal({ isOpen: true, type: 'error', title: 'Erreur', message: `Erreur lors de la suppression : ${error.message || 'Une erreur est survenue'}` });
        }
      }
    });
  };

  // Uploader des photos
  const handlePhotoUpload = async (albumId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(prev => ({ ...prev, [albumId]: true }));
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await uploadPhoto(albumId, file);
      }
    } catch (error: any) {
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Erreur',
        message: `Erreur lors de l'upload : ${error.message || 'Une erreur est survenue'}`
      });
    } finally {
      setUploading(prev => ({ ...prev, [albumId]: false }));
    }
  };

  // Gérer les actions sur les photos
  const handlePhotoAction = async (photoId: string, action: 'approve' | 'publish' | 'reject' | 'delete') => {
    const executeAction = async () => {
      try {
        switch (action) {
          case 'approve': await approvePhoto(photoId); break;
          case 'publish': await publishPhoto(photoId); break;
          case 'reject': await rejectPhoto(photoId); break;
          case 'delete': await deletePhoto(photoId); break;
        }
      } catch (error: any) {
        setAlertModal({ isOpen: true, type: 'error', title: 'Erreur', message: `Erreur lors de l'action : ${error.message || 'Une erreur est survenue'}` });
      }
    };

    if (action === 'delete') {
      setConfirmModal({
        isOpen: true,
        title: 'Supprimer la photo',
        message: 'Êtes-vous sûr de vouloir supprimer cette photo ?',
        isLoading: false,
        onConfirm: executeAction
      });
    } else {
      await executeAction();
    }
  };

  // Fermer le modal photo
  const handleClosePhotoModal = () => {
    setPhotoModalOpen(false);
  };

  // Basculer le mode sélection
  const toggleSelectionMode = (albumId: string) => {
    if (selectionMode === albumId) {
      setSelectionMode(null);
      setSelectedPhotos(new Set());
    } else {
      setSelectionMode(albumId);
      setSelectedPhotos(new Set());
    }
    setOpenDropdownId(null);
  };

  // Basculer la sélection d'une photo
  const togglePhotoSelection = (photoId: string) => {
    const newSelection = new Set(selectedPhotos);
    if (newSelection.has(photoId)) {
      newSelection.delete(photoId);
    } else {
      newSelection.add(photoId);
    }
    setSelectedPhotos(newSelection);
  };

  // Tout sélectionner
  const selectAllPhotos = (album: PhotoAlbum) => {
    if (!album.photos) return;
    const newSelection = new Set(album.photos.map(p => p.id));
    setSelectedPhotos(newSelection);
  };

  // Tout désélectionner
  const deselectAllPhotos = () => {
    setSelectedPhotos(new Set());
  };

  // Supprimer les photos sélectionnées
  const handleDeleteSelected = (album: PhotoAlbum) => {
    if (selectedPhotos.size === 0) return;

    setConfirmModal({
      isOpen: true,
      title: 'Supprimer les photos',
      message: `Êtes-vous sûr de vouloir supprimer ces ${selectedPhotos.size} photos ?`,
      isLoading: false,
      onConfirm: async () => {
        try {
          const photosToDelete = Array.from(selectedPhotos);
          for (const photoId of photosToDelete) {
            await deletePhoto(photoId);
          }

          // Quitter le mode sélection après suppression réussie
          setSelectionMode(null);
          setSelectedPhotos(new Set());
          setAlertModal({ isOpen: true, type: 'success', title: 'Succès', message: 'Photos supprimées avec succès' });
        } catch (error: any) {
          setAlertModal({ isOpen: true, type: 'error', title: 'Erreur', message: `Erreur lors de la suppression : ${error.message || 'Une erreur est survenue'}` });
        }
      }
    });
  };

  // Télécharger les photos sélectionnées
  const handleDownloadSelected = async (album: PhotoAlbum) => {
    if (selectedPhotos.size === 0) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const photosToDownload = album.photos?.filter(p => selectedPhotos.has(p.id)) || [];

      if (photosToDownload.length === 1) {
        // Téléchargement simple
        const photo = photosToDownload[0];
        const url = photo.originalUrl || photo.compressedUrl || photo.thumbnailUrl;
        if (url) {
          try {
            const response = await fetch(url);
            const blob = await response.blob();
            saveAs(blob, `photo_${photo.id}.jpg`);
          } catch (err) {
            console.error('Erreur téléchargement photo simple:', err);
            // Fallback si le fetch échoue
            saveAs(url, `photo_${photo.id}.jpg`);
          }
        }
      } else {
        // Téléchargement ZIP
        const zip = new JSZip();
        let processed = 0;

        const promises = photosToDownload.map(async (photo) => {
          const url = photo.originalUrl || photo.compressedUrl || photo.thumbnailUrl;
          if (!url) return;

          try {
            const response = await fetch(url);
            const blob = await response.blob();
            zip.file(`photo_${photo.id}.jpg`, blob);
            processed++;
            setDownloadProgress(Math.round((processed / photosToDownload.length) * 100));
          } catch (err) {
            console.error('Erreur téléchargement photo:', err);
          }
        });

        await Promise.all(promises);

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `${album.title}_selection.zip`);
      }

      // Quitter le mode sélection après téléchargement réussi
      setSelectionMode(null);
      setSelectedPhotos(new Set());
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Erreur',
        message: "Une erreur est survenue lors du téléchargement."
      });
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  // Télécharger tout l'album
  const handleDownloadAll = async (album: PhotoAlbum) => {
    if (!album.photos || album.photos.length === 0) return;

    setIsDownloading(true);
    setDownloadProgress(0);
    setOpenDropdownId(null);

    try {
      const zip = new JSZip();
      let processed = 0;

      const promises = album.photos.map(async (photo) => {
        const url = photo.originalUrl || photo.compressedUrl || photo.thumbnailUrl;
        if (!url) return;

        try {
          const response = await fetch(url);
          const blob = await response.blob();
          zip.file(`photo_${photo.id}.jpg`, blob);
          processed++;
          setDownloadProgress(Math.round((processed / album.photos!.length) * 100));
        } catch (err) {
          console.error('Erreur téléchargement photo:', err);
        }
      });

      await Promise.all(promises);

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${album.title}.zip`);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Erreur',
        message: "Une erreur est survenue lors du téléchargement."
      });
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Chargement de vos albums...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>Erreur : {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.albumsSection}>
      {/* VUE 1 : LISTE DES ALBUMS (Grille de couvertures) */}
      {currentView === 'albums' && (
        <>
          <div className={styles.albumsHeader}>
            <h3 className={styles.albumsTitle}>Mes Albums</h3>
            <button
              onClick={() => setShowCreateForm(true)}
              className={styles.createAlbumButton}
            >
              <Plus size={18} />
              <span>Nouvel album</span>
            </button>
          </div>

          {albums.length > 0 ? (
            <div className={styles.albumsGridMain}>
              {albums.map((album) => (
                <div 
                  key={album.id} 
                  className={styles.albumCoverCard}
                  onClick={() => handleAlbumClick(album.id)}
                >
                  <div className={styles.albumCoverImageWrapper}>
                    {album.photos && album.photos.length > 0 ? (
                      <img 
                        src={getPhotoDisplayUrl(album.photos[0])} 
                        alt={album.title} 
                        className={styles.albumCoverImage}
                      />
                    ) : (
                      <div className={styles.albumCoverPlaceholder}>
                        <ImageIcon size={32} />
                      </div>
                    )}
                    <div className={styles.albumCoverOverlay}>
                      <span className={styles.albumPhotoBadge}>{album.photos?.length || 0}</span>
                    </div>
                  </div>
                  <div className={styles.albumCoverInfo}>
                    <h4 className={styles.albumCoverTitle}>{album.title}</h4>
                    <p className={styles.albumCoverDate}>
                      Mis à jour le {new Date(album.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Menu burger discret sur la carte */}
                  <div className={styles.albumCardActions} onClick={(e) => e.stopPropagation()}>
                    <button 
                      className={styles.miniDropdownTrigger}
                      onClick={() => setOpenDropdownId(openDropdownId === album.id ? null : album.id)}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openDropdownId === album.id && (
                      <div className={styles.dropdownContentMini}>
                         <button onClick={(e) => { e.stopPropagation(); handleOpenQRModal(album); }} className={styles.dropdownItem}>
                          <QrCode size={14} /> QR Code
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleCopyShareLink(album.id); }} className={styles.dropdownItem}>
                          <Copy size={14} /> Lien
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteAlbum(album); }} className={`${styles.dropdownItem} ${styles.dangerItem}`}>
                          <Trash2 size={14} /> Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyAlbum}>
              <ImageIcon className={styles.emptyAlbumIcon} size={48} />
              <h4 className={styles.emptyAlbumTitle}>Aucun album créé</h4>
              <p className={styles.emptyAlbumText}>
                Commencez par créer votre premier album pour organiser les photos de l'événement.
              </p>
            </div>
          )}
        </>
      )}

      {/* VUE 2 : DÉTAIL DE L'ALBUM (Grille de photos) */}
      {currentView === 'photos' && selectedAlbumId && (
        <div className={styles.albumDetailView}>
          {albums.filter(a => a.id === selectedAlbumId).map(album => (
            <div key={album.id}>
              <div className={styles.detailHeader}>
                <button onClick={handleBackToAlbums} className={styles.backButton}>
                  <ChevronLeft size={20} />
                  <span>Albums</span>
                </button>
                <div className={styles.detailTitleInfo}>
                  <h3 className={styles.detailTitle}>{album.title}</h3>
                  <span className={styles.detailCount}>{album.photos?.length || 0} photos</span>
                </div>
                
                <div className={styles.detailActions}>
                   <button
                    onClick={() => toggleSelectionMode(album.id)}
                    className={`${styles.iconActionButton} ${selectionMode === album.id ? styles.activeAction : ''}`}
                    title="Sélectionner"
                  >
                    <CheckSquare size={20} />
                  </button>
                  <button
                    onClick={() => handleOpenQRModal(album)}
                    className={styles.iconActionButton}
                    title="Partager"
                  >
                    <QrCode size={20} />
                  </button>
                  <button
                    onClick={() => handleDownloadAll(album)}
                    className={styles.iconActionButton}
                    title="Télécharger tout"
                  >
                    <Download size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteAlbum(album)}
                    className={`${styles.iconActionButton} ${styles.dangerIconAction}`}
                    title="Supprimer l'album"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Barre d'outils de sélection */}
              {selectionMode === album.id && (
                <div className={styles.selectionToolbar}>
                  <div className={styles.selectionInfo}>
                    <span className={styles.selectionCount}>{selectedPhotos.size} sélectionnée(s)</span>
                  </div>
                  <div className={styles.selectionActions}>
                    <button onClick={deselectAllPhotos} className={styles.secondaryButton}>Annuler</button>
                    <button
                      onClick={() => handleDownloadSelected(album)}
                      className={styles.primaryButton}
                      disabled={selectedPhotos.size === 0 || isDownloading}
                    >
                      {isDownloading ? <Loader2 size={16} className={styles.spin} /> : <Download size={16} />}
                      <span>Télécharger</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSelected(album)}
                      className={styles.dangerButton}
                      disabled={selectedPhotos.size === 0}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Zone d'upload */}
              <div className={styles.addPhotosSection}>
                <input
                  type="file"
                  id={`upload-${album.id}`}
                  multiple
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(album.id, e.target.files)}
                  className={styles.fileInput}
                  disabled={uploading[album.id]}
                />
                <label
                  htmlFor={`upload-${album.id}`}
                  className={`${styles.addPhotosButton} ${uploading[album.id] ? styles.uploading : ''}`}
                >
                  <Upload size={18} />
                  <span>{uploading[album.id] ? 'Upload en cours...' : 'Ajouter des photos'}</span>
                </label>
              </div>

              {/* Grille de photos */}
              <div className={styles.albumGrid}>
                {album.photos && album.photos.length > 0 ? (
                  album.photos.map((photo, index) => {
                    const photoUrl = getPhotoDisplayUrl(photo);
                    const isPublic = photo.status === 'PUBLIC';
                    const isApproved = photo.status === 'APPROVED';
                    const isPending = photo.status === 'PENDING';

                    return (
                      <div
                        key={photo.id}
                        className={`${styles.albumPhoto} ${selectedPhotos.has(photo.id) ? styles.selectedPhoto : ''}`}
                        onClick={() => {
                          if (selectionMode === album.id) {
                            togglePhotoSelection(photo.id);
                          } else {
                            handlePhotoClick(index, album.photos);
                          }
                        }}
                      >
                         {/* Checkbox en mode sélection */}
                         {selectionMode === album.id && (
                          <div className={styles.selectionOverlay}>
                            {selectedPhotos.has(photo.id) ? <CheckSquare size={22} color="var(--primary)" fill="white" /> : <Square size={22} color="white" />}
                          </div>
                        )}

                        <img src={photoUrl} alt={photo.caption || ''} className={styles.albumPhotoImage} />
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.emptyStateContainer}>
                    <p>Cet album est vide.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de création d'album */}
      {showCreateForm && (
        <div className={styles.modalOverlay} onClick={() => !creating && setShowCreateForm(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Créer un nouvel album</h2>
              <button
                onClick={() => !creating && setShowCreateForm(false)}
                className={styles.modalCloseButton}
                disabled={creating}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateAlbum} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label htmlFor="album-title" className={styles.formLabel}>
                  Titre de l'album *
                </label>
                <input
                  id="album-title"
                  type="text"
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  className={styles.formInput}
                  placeholder="Ex: Cérémonie, Cocktail, Soirée..."
                  required
                  disabled={creating}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="album-description" className={styles.formLabel}>
                  Description (optionnel)
                </label>
                <textarea
                  id="album-description"
                  value={albumDescription}
                  onChange={(e) => setAlbumDescription(e.target.value)}
                  className={styles.formTextarea}
                  placeholder="Décrivez le contenu de cet album..."
                  rows={3}
                  disabled={creating}
                />
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className={styles.modalCancelButton}
                  disabled={creating}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={styles.modalSubmitButton}
                  disabled={creating || !albumTitle.trim()}
                >
                  {creating ? 'Création...' : 'Créer l\'album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      {qrModalOpen && selectedAlbumForQR && (
        <QRCodeModal
          isOpen={qrModalOpen}
          onClose={handleCloseQRModal}
          albumTitle={selectedAlbumForQR.title}
          albumId={selectedAlbumForQR.id}
        />
      )}

      {photoModalOpen && currentPhotosList.length > 0 && (
        <PhotoModal
          isOpen={photoModalOpen}
          onClose={handleClosePhotoModal}
          photos={currentPhotosList}
          initialIndex={currentPhotoIndex}
          onPhotoAction={handlePhotoAction}
        />
      )}

      {/* Modales d'alerte et de confirmation */}
      {alertModal.type === 'success' ? (
        <SuccessModal
          isOpen={alertModal.isOpen}
          onClose={closeAlertModal}
          title={alertModal.title}
          message={alertModal.message}
        />
      ) : (
        <ErrorModal
          isOpen={alertModal.isOpen}
          onClose={closeAlertModal}
          title={alertModal.title}
          message={alertModal.message}
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        isLoading={confirmModal.isLoading}
        confirmText="Confirmer"
        cancelText="Annuler"
      />
    </div>
  );
}
