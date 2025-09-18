'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInvitations } from '@/hooks/useInvitations';
import { useDesigns } from '@/hooks/useDesigns';
import { TemplateEngine } from '@/lib/templateEngine';
import styles from './invitation-detail.module.css';

export default function InvitationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getInvitationById, updateInvitation, publishInvitation, loading } = useInvitations();
  const { designs } = useDesigns();
  
  const [invitation, setInvitation] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  // NOUVELLE ARCHITECTURE SIMPLIFIÉE
  const [formData, setFormData] = useState({
    eventTitle: '',
    eventDate: '',
    eventTime: '',
    location: '',
    eventType: 'event' as any,
    customText: '',
    moreInfo: ''
  });

  useEffect(() => {
    if (params.id) {
      loadInvitation(params.id as string);
    }
  }, [params.id]);

  const loadInvitation = async (id: string) => {
    const invitationData = await getInvitationById(id);
    if (invitationData) {
      setInvitation(invitationData);
      setFormData({
        eventTitle: invitationData.eventTitle || '',
        eventDate: invitationData.eventDate || '',
        eventTime: invitationData.eventTime || '',
        location: invitationData.location || '',
        eventType: invitationData.eventType || 'event',
        customText: invitationData.customText || '',
        moreInfo: invitationData.moreInfo || ''
      });
    }
  };

  const handleSave = async () => {
    if (!invitation) return;
    
    const result = await updateInvitation(invitation.id, formData);
    if (result) {
      setInvitation(result);
      setIsEditing(false);
      // Suppression de l'alert pour éviter les problèmes avec les navigateurs
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

  const getPreviewHtml = () => {
    const selectedDesign = getSelectedDesign();
    if (!selectedDesign) return '';
    
    try {
      const templateEngine = new TemplateEngine();
      // Utiliser la NOUVELLE architecture avec les vraies données de l'invitation
      const invitationData = {
        eventTitle: invitation.eventTitle || '',
        eventDate: invitation.eventDate ? new Date(invitation.eventDate) : new Date(),
        eventTime: invitation.eventTime || '',
        location: invitation.location || '',
        eventType: invitation.eventType || 'event',
        customText: invitation.customText || '', // Pas de texte par défaut
        moreInfo: invitation.moreInfo || '' // Pas de texte par défaut
      };

      return templateEngine.render(selectedDesign, invitationData);
    } catch (error) {
      console.error('Erreur lors de la génération de la prévisualisation:', error);
      return '<div>Erreur de prévisualisation</div>';
    }
  };

  if (loading) {
    return <div className={styles.loading}>Chargement de l'invitation...</div>;
  }

  if (!invitation) {
    return (
      <div className={styles.error}>
        <h2>Invitation non trouvée</h2>
        <button onClick={() => router.push('/client/invitations')}>
          Retour aux invitations
        </button>
      </div>
    );
  }

  return (
    <div className={styles.invitationDetail}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button 
            className={styles.backButton}
            onClick={() => router.push('/client/invitations')}
          >
            ← Retour
          </button>
          <div className={styles.titleSection}>
            <h1>{invitation.eventTitle || 'Invitation sans titre'}</h1>
            <span className={`${styles.status} ${styles[invitation.status?.toLowerCase()]}`}>
              {invitation.status === 'PUBLISHED' ? 'Publiée' : 'Brouillon'}
            </span>
          </div>
        </div>
        
        <div className={styles.headerActions}>
          {!isEditing && invitation.status === 'DRAFT' && (
            <button 
              className={styles.editButton}
              onClick={() => router.push(`/client/invitations/${invitation.id}/edit`)}
            >
              Modifier
            </button>
          )}
          
          {isEditing && (
            <div className={styles.editActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => {
                  setIsEditing(false);
                  loadInvitation(invitation.id);
                }}
              >
                Annuler
              </button>
              <button 
                className={styles.saveButton}
                onClick={handleSave}
              >
                Sauvegarder
              </button>
            </div>
          )}
          
          {invitation.status === 'DRAFT' && (
            <button 
              className={styles.publishButton}
              onClick={handlePublish}
            >
              Publier
            </button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        {/* Prévisualisation de l'invitation */}
        <div className={styles.previewSection}>
          <div className={styles.previewContainer}>
            <div 
              className={styles.invitationPreview}
              dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
              key={`preview-${invitation.id}-${invitation.eventTitle}-${invitation.eventDate}`}
            />
          </div>
        </div>

        {/* Section des détails (optionnelle) */}
        <div className={styles.detailsSection}>
          <div className={styles.infoCard}>
            <h3>Design</h3>
            <div className={styles.designInfo}>
              <span className={styles.designName}>{getDesignName(invitation.designId)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 