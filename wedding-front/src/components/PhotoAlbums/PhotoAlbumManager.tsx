/**
 * Composant pour gérer les albums photos des couples
 */
'use client';

import React, { useState } from 'react';
import { usePhotoAlbums, PhotoAlbum, Photo } from '@/hooks/usePhotoAlbums';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  Download
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
  
  // État pour le modal QR Code
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedAlbumForQR, setSelectedAlbumForQR] = useState<PhotoAlbum | null>(null);
  
  // État pour le modal de photo
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; alt: string } | null>(null);

  // Fonction pour ouvrir une photo en grand
  const handlePhotoClick = (photo: Photo) => {
    const photoUrl = photo.originalUrl || photo.compressedUrl || photo.thumbnailUrl;
    
    if (!photoUrl) {
      console.error('No photo URL available:', photo);
      return;
    }
    
    setSelectedPhoto({
      url: photoUrl,
      alt: photo.caption || 'Photo de mariage'
    });
    setPhotoModalOpen(true);
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
      // setCopiedAlbumId(albumId); // This state was removed, so this line is removed
      setTimeout(() => {
        // setCopiedAlbumId(null); // This state was removed, so this line is removed
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
      // Fallback pour les navigateurs plus anciens
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      // setCopiedAlbumId(albumId); // This state was removed, so this line is removed
      setTimeout(() => {
        // setCopiedAlbumId(null); // This state was removed, so this line is removed
      }, 2000);
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

  if (loading) {
    return <div className={styles.loading}>Chargement des albums...</div>;
  }

  if (error) {
    return <div className={styles.error}>Erreur: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Albums Photos</h2>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className={styles.createButton}
        >
          <Plus className={styles.icon} />
          Créer un album
        </Button>
      </div>

      {/* Formulaire de création d'album */}
      {showCreateForm && (
        <Card className={styles.createForm}>
          <form onSubmit={handleCreateAlbum}>
            <div className={styles.formGroup}>
              <label htmlFor="title">Titre de l'album</label>
              <input
                type="text"
                id="title"
                name="title"
                required
                placeholder="Ex: Cérémonie, Cocktail, Soirée..."
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="description">Description (optionnel)</label>
              <textarea
                id="description"
                name="description"
                placeholder="Description de l'album..."
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.checkbox}>
                <input type="checkbox" name="isPublic" />
                Album public (visible par tous les invités)
              </label>
            </div>
            <div className={styles.formActions}>
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Annuler
              </Button>
              <Button type="submit">
                Créer l'album
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Liste des albums */}
      <div className={styles.albumsGrid}>
        {albums.map((album) => (
          <Card key={album.id} className={styles.albumCard}>
            <div className={styles.albumHeader}>
              <h3>{album.title}</h3>
              <div className={styles.albumActions}>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedAlbum(selectedAlbum?.id === album.id ? null : album)}
                >
                  <Eye className={styles.icon} />
                  {selectedAlbum?.id === album.id ? 'Masquer' : 'Voir'}
                </Button>
                
                <Button 
                  onClick={() => handleCopyShareLink(album.id)}
                  variant="outline"
                  size="sm"
                  title="Copier le lien de partage pour les invités"
                >
                  <Copy className={styles.icon} />
                  Partager
                </Button>
                
                <Button 
                  onClick={() => handleDownloadAlbum(album)}
                  variant="outline"
                  size="sm"
                  title="Télécharger toutes les photos de l'album"
                >
                  <Download className={styles.icon} />
                  Télécharger
                </Button>
                
                <Button 
                  onClick={() => handleOpenQRModal(album)}
                  variant="outline"
                  size="sm"
                  title="Générer un QR code pour l'album"
                >
                  <QrCode className={styles.icon} />
                  QR Code
                </Button>
              </div>
            </div>
            
            {album.description && (
              <p className={styles.albumDescription}>{album.description}</p>
            )}

            <div className={styles.albumStats}>
              <span>{album.photos?.length || 0} photo(s)</span>
              {album.isPublic && <span className={styles.publicBadge}>Public</span>}
            </div>

            {/* Zone d'upload */}
            <div className={styles.uploadZone}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handlePhotoUpload(album.id, e.target.files)}
                className={styles.fileInput}
                id={`upload-${album.id}`}
              />
              <label htmlFor={`upload-${album.id}`} className={styles.uploadLabel}>
                <Upload className={styles.icon} />
                {uploading ? 'Upload en cours...' : 'Ajouter des photos'}
              </label>
            </div>

            {/* Photos de l'album */}
            {selectedAlbum?.id === album.id && (
              <div className={styles.photosGrid}>
                {album.photos?.map((photo) => (
                  <div key={photo.id} className={styles.photoCard}>
                    <div className={styles.photoContainer}>
                      <img 
                        src={photo.thumbnailUrl || photo.compressedUrl || photo.originalUrl} 
                        alt={photo.caption || 'Photo'}
                        className={styles.photoImage}
                        onClick={() => handlePhotoClick(photo)}
                      />
                      <div className={styles.photoOverlay}>
                        <div className={styles.photoStatus}>
                          {getPhotoStatusIcon(photo.status)}
                          <span>{photo.status}</span>
                        </div>
                        
                        {/* Actions de la photo */}
                        <div className={styles.photoActions}>
                          {photo.status === 'PENDING' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handlePhotoAction(photo.id, 'approve')}
                                className={styles.approveButton}
                              >
                                <Check className={styles.icon} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handlePhotoAction(photo.id, 'reject')}
                                className={styles.rejectButton}
                              >
                                <X className={styles.icon} />
                              </Button>
                            </>
                          )}
                          {photo.status === 'APPROVED' && (
                            <Button 
                              size="sm" 
                              onClick={() => handlePhotoAction(photo.id, 'publish')}
                              className={styles.publishButton}
                            >
                              <Globe className={styles.icon} />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handlePhotoAction(photo.id, 'delete')}
                            className={styles.deleteButton}
                          >
                            <Trash2 className={styles.icon} />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {photo.caption && (
                      <p className={styles.photoCaption}>{photo.caption}</p>
                    )}
                    {photo.uploadedBy && (
                      <p className={styles.photoUploader}>
                        Par {photo.uploadedBy.firstName} {photo.uploadedBy.lastName}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {albums.length === 0 && (
        <div className={styles.emptyState}>
          <ImageIcon className={styles.emptyIcon} />
          <h3>Aucun album photo</h3>
          <p>Créez votre premier album pour commencer à collecter les photos de votre mariage.</p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className={styles.icon} />
            Créer un album
          </Button>
        </div>
      )}

      {/* Informations sur le partage */}
      {albums.length > 0 && (
        <div className={styles.shareInfo}>
          <Card className={styles.shareCard}>
            <div className={styles.shareHeader}>
              <Share2 className={styles.shareIcon} />
              <h3>Partage avec vos invités</h3>
            </div>
            <div className={styles.shareContent}>
              <p>
                Chaque album dispose d'un lien de partage unique que vous pouvez envoyer à vos invités.
                Ils pourront uploader leurs photos directement, sans avoir besoin de créer un compte.
              </p>
              <div className={styles.shareSteps}>
                <div className={styles.shareStep}>
                  <span className={styles.stepNumber}>1</span>
                  <span>Cliquez sur "Partager" pour copier le lien ou "QR Code" pour générer un QR code</span>
                </div>
                <div className={styles.shareStep}>
                  <span className={styles.stepNumber}>2</span>
                  <span>Envoyez le lien par WhatsApp/email/SMS ou imprimez le QR code</span>
                </div>
                <div className={styles.shareStep}>
                  <span className={styles.stepNumber}>3</span>
                  <span>Vos invités scannent le QR code ou cliquent sur le lien</span>
                </div>
                <div className={styles.shareStep}>
                  <span className={styles.stepNumber}>4</span>
                  <span>Ils uploadent leurs photos directement</span>
                </div>
                <div className={styles.shareStep}>
                  <span className={styles.stepNumber}>5</span>
                  <span>Vous validez et publiez les plus belles</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal QR Code */}
      {selectedAlbumForQR && (
        <QRCodeModal
          isOpen={qrModalOpen}
          onClose={handleCloseQRModal}
          albumTitle={selectedAlbumForQR.title}
          albumId={selectedAlbumForQR.id}
        />
      )}

      {/* Modal Photo */}
      {(() => {
        return selectedPhoto && (
          <PhotoModal
            isOpen={photoModalOpen}
            onClose={handleClosePhotoModal}
            photoUrl={selectedPhoto.url}
            alt={selectedPhoto.alt}
          />
        );
      })()}
    </div>
  );
} 