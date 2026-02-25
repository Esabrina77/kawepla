'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/apiClient';
import { HeaderMobile } from '@/components/HeaderMobile';
import DesignPreview from '@/components/DesignPreview';
import { AlertTriangle } from 'lucide-react';
import { Design } from '@/types';
import styles from './design.module.css';

interface InvitationDesign {
  id: string;
  eventTitle?: string;
  eventDate?: string | Date;
  eventType?: string;
  eventTime?: string;
  location?: string;
  customText?: string;
  moreInfo?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  design?: Design | null;
  customDesign?: Design | null;
  customDesignId?: string | null;
  customFabricData?: any;
  customCanvasWidth?: number;
  customCanvasHeight?: number;
}

export default function InvitationDesignPage() {
  const params = useParams();
  const router = useRouter();
  const invitationId = params.id as string;

  const [invitation, setInvitation] = useState<InvitationDesign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayDesign, setDisplayDesign] = useState<Design | null>(null);

  const fetchInvitationDesign = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<InvitationDesign>(`/admin/invitations/${invitationId}`);
      setInvitation(data);

      // Déterminer quel design afficher (priorité: customDesign > customFabricData > design)
      if (data.customDesign) {
        setDisplayDesign(data.customDesign);
      } else if (data.customDesignId && data.customFabricData) {
        // Créer un objet Design temporaire à partir de customFabricData
        setDisplayDesign({
          id: data.customDesignId,
          name: data.design?.name || 'Design personnalisé',
          description: 'Design personnalisé par l\'utilisateur',
          fabricData: data.customFabricData,
          canvasWidth: data.customCanvasWidth || 794,
          canvasHeight: data.customCanvasHeight || 1123,
          editorVersion: 'canva',
          isTemplate: false,
        } as Design);
      } else if (data.design) {
        setDisplayDesign(data.design);
      }
    } catch (err) {
      console.error('Erreur lors du chargement de l\'invitation:', err);
      setError('Erreur lors du chargement de l\'invitation');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'Publiée';
      case 'DRAFT':
        return 'Brouillon';
      case 'ARCHIVED':
        return 'Archivée';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return styles.statusPublished;
      case 'DRAFT':
        return styles.statusDraft;
      case 'ARCHIVED':
        return styles.statusArchived;
      default:
        return styles.statusDefault;
    }
  };

  useEffect(() => {
    if (invitationId) {
      fetchInvitationDesign();
    }
  }, [invitationId]);

  if (loading) {
    return (
      <div className={styles.designPage}>
        <HeaderMobile title="Aperçu du design" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement de l'invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.designPage}>
        <HeaderMobile title="Aperçu du design" />
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={fetchInvitationDesign} className={styles.retryButton}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className={styles.designPage}>
        <HeaderMobile title="Aperçu du design" />
        <div className={styles.errorContainer}>
          <p>Invitation non trouvée</p>
        </div>
      </div>
    );
  }

  // Vérifier si le design existe
  const hasDesign = !!displayDesign;

  return (
    <div className={styles.designPage}>
      <HeaderMobile
        title={invitation.eventTitle || 'Aperçu du design'}
        onBack={() => router.push(`/super-admin/invitations/${invitationId}`)}
      />

      <div className={styles.pageContent}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <p className={styles.pageSubtitle}>Aperçu comme vu par les invités</p>
          <span className={`${styles.statusBadge} ${getStatusColor(invitation.status)}`}>
            {getStatusLabel(invitation.status)}
          </span>
          {invitation.customDesign || invitation.customDesignId ? (
            <span className={styles.personalizedBadge}>
              Design personnalisé
            </span>
          ) : null}
        </div>

        {/* Rendu de l'invitation comme vue par les invités */}
        <div className={styles.content}>
          {hasDesign && displayDesign ? (
            <div className={styles.section}>
              <DesignPreview
                design={displayDesign}
                width={600}
                height={800}
                className={styles.invitationRender}
              />
            </div>
          ) : (
            <div className={styles.section}>
              <div className={styles.noDesign}>
                <AlertTriangle size={48} />
                <h3>Aucun design sélectionné</h3>
                <p>L'utilisateur n'a pas encore choisi de design pour cette invitation.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
