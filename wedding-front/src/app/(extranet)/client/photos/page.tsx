/**
 * Page de gestion des albums photos pour les organisateurs
 */
'use client';

import { useState, useEffect } from 'react';
import { useInvitations } from '@/hooks/useInvitations';
import { PhotoAlbumManager } from '@/components/PhotoAlbums/PhotoAlbumManager';
import { 
  Camera, 
  Users, 
  Heart, 
  Globe, 
  AlertTriangle,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import styles from './photos.module.css';

export default function PhotosPage() {
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

  return (
    <div className={styles.photosPage}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.headerBadge}>
          <Camera className={styles.badgeIcon} />
          Gestion des albums photos
        </div>
        
        <h1 className={styles.headerTitle}>
          Vos <span className={styles.headerTitleAccent}>albums photos</span>
        </h1>
        
        <p className={styles.headerSubtitle}>
          Collectez et gérez toutes les photos de votre événement avec élégance
        </p>

        {/* Sélecteur d'invitation */}
        {invitations.length > 1 && (
          <div className={styles.invitationSelector}>
            <label htmlFor="invitation-select" className={styles.selectorLabel}>
              Invitation :
            </label>
            <select 
              id="invitation-select"
              value={selectedInvitationId}
              onChange={(e) => setSelectedInvitationId(e.target.value)}
              className={styles.invitationSelect}
            >
              {invitations.map(invitation => (
                <option key={invitation.id} value={invitation.id}>
                  {invitation.eventTitle}{invitation.eventDate ? ` - ${new Date(invitation.eventDate).toLocaleDateString('fr-FR')}` : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Conseils et informations */}
      <div className={styles.infoSection}>
        <h2 className={styles.sectionTitle}>
          <Sparkles className={styles.sectionIcon} />
          Comment ça marche ?
        </h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <Camera className={styles.cardIcon} />
            </div>
            <h3 className={styles.infoCardTitle}>1. Créez vos albums</h3>
            <p className={styles.infoCardText}>Organisez vos photos par thème : cérémonie, cocktail, soirée, etc.</p>
          </div>
          
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <Users className={styles.cardIcon} />
            </div>
            <h3 className={styles.infoCardTitle}>2. Vos invités contribuent</h3>
            <p className={styles.infoCardText}>Ils peuvent uploader leurs photos directement depuis leur invitation.</p>
          </div>
          
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <Heart className={styles.cardIcon} />
            </div>
            <h3 className={styles.infoCardTitle}>3. Approuvez les photos</h3>
            <p className={styles.infoCardText}>Validez les photos avant qu'elles ne soient visibles par tous.</p>
          </div>
          
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <Globe className={styles.cardIcon} />
            </div>
            <h3 className={styles.infoCardTitle}>4. Partagez publiquement</h3>
            <p className={styles.infoCardText}>Publiez vos plus belles photos pour que tous puissent les voir.</p>
          </div>
        </div>
      </div>

      {/* Gestionnaire d'albums */}
      {currentInvitation ? (
        currentInvitation.status === 'PUBLISHED' ? (
          <PhotoAlbumManager invitationId={currentInvitation.id} />
        ) : (
          <div className={styles.restrictedAccess}>
            <div className={styles.restrictedIcon}>
              <AlertTriangle className={styles.warningIcon} />
            </div>
            <h3 className={styles.restrictedTitle}>Invitation non publiée</h3>
            <p className={styles.restrictedText}>
              Vous devez d'abord publier votre invitation pour pouvoir créer des albums photos.
            </p>
            <div className={styles.restrictedActions}>
              <button
                onClick={() => window.location.href = '/client/invitations'}
                className={styles.primaryButton}
              >
                Publier mon invitation
              </button>
            </div>
          </div>
        )
      ) : (
        <div className={styles.noInvitation}>
          <p className={styles.noInvitationText}>
            Créez d'abord une invitation pour commencer à gérer vos photos.
          </p>
          <button
            onClick={() => window.location.href = '/client/invitations'}
            className={styles.primaryButton}
          >
            Créer une invitation
          </button>
        </div>
      )}
    </div>
  );
} 