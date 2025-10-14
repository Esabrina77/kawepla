/**
 * Composant pour gérer les albums photos des organisateurs
 */
'use client';

import React, { useState, useEffect } from 'react';
import { usePhotoAlbums, PhotoAlbum, Photo } from '@/hooks/usePhotoAlbums';
import { QRCodeModal } from '@/components/QRCodeModal/QRCodeModal';
import PhotoModal from '@/components/PhotoModal/PhotoModal';
import { 
  Plus, 
  Upload, 
  Check, 
  X, 
  Eye, 
  Trash2, 
  Edit,
  Image as ImageIcon,
  Clock,
  Globe,
  Share2,
  Copy,
  ExternalLink,
  QrCode,
  Download,
  Sparkles,
  Filter,
  Search,
  Grid3X3,
  List,
  MoreVertical,
  Star,
  Heart,
  Camera
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
    updateAlbum,
    deleteAlbum,
    uploadPhoto,
    approvePhoto,
    publishPhoto,
    rejectPhoto,
    deletePhoto
  } = usePhotoAlbums(invitationId);

  // États du composant
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<PhotoAlbum | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  
  // États pour l'UI améliorée
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'public'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'photos'>('date');
  const [showFilters, setShowFilters] = useState(false);
  
  // État pour le modal QR Code
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedAlbumForQR, setSelectedAlbumForQR] = useState<PhotoAlbum | null>(null);
  
  // État pour le modal de photo
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; alt: string } | null>(null);

  // Animation d'entrée pour les albums
  const [visibleAlbums, setVisibleAlbums] = useState<string[]>([]);

  useEffect(() => {
    // Animation d'entrée progressive des albums
    const timer = setTimeout(() => {
      albums.forEach((album, index) => {
        setTimeout(() => {
          setVisibleAlbums(prev => [...prev, album.id]);
        }, index * 100);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [albums]);

  // Fonction pour ouvrir une photo en grand
  const handlePhotoClick = (photo: Photo) => {
    const photoUrl = photo.originalUrl || photo.compressedUrl || photo.thumbnailUrl;
    
    if (!photoUrl) {
      console.error('No photo URL available:', photo);
      return;
    }
    
    setSelectedPhoto({
      url: photoUrl,
      alt: photo.caption || 'Photo de événement'
    });
    setPhotoModalOpen(true);
  };

  // Fonction pour obtenir l'URL d'affichage d'une photo avec fallback
  const getPhotoDisplayUrl = (photo: Photo): string => {
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
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>, photo: Photo) => {
    console.warn('Image failed to load:', photo);
    const img = event.target as HTMLImageElement;
    img.src = `https://via.placeholder.com/300x300/cccccc/666666?text=Photo+${photo.id}`;
    img.alt = 'Photo non disponible';
  };

  // Fonction pour fermer le modal photo
  const handleClosePhotoModal = () => {
    setPhotoModalOpen(false);
    setSelectedPhoto(null);
  };

  // Créer un nouvel album
  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      await createAlbum({
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        isPublic: formData.get('isPublic') === 'on'
      });
      setShowCreateForm(false);
      form.reset();
    } catch (error) {
      console.error('Erreur lors de la création de l\'album:', error);
    }
  };

  // Uploader des photos
  const handlePhotoUpload = async (albumId: string, files: FileList) => {
    if (!files.length) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await uploadPhoto(albumId, file);
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
    } finally {
      setUploading(false);
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
    } catch (error) {
      console.error(`Erreur lors de l'action ${action}:`, error);
    }
  };

  // Supprimer un album
  const handleDeleteAlbum = async (album: PhotoAlbum) => {
    const confirmed = confirm(
      `Êtes-vous sûr de vouloir supprimer l'album "${album.title}" ?\n\nCette action supprimera définitivement l'album et toutes ses photos. Cette action est irréversible.`
    );
    
    if (confirmed) {
      try {
        await deleteAlbum(album.id);
        // L'album sera automatiquement retiré de la liste grâce au hook
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'album:', error);
        // L'erreur sera gérée par le hook usePhotoAlbums
      }
    }
  };

  const getPhotoStatusIcon = (status: Photo['status']) => {
    switch (status) {
      case 'PENDING':
        return <Clock className={styles.statusIcon} />;
      case 'APPROVED':
        return <Check className={styles.statusIcon} />;
      case 'PUBLIC':
        return <Globe className={styles.statusIcon} />;
      case 'REJECTED':
        return <X className={styles.statusIcon} />;
      default:
        return null;
    }
  };

  // Copier le lien de partage d'album
  const handleCopyShareLink = async (albumId: string) => {
    const shareUrl = `${window.location.origin}/share-album/${albumId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      // Feedback visuel
      const button = document.querySelector(`[data-album-id="${albumId}"]`) as HTMLElement;
      if (button) {
        button.style.background = 'var(--alert-success)';
        button.style.color = 'white';
        setTimeout(() => {
          button.style.background = '';
          button.style.color = '';
        }, 2000);
      }
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
      // Fallback pour les navigateurs plus anciens
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  // Ouvrir le lien de partage dans un nouvel onglet
  const handleOpenShareLink = (albumId: string) => {
    const shareUrl = `${window.location.origin}/share-album/${albumId}`;
    window.open(shareUrl, '_blank');
  };

  // Ouvrir le modal QR code
  const handleOpenQRModal = (album: PhotoAlbum) => {
    setSelectedAlbumForQR(album);
    setQrModalOpen(true);
  };

  // Fermer le modal QR code
  const handleCloseQRModal = () => {
    setQrModalOpen(false);
    setSelectedAlbumForQR(null);
  };

  // Télécharger toutes les photos d'un album
  const handleDownloadAlbum = async (album: PhotoAlbum) => {
    try {
      // Créer un zip avec toutes les photos approuvées
      const approvedPhotos = album.photos.filter(photo => 
        photo.status === 'APPROVED' || photo.status === 'PUBLIC'
      );
      
      if (approvedPhotos.length === 0) {
        alert('Aucune photo approuvée à télécharger dans cet album.');
        return;
      }

      // Récupérer le token depuis les cookies
      const getAuthToken = (): string | null => {
        if (typeof window !== 'undefined') {
          const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];
          return token ? decodeURIComponent(token) : null;
        }
        return null;
      };

      const token = getAuthToken();
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // Utiliser l'endpoint backend pour télécharger le zip
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013'}/api/photos/albums/${album.id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      // Créer un blob à partir de la réponse
      const blob = await response.blob();
      
      // Créer un lien de téléchargement
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${album.title}_photos.zip`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'album:', error);
      alert('Erreur lors du téléchargement de l\'album.');
    }
  };

  // Filtrer et trier les albums
  const filteredAndSortedAlbums = albums
    .filter(album => 
      album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      album.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'photos':
          return b.photos.length - a.photos.length;
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Chargement des albums...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <p className={styles.errorText}>Erreur: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header avec contrôles */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.headerTitle}>
            <Sparkles className={styles.headerIcon} />
            Albums Photos
          </h2>
          <div className={styles.headerStats}>
            <span className={styles.statBadge}>
              <Camera className={styles.statIcon} />
              {albums.length} album{albums.length > 1 ? 's' : ''}
            </span>
            <span className={styles.statBadge}>
              <ImageIcon className={styles.statIcon} />
              {albums.reduce((total, album) => total + album.photos.length, 0)} photos
            </span>
          </div>
        </div>
        
        <div className={styles.headerRight}>
          <button 
            onClick={() => setShowCreateForm(true)}
            className={styles.createButton}
          >
            <Plus className={styles.icon} />
            Créer un album
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className={styles.toolbar}>
        <div className={styles.searchSection}>
          <div className={styles.searchInput}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Rechercher un album..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchField}
            />
          </div>
        </div>

        <div className={styles.controlsSection}>
          <div className={styles.viewControls}>
            <button
              className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className={styles.viewIcon} />
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List className={styles.viewIcon} />
            </button>
          </div>

          <div className={styles.filterControls}>
            <button
              className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className={styles.filterIcon} />
              Filtres
            </button>
          </div>
        </div>
      </div>

      {/* Panneau de filtres */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Trier par :</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'photos')}
              className={styles.filterSelect}
            >
              <option value="date">Date de création</option>
              <option value="name">Nom</option>
              <option value="photos">Nombre de photos</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Statut :</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'approved' | 'public')}
              className={styles.filterSelect}
            >
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvées</option>
              <option value="public">Publiques</option>
            </select>
          </div>
        </div>
      )}

      {/* Formulaire de création d'album */}
      {showCreateForm && (
        <div className={styles.createForm}>
          <div className={styles.formHeader}>
            <h3 className={styles.formTitle}>
              <Plus className={styles.formIcon} />
              Créer un nouvel album
            </h3>
            <button 
              onClick={() => setShowCreateForm(false)}
              className={styles.closeFormButton}
            >
              <X className={styles.closeIcon} />
            </button>
          </div>
          
          <form onSubmit={handleCreateAlbum}>
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.formLabel}>Titre de l'album</label>
              <input
                type="text"
                id="title"
                name="title"
                required
                placeholder="Ex: cérémonie, cocktail, Soirée..."
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.formLabel}>Description (optionnel)</label>
              <textarea
                id="description"
                name="description"
                placeholder="Description de l'album..."
                className={styles.formTextarea}
              />
            </div>
            {/* <div className={styles.formGroup}>
              <label className={styles.checkbox}>
                <input type="checkbox" name="isPublic" />
                Album public (visible par tous les invités)
              </label>
            </div> */}
            <div className={styles.formActions}>
              <button type="button" className={styles.cancelButton} onClick={() => setShowCreateForm(false)}>
                Annuler
              </button>
              <button type="submit" className={styles.submitButton}>
                <Plus className={styles.submitIcon} />
                Créer l'album
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des albums */}
      <div className={`${styles.albumsGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
        {filteredAndSortedAlbums.length === 0 ? (
          <div className={styles.emptyState}>
            <Camera className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>
              {searchTerm ? 'Aucun album trouvé' : 'Aucun album photo'}
            </h3>
            <p className={styles.emptyText}>
              {searchTerm 
                ? 'Aucun album ne correspond à votre recherche.'
                : 'Créez votre premier album pour commencer à collecter les photos de votre événement.'
              }
            </p>
          
          </div>
        ) : (
          filteredAndSortedAlbums.map((album) => (
            <div 
              key={album.id} 
              className={`${styles.albumCard} ${visibleAlbums.includes(album.id) ? styles.visible : ''}`}
            >
              <div className={styles.albumHeader}>
                <div className={styles.albumInfo}>
                  <h3 className={styles.albumTitle}>{album.title}</h3>
                  {album.isPublic && (
                    <span className={styles.publicBadge}>
                      <Globe className={styles.badgeIcon} />
                      Public
                    </span>
                  )}
                </div>
                
                <div className={styles.albumActions}>
                  <button 
                    className={styles.actionButton}
                    onClick={() => setSelectedAlbum(selectedAlbum?.id === album.id ? null : album)}
                  >
                    <Eye className={styles.icon} />
                    {selectedAlbum?.id === album.id ? 'Masquer' : 'Voir'}
                  </button>
                  
                  <div className={styles.dropdownMenu}>
                    <button className={styles.dropdownTrigger}>
                      <MoreVertical className={styles.icon} />
                    </button>
                    <div className={styles.dropdownContent}>
                      <button 
                        onClick={() => handleOpenQRModal(album)}
                        className={styles.dropdownItem}
                      >
                        <QrCode className={styles.dropdownIcon} />
                        QR Code
                      </button>
                      <button 
                        onClick={() => handleDownloadAlbum(album)}
                        className={styles.dropdownItem}
                      >
                        <Download className={styles.dropdownIcon} />
                        Télécharger
                      </button>
                      <button 
                        onClick={() => handleCopyShareLink(album.id)}
                        className={styles.dropdownItem}
                        data-album-id={album.id}
                      >
                        <Copy className={styles.dropdownIcon} />
                        Copier le lien
                      </button>
                      <button 
                        onClick={() => handleOpenShareLink(album.id)}
                        className={styles.dropdownItem}
                      >
                        <ExternalLink className={styles.dropdownIcon} />
                        Ouvrir
                      </button>
                      <div className={styles.dropdownSeparator}></div>
                      <button 
                        onClick={() => handleDeleteAlbum(album)}
                        className={`${styles.dropdownItem} ${styles.dangerItem}`}
                      >
                        <Trash2 className={styles.dropdownIcon} />
                        Supprimer l'album
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {album.description && (
                <p className={styles.albumDescription}>{album.description}</p>
              )}

              <div className={styles.albumStats}>
                <span className={styles.statItem}>
                  <ImageIcon className={styles.statIcon} />
                  {album.photos.length} photos
                </span>
                <span className={styles.statItem}>
                  <Check className={styles.statIcon} />
                  {album.photos.filter(p => p.status === 'APPROVED' || p.status === 'PUBLIC').length} approuvées
                </span>
                <span className={styles.statItem}>
                  <Clock className={styles.statIcon} />
                  {album.photos.filter(p => p.status === 'PENDING').length} en attente
                </span>
              </div>

              {/* Zone d'upload */}
              <div className={styles.uploadZone}>
                <input
                  type="file"
                  id={`upload-${album.id}`}
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handlePhotoUpload(album.id, e.target.files)}
                  className={styles.fileInput}
                />
                <label htmlFor={`upload-${album.id}`} className={styles.uploadLabel}>
                  <Upload className={styles.uploadIcon} />
                  {uploading ? 'Upload en cours...' : 'Ajouter des photos'}
                </label>
              </div>

              {/* Photos de l'album */}
              {selectedAlbum?.id === album.id && (
                <div className={styles.photosSection}>
                  {album.photos.length === 0 ? (
                    <div className={styles.emptyPhotos}>
                      <ImageIcon className={styles.emptyIcon} />
                      <p>Aucune photo dans cet album</p>
                    </div>
                  ) : (
                    <div className={styles.photosGrid}>
                      {album.photos.map((photo) => (
                        <div key={photo.id} className={styles.photoCard}>
                          <div className={styles.photoContainer}>
                            <img
                              src={getPhotoDisplayUrl(photo)}
                              alt={photo.caption || 'Photo de événement'}
                              className={styles.photoImage}
                              onClick={() => handlePhotoClick(photo)}
                              onError={(e) => handleImageError(e, photo)}
                            />
                            <div className={styles.photoOverlay}>
                              <div className={styles.photoActions}>
                                <button
                                  className={styles.photoActionButton}
                                  onClick={() => handlePhotoClick(photo)}
                                >
                                  <Eye className={styles.photoActionIcon} />
                                </button>
                                {photo.status === 'PENDING' && (
                                  <>
                                    <button
                                      className={styles.photoActionButton}
                                      onClick={() => handlePhotoAction(photo.id, 'approve')}
                                    >
                                      <Check className={styles.photoActionIcon} />
                                    </button>
                                    <button
                                      className={styles.photoActionButton}
                                      onClick={() => handlePhotoAction(photo.id, 'reject')}
                                    >
                                      <X className={styles.photoActionIcon} />
                                    </button>
                                  </>
                                )}
                                {photo.status === 'APPROVED' && (
                                  <button
                                    className={styles.photoActionButton}
                                    onClick={() => handlePhotoAction(photo.id, 'publish')}
                                  >
                                    <Globe className={styles.photoActionIcon} />
                                  </button>
                                )}
                                <button
                                  className={styles.photoActionButton}
                                  onClick={() => handlePhotoAction(photo.id, 'delete')}
                                >
                                  <Trash2 className={styles.photoActionIcon} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className={styles.photoInfo}>
                            <div className={styles.photoStatus}>
                              {getPhotoStatusIcon(photo.status)}
                              <span className={styles.statusText}>
                                {photo.status === 'PENDING' && 'En attente'}
                                {photo.status === 'APPROVED' && 'Approuvée'}
                                {photo.status === 'PUBLIC' && 'Publique'}
                                {photo.status === 'REJECTED' && 'Rejetée'}
                              </span>
                            </div>
                            {photo.caption && (
                              <p className={styles.photoCaption}>{photo.caption}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

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