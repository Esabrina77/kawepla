'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { HeaderMobile } from '@/components/HeaderMobile';
import { useInvitations } from '@/hooks/useInvitations';
import { useDesigns } from '@/hooks/useDesigns';
import DesignPreview from '@/components/DesignPreview';
import { Edit, Globe } from 'lucide-react';
import styles from './invitation-detail.module.css';

export default function InvitationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getInvitationById, publishInvitation, loading } = useInvitations();
  const { designs } = useDesigns();

  const [invitation, setInvitation] = useState<any>(null);

  useEffect(() => {
    if (params.id) {
      loadInvitation(params.id as string);
    }
  }, [params.id]);

  const loadInvitation = async (id: string) => {
    const invitationData = await getInvitationById(id);
    if (invitationData) {
      setInvitation(invitationData);
    }
  };

  const handlePublish = async () => {
    if (!invitation) return;

    const result = await publishInvitation(invitation.id);
    if (result) {
      setInvitation((prev: any) => prev ? { ...prev, status: 'PUBLISHED' } : null);
      // Suppression de l'alert pour éviter les problèmes avec les navigateurs
    }
  };

  const getDesignName = (designId: string) => {
    const design = designs.find(d => d.id === designId);
    return design ? design.name : 'Design inconnu';
  };

  const getSelectedDesign = () => {
    if (!invitation) return null;
    return designs.find(d => d.id === invitation.designId);
  };



  if (loading) {
    return (
      <div className={styles.invitationDetail}>
        <HeaderMobile title="Détail événement" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingSpinner}></div>
            <p>Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className={styles.invitationDetail}>
        <HeaderMobile title="Détail événement" />
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <h2>Invitation non trouvée</h2>
            <button onClick={() => router.push('/client/invitations')} className={styles.backButton}>
              Retour aux événements
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.invitationDetail}>
      <HeaderMobile title={invitation.eventTitle || 'Invitation sans titre'} />

      <div className={styles.pageContent}>
        {/* Preview Section - Full Page */}
        <div className={styles.previewSection}>
          <div className={styles.previewContainer}>
            {getSelectedDesign() && (
              <DesignPreview
                design={getSelectedDesign()!}
                width={500}
                height={700}
              />
            )}
          </div>
        </div>

        {/* Info Section - Compact */}
        <div className={styles.infoSection}>
          <div className={styles.statusBadge}>
            <span className={`${styles.status} ${styles[invitation.status?.toLowerCase()]}`}>
              {invitation.status === 'PUBLISHED' ? 'Publiée' : 'Brouillon'}
            </span>
          </div>

          <div className={styles.designInfo}>
            <span className={styles.designLabel}>Design:</span>
            <span className={styles.designName}>{getDesignName(invitation.designId)}</span>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            {invitation.status === 'DRAFT' && (
              <>
                <button
                  className={styles.actionButton}
                  onClick={() => router.push(`/client/invitations/${invitation.id}/edit`)}
                >
                  <Edit size={18} />
                  Modifier
                </button>
                <button
                  className={`${styles.actionButton} ${styles.publishButton}`}
                  onClick={handlePublish}
                >
                  <Globe size={18} />
                  Publier
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
