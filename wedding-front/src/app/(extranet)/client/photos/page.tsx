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
  Camera,
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
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Chargement de vos albums photos...</p>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyContent}>
          <Camera className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>Aucune invitation</h2>
          <p className={styles.emptyText}>
            Créez d'abord votre invitation pour gérer vos albums photos.
          </p>
          <button
            onClick={() => router.push('/client/invitations')}
            className={styles.primaryButton}
          >
            <ImageIcon size={18} />
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
      <HeaderMobile title="Albums Photos" />

      <div className={styles.pageContent}>
        {/* Sélecteur d'invitation - Toujours visible pour "tout voir et comprendre" */}
        <div className={styles.invitationSection}>
          <label className={styles.invitationLabel}>
            <span className={styles.invitationLabelText}>Sélectionner un événement</span>
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

        {/* Content Area */}
        {currentInvitation?.status === 'PUBLISHED' ? (
          <div className={styles.activeContent}>
            <PhotoAlbumManager invitationId={currentInvitation.id} />
          </div>
        ) : (
          <div className={styles.publishSection}>
            <div className={styles.publishContent}>
              <div className={styles.publishText}>
                <p className={styles.publishTitle}>Action requise</p>
                <p className={styles.publishSubtitle}>
                  Publiez votre invitation pour activer la gestion des photos et permettre à vos invités de contribuer.
                </p>
              </div>
              <button
                onClick={() => router.push('/client/invitations')}
                className={styles.publishButton}
              >
                Gérer mes invitations
              </button>
            </div>
            
            <div className={styles.inactiveState}>
              <ImageIcon className={styles.inactiveIcon} size={48} />
              <p>L'album photo est verrouillé tant que l'invitation n'est pas publique.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}