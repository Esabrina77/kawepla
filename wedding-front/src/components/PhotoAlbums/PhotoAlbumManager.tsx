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
  Loader2
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
    deletePhoto
  } = usePhotoAlbums(invitationId);

  // États du composant
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  // État pour le menu déroulant
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // État pour le modal QR Code
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedAlbumForQR, setSelectedAlbumForQR] = useState<PhotoAlbum | null>(null);

  // État pour le modal de photo
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; alt: string } | null>(null);

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

  // Fonction pour ouvrir une photo en grand
  const handlePhotoClick = (photo: Photo) => {
    const photoUrl = getPhotoDisplayUrl(photo);
    if (photoUrl) {
      setSelectedPhoto({
        url: photoUrl,
        alt: photo.caption || 'Photo de événement'
      });
      setPhotoModalOpen(true);
    }
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
    setSelectedPhoto(null);
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
      {/* Header avec titre et bouton créer */}
      <div className={styles.albumsHeader}>
        <h3 className={styles.albumsTitle}>Vos Albums</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className={styles.createAlbumButton}
        >
          <ImagePlus size={18} />
          <span>Créer un album</span>
        </button>
      </div>

      {/* Liste des albums */}
      {albums.length > 0 ? (
        <div className={styles.albumsList}>
          {albums.map((album) => (
            <div key={album.id} className={styles.albumCard}>
              {/* Header de l'album */}
              <div className={styles.albumCardHeader}>
                <div className={styles.albumCardTitleRow}>
                  <h4 className={styles.albumCardTitle}>{album.title}</h4>
                  <span className={styles.albumPhotoCount}>
                    {album.photos?.length || 0} photo{(album.photos?.length || 0) > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Menu déroulant */}
                <div
                  className={styles.dropdownMenu}
                  ref={(el) => { dropdownRefs.current[album.id] = el; }}
                >
                  <button
                    className={styles.dropdownTrigger}
                    onClick={() => setOpenDropdownId(openDropdownId === album.id ? null : album.id)}
                  >
                    <MoreVertical size={20} />
                  </button>
                  {openDropdownId === album.id && (
                    <div className={styles.dropdownContent}>
                      <button
                        onClick={() => handleOpenQRModal(album)}
                        className={styles.dropdownItem}
                      >
                        <QrCode size={16} />
                        QR Code
                      </button>
                      <button
                        onClick={() => handleCopyShareLink(album.id)}
                        className={styles.dropdownItem}
                      >
                        <Copy size={16} />
                        Copier le lien
                      </button>
                      <button
                        onClick={() => handleOpenShareLink(album.id)}
                        className={styles.dropdownItem}
                      >
                        <ExternalLink size={16} />
                        Ouvrir
                      </button>
                      <div className={styles.dropdownSeparator}></div>
                      <button
                        onClick={() => toggleSelectionMode(album.id)}
                        className={styles.dropdownItem}
                      >
                        <CheckSquare size={16} />
                        Sélectionner
                      </button>
                      <button
                        onClick={() => handleDownloadAll(album)}
                        className={styles.dropdownItem}
                      >
                        <Download size={16} />
                        Tout télécharger
                      </button>
                      <div className={styles.dropdownSeparator}></div>
                      <button
                        onClick={() => handleDeleteAlbum(album)}
                        className={`${styles.dropdownItem} ${styles.dangerItem}`}
                      >
                        <Trash2 size={16} />
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Barre d'outils de sélection */}
              {selectionMode === album.id && (
                <div className={styles.selectionToolbar} style={{ marginBottom: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 'bold' }}>{selectedPhotos.size} sélectionnée(s)</span>
                    <button onClick={() => selectAllPhotos(album)} className={styles.textButton} style={{ fontSize: '0.9rem', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Tout sélectionner</button>
                    <button onClick={deselectAllPhotos} className={styles.textButton} style={{ fontSize: '0.9rem', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Tout désélectionner</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => toggleSelectionMode(album.id)}
                      className={styles.secondaryButton}
                      style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => handleDownloadSelected(album)}
                      className={styles.primaryButton}
                      disabled={selectedPhotos.size === 0 || isDownloading}
                      style={{ padding: '0.5rem 1rem', background: '#d4af37', color: 'white', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: selectedPhotos.size === 0 || isDownloading ? 'not-allowed' : 'pointer', opacity: selectedPhotos.size === 0 || isDownloading ? 0.7 : 1 }}
                    >
                      {isDownloading ? <Loader2 size={16} className={styles.spin} /> : <Download size={16} />}
                      {isDownloading ? `Téléchargement ${downloadProgress}%` : 'Télécharger'}
                    </button>
                    <button
                      onClick={() => handleDeleteSelected(album)}
                      className={styles.dangerButton}
                      disabled={selectedPhotos.size === 0 || isDownloading}
                      style={{ padding: '0.5rem 1rem', background: '#e53935', color: 'white', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: selectedPhotos.size === 0 || isDownloading ? 'not-allowed' : 'pointer', opacity: selectedPhotos.size === 0 || isDownloading ? 0.7 : 1 }}
                    >
                      <Trash2 size={16} />
                      Supprimer
                    </button>
                  </div>
                </div>
              )}

              {/* Bouton Ajouter des photos */}
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
              {album.photos && album.photos.length > 0 && (
                <div className={styles.albumGrid}>
                  {album.photos.map((photo, index) => {
                    const photoUrl = getPhotoDisplayUrl(photo);
                    const isPublic = photo.status === 'PUBLIC';
                    const isApproved = photo.status === 'APPROVED';
                    const isPending = photo.status === 'PENDING';

                    return (
                      <div
                        key={photo.id || index}
                        className={styles.albumPhoto}
                        style={selectionMode === album.id && selectedPhotos.has(photo.id) ? { border: '3px solid #d4af37', transform: 'scale(0.98)' } : {}}
                        onClick={() => {
                          if (selectionMode === album.id) {
                            togglePhotoSelection(photo.id);
                          }
                        }}
                      >
                        {/* Checkbox overlay */}
                        {selectionMode === album.id && (
                          <div className={styles.selectionOverlay} style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); togglePhotoSelection(photo.id); }}>
                            {selectedPhotos.has(photo.id) ? (
                              <div style={{ background: '#d4af37', borderRadius: '4px', padding: '2px', display: 'flex' }}>
                                <CheckSquare color="white" size={24} />
                              </div>
                            ) : (
                              <div style={{ background: 'rgba(255,255,255,0.8)', borderRadius: '4px', padding: '2px', display: 'flex' }}>
                                <Square color="#333" size={24} />
                              </div>
                            )}
                          </div>
                        )}

                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={photo.caption || `Photo ${index + 1}`}
                            className={styles.albumPhotoImage}
                            onClick={(e) => {
                              if (selectionMode === album.id) {
                                e.stopPropagation();
                                togglePhotoSelection(photo.id);
                              } else {
                                handlePhotoClick(photo);
                              }
                            }}
                          />
                        ) : (
                          <div
                            className={styles.albumPhotoPlaceholder}
                            onClick={() => handlePhotoClick(photo)}
                          >
                            <ImageIcon size={24} />
                          </div>
                        )}

                        {/* Actions sur la photo - Masquées en mode sélection */}
                        {selectionMode !== album.id && (
                          <div className={styles.photoActions}>
                            {isPending && (
                              <>
                                <button
                                  className={`${styles.photoActionButton} ${styles.approveButton}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePhotoAction(photo.id, 'approve');
                                  }}
                                  title="Approuver"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  className={`${styles.photoActionButton} ${styles.rejectButton}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePhotoAction(photo.id, 'reject');
                                  }}
                                  title="Rejeter"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            )}
                            {isApproved && (
                              <button
                                className={`${styles.photoActionButton} ${styles.publishButton}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePhotoAction(photo.id, 'publish');
                                }}
                                title="Rendre publique"
                              >
                                <Globe size={14} />
                              </button>
                            )}
                            <button
                              className={`${styles.photoActionButton} ${styles.deleteButton}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePhotoAction(photo.id, 'delete');
                              }}
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}

                        {/* Badge de statut */}
                        <div className={`${styles.photoStatusBadge} ${isPublic ? styles.statusPublic : isApproved ? styles.statusApproved : styles.statusPending}`}>
                          {isPublic ? (
                            <>
                              <Globe size={12} />
                              <span>Publique</span>
                            </>
                          ) : isApproved ? (
                            <>
                              <Verified size={12} />
                              <span>Approuvé</span>
                            </>
                          ) : (
                            <>
                              <Clock size={12} />
                              <span>En attente</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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

      {photoModalOpen && selectedPhoto && (
        <PhotoModal
          isOpen={photoModalOpen}
          onClose={handleClosePhotoModal}
          photoUrl={selectedPhoto.url}
          alt={selectedPhoto.alt}
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
