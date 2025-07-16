/**
 * Page de gestion des albums photos pour les couples
 */
'use client';

import { useState, useEffect } from 'react';
import { useInvitations } from '@/hooks/useInvitations';
import { PhotoAlbumManager } from '@/components/PhotoAlbums/PhotoAlbumManager';
import { Card } from '@/components/Card/Card';
import { Button } from '@/components/Button/Button';
import { Camera, Users, Heart, Globe, AlertTriangle } from 'lucide-react';
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
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>Chargement de vos albums photos...</p>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className={styles.noInvitation}>
        <Camera className={styles.noInvitationIcon} />
        <h2>Aucune invitation trouvée</h2>
        <p>Créez d'abord votre invitation de mariage pour gérer vos albums photos.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* En-tête avec informations */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Albums Photos</h1>
          <p>Collectez et gérez toutes les photos de votre mariage</p>
          
          {/* Sélecteur d'invitation */}
          {invitations.length > 1 && (
            <div className={styles.invitationSelector}>
              <label htmlFor="invitation-select">Invitation :</label>
              <select 
                id="invitation-select"
                value={selectedInvitationId}
                onChange={(e) => setSelectedInvitationId(e.target.value)}
                className={styles.invitationSelect}
              >
                {invitations.map(invitation => (
                  <option key={invitation.id} value={invitation.id}>
                    {invitation.coupleName} - {new Date(invitation.weddingDate).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statCard}>
            <Camera className={styles.statIcon} />
            <div>
              <span className={styles.statNumber}>∞</span>
              <span className={styles.statLabel}>Photos illimitées</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conseils et informations */}
      <div className={styles.infoSection}>
        <h2>Comment ça marche ?</h2>
        <div className={styles.infoGrid}>
          <Card className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <Camera />
            </div>
            <h3>1. Créez vos albums</h3>
            <p>Organisez vos photos par thème : cérémonie, cocktail, soirée, etc.</p>
          </Card>
          
          <Card className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <Users />
            </div>
            <h3>2. Vos invités contribuent</h3>
            <p>Ils peuvent uploader leurs photos directement depuis leur invitation.</p>
          </Card>
          
          <Card className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <Heart />
            </div>
            <h3>3. Approuvez les photos</h3>
            <p>Validez les photos avant qu'elles ne soient visibles par tous.</p>
          </Card>
          
          <Card className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <Globe />
            </div>
            <h3>4. Partagez publiquement</h3>
            <p>Publiez vos plus belles photos pour que tous puissent les voir.</p>
          </Card>
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
            <h3>Invitation non publiée</h3>
            <p>Vous devez d'abord publier votre invitation pour pouvoir créer des albums photos.</p>
            <div className={styles.restrictedActions}>
              <Button 
                onClick={() => window.location.href = '/client/invitations'} 
                variant="primary"
              >
                Publier mon invitation
              </Button>
            </div>
          </div>
        )
      ) : (
        <div className={styles.noInvitation}>
          <p>Créez d'abord une invitation pour commencer à gérer vos photos.</p>
          <Button 
            onClick={() => window.location.href = '/client/invitations'} 
            variant="primary"
          >
            Créer une invitation
          </Button>
        </div>
      )}
    </div>
  );
} 