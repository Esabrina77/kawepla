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
  Image as ImageIcon
} from 'lucide-react';
import styles from './PhotoAlbumManager.module.css';

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
      alert(`Erreur lors de la création de l'album : ${error.message || 'Une erreur est survenue'}`);
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
      alert('Lien copié dans le presse-papiers !');
      setOpenDropdownId(null);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  // Ouvrir le lien de partage
  const handleOpenShareLink = (albumId: string) => {
    const shareUrl = `${window.location.origin}/share-album/${albumId}`;
    window.open(shareUrl, '_blank');
    setOpenDropdownId(null);
  };

  // Supprimer un album
  const handleDeleteAlbum = async (album: PhotoAlbum) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'album "${album.title}" ?`)) {
      try {
        await deleteAlbum(album.id);
        setOpenDropdownId(null);
      } catch (error: any) {
        alert(`Erreur lors de la suppression : ${error.message || 'Une erreur est survenue'}`);
      }
    }
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
      alert(`Erreur lors de l'upload : ${error.message || 'Une erreur est survenue'}`);
    } finally {
      setUploading(prev => ({ ...prev, [albumId]: false }));
    }
  };

  // Gérer les actions sur les photos
  const handlePhotoAction = async (photoId: string, action: 'approve' | 'publish' | 'reject' | 'delete') => {
    try {
      switch (action) {
        case 'approve':
          await approvePhoto(photoId);
          break;
        case 'publish':
          await publishPhoto(photoId);
          break;
        case 'reject':
          await rejectPhoto(photoId);
          break;
        case 'delete':
          if (confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) {
            await deletePhoto(photoId);
          }
          break;
      }
    } catch (error: any) {
      alert(`Erreur lors de l'action : ${error.message || 'Une erreur est survenue'}`);
    }
  };

  // Fermer le modal photo
  const handleClosePhotoModal = () => {
    setPhotoModalOpen(false);
    setSelectedPhoto(null);
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
                      >
                        {photoUrl ? (
                            <img
                            src={photoUrl} 
                            alt={photo.caption || `Photo ${index + 1}`}
                            className={styles.albumPhotoImage}
                              onClick={() => handlePhotoClick(photo)}
                            />
                        ) : (
                          <div 
                            className={styles.albumPhotoPlaceholder}
                                  onClick={() => handlePhotoClick(photo)}
                                >
                            <ImageIcon size={24} />
                          </div>
                        )}
                        
                        {/* Actions sur la photo */}
                        <div className={styles.photoActions}>
                          {/* Pour les photos en attente : approuver ou rejeter */}
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
                          {/* Pour les photos approuvées : publier */}
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
                          {/* Toujours disponible : supprimer */}
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
    </div>
  );
} 
