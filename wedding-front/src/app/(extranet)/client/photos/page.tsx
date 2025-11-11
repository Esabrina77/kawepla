/**
 * Page de gestion des albums photos pour les organisateurs
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInvitations } from '@/hooks/useInvitations';
import { usePhotoAlbums, PhotoAlbum } from '@/hooks/usePhotoAlbums';
import { HeaderMobile } from '@/components/HeaderMobile';
import { PhotoAlbumManager } from '@/components/PhotoAlbums/PhotoAlbumManager';
import { 
  FileImage,
  UploadCloud,
  CheckCircle,
  Share2,
  ImagePlus,
  Verified,
  Clock,
  Camera, 
  Check,
  X,
  Globe, 
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import styles from './photos.module.css';

export default function PhotosPage() {
  const router = useRouter();
  const { invitations, loading } = useInvitations();
  const [selectedInvitationId, setSelectedInvitationId] = useState<string>('');

  // Sélectionner automatiquement la première invitation
  useEffect(() => {
    if (invitations.length > 0 && !selectedInvitationId) {
      setSelectedInvitationId(invitations[0].id);
    }
  }, [invitations, selectedInvitationId]);

  const currentInvitation = invitations.find(inv => inv.id === selectedInvitationId);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Chargement de vos albums photos...</p>
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyContent}>
          <Camera className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>
            Aucune invitation trouvée
          </h2>
          <p className={styles.emptyText}>
            Créez d'abord votre invitation de événement pour gérer vos albums photos.
          </p>
          <button
            onClick={() => window.location.href = '/client/invitations'}
            className={styles.primaryButton}
          >
            <ImageIcon className={styles.buttonIcon} />
            Créer une invitation
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };


  return (
    <div className={styles.photosPage}>
      <HeaderMobile title="Vos albums photos" />
        
      <main className={styles.main}>
        {/* Sélecteur d'invitation */}
        <div className={styles.invitationSection}>
          <label className={styles.invitationLabel}>
            <p className={styles.invitationLabelText}>Invitation</p>
            <select 
              value={selectedInvitationId}
              onChange={(e) => setSelectedInvitationId(e.target.value)}
              className={styles.invitationSelect}
            >
              {invitations.map(invitation => (
                <option key={invitation.id} value={invitation.id}>
                  {invitation.eventTitle}{invitation.eventDate ? ` - ${formatDate(invitation.eventDate)}` : ''}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Section Publiez votre invitation */}
        {currentInvitation && currentInvitation.status !== 'PUBLISHED' && (
          <div className={styles.publishSection}>
            <div className={styles.publishContent}>
              <div className={styles.publishText}>
                <p className={styles.publishTitle}>Publiez votre invitation</p>
                <p className={styles.publishSubtitle}>
                  Cette fonctionnalité n'est disponible qu'une fois votre invitation publiée.
                </p>
              </div>
              <button
                onClick={() => router.push('/client/invitations')}
                className={styles.publishButton}
              >
                Publier maintenant
              </button>
            </div>
          </div>
        )}

        {/* Section Comment ça marche ? */}
        <h3 className={styles.sectionTitle}>Comment ça marche ?</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <FileImage className={styles.infoCardIcon} size={24} />
            <div className={styles.infoCardContent}>
              <h4 className={styles.infoCardTitle}>Créez vos albums</h4>
              <p className={styles.infoCardText}>Organisez par moments clés</p>
            </div>
          </div>
          
          <div className={styles.infoCard}>
            <UploadCloud className={styles.infoCardIcon} size={24} />
            <div className={styles.infoCardContent}>
              <h4 className={styles.infoCardTitle}>Vos invités contribuent</h4>
              <p className={styles.infoCardText}>Ils ajoutent leurs photos</p>
            </div>
          </div>
          
          <div className={styles.infoCard}>
            <CheckCircle className={styles.infoCardIcon} size={24} />
            <div className={styles.infoCardContent}>
              <h4 className={styles.infoCardTitle}>Approuvez les photos</h4>
              <div className={styles.infoCardText}>
                <span><Check size={14} className={styles.inlineIcon} /> Approuver</span>
                <span><Globe size={14} className={styles.inlineIcon} /> Publier</span>
                <span><X size={14} className={styles.inlineIcon} /> Rejeter</span>
                <span><Trash2 size={14} className={styles.inlineIcon} /> Supprimer</span>
              </div>
            </div>
          </div>
          
          <div className={styles.infoCard}>
            <Share2 className={styles.infoCardIcon} size={24} />
            <div className={styles.infoCardContent}>
              <h4 className={styles.infoCardTitle}>Partagez publiquement</h4>
              <p className={styles.infoCardText}>Rendez la galerie accessible</p>
          </div>
        </div>
      </div>

        {/* Section Vos Albums - PhotoAlbumManager */}
        {currentInvitation && currentInvitation.status === 'PUBLISHED' ? (
          <PhotoAlbumManager invitationId={currentInvitation.id} />
        ) : null}
      </main>
    </div>
  );
} 