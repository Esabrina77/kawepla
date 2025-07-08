'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInvitations } from '@/hooks/useInvitations';
import { useDesigns } from '@/hooks/useDesigns';
import { TemplateEngine } from '@/lib/templateEngine';
import styles from './preview.module.css';

export default function InvitationPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { getInvitationById, loading } = useInvitations();
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

  const getSelectedDesign = () => {
    if (!invitation) return null;
    return designs.find(d => d.id === invitation.designId);
  };

  const getPreviewHtml = () => {
    const selectedDesign = getSelectedDesign();
    if (!selectedDesign || !selectedDesign.template) return '';
    
    try {
      const templateEngine = new TemplateEngine();
      const templateData = {
        coupleName: invitation.coupleName || 'Votre couple',
        day: invitation.weddingDate ? new Date(invitation.weddingDate).getDate().toString() : '15',
        month: invitation.weddingDate ? new Date(invitation.weddingDate).toLocaleDateString('fr-FR', { month: 'long' }) : 'Juin',
        year: invitation.weddingDate ? new Date(invitation.weddingDate).getFullYear().toString() : '2024',
        date: invitation.weddingDate ? new Date(invitation.weddingDate).toLocaleDateString('fr-FR', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }) : '15 Juin 2024',
        time: invitation.ceremonyTime || '15h00',
        invitationText: invitation.invitationText || 'Vous êtes cordialement invités',
        venue: invitation.venueName || 'Lieu de la cérémonie',
        address: invitation.venueAddress || 'Adresse du lieu',
        details: [
          invitation.venueName ? `Lieu : ${invitation.venueName}` : '',
          invitation.venueAddress ? `Adresse : ${invitation.venueAddress}` : '',
          invitation.ceremonyTime ? `Cérémonie : ${invitation.ceremonyTime}` : '',
          invitation.receptionTime ? `Réception : ${invitation.receptionTime}` : '',
          invitation.moreInfo || ''
        ].filter(Boolean).join('\n') || 'Détails de la cérémonie',
        message: invitation.message || 'Votre présence sera notre plus beau cadeau',
        blessingText: invitation.blessingText || 'Avec leurs familles',
        welcomeMessage: invitation.welcomeMessage || 'Bienvenue à notre mariage',
        rsvpDetails: invitation.rsvpDetails || 'Merci de confirmer votre présence',
        rsvpForm: invitation.rsvpForm || 'RSVP requis',
        rsvpDate: invitation.rsvpDate ? new Date(invitation.rsvpDate).toLocaleDateString('fr-FR') : '',
        dressCode: invitation.dressCode || 'Tenue de soirée souhaitée',
        contact: invitation.contact || ''
      };

      return templateEngine.render(selectedDesign, templateData);
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
    <div className={styles.previewPage}>
      <div className={styles.toolbar}>
        <button 
          className={styles.backButton}
          onClick={() => router.push(`/client/invitations/${invitation.id}`)}
        >
          ← Retour
        </button>
        
        <div className={styles.previewTitle}>
          <h1>Aperçu - {invitation.coupleName}</h1>
          <span className={`${styles.status} ${styles[invitation.status.toLowerCase()]}`}>
            {invitation.status}
          </span>
        </div>
      </div>

      <div className={styles.previewContainer}>
        <div 
          className={styles.invitationPreview}
          dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
        />
      </div>
    </div>
  );
} 