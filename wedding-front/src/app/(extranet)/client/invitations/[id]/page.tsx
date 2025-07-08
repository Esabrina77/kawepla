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
  const [formData, setFormData] = useState({
    coupleName: '',
    weddingDate: '',
    ceremonyTime: '',
    receptionTime: '',
    rsvpDate: '',
    venueName: '',
    venueAddress: '',
    invitationText: '',
    message: '',
    blessingText: '',
    welcomeMessage: '',
    rsvpDetails: '',
    rsvpForm: '',
    dressCode: '',
    moreInfo: '',
    contact: ''
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
        coupleName: invitationData.coupleName || '',
        weddingDate: invitationData.weddingDate || '',
        ceremonyTime: invitationData.ceremonyTime || '',
        receptionTime: invitationData.receptionTime || '',
        rsvpDate: invitationData.rsvpDate || '',
        venueName: invitationData.venueName || '',
        venueAddress: invitationData.venueAddress || '',
        invitationText: invitationData.invitationText || '',
        message: invitationData.message || '',
        blessingText: invitationData.blessingText || '',
        welcomeMessage: invitationData.welcomeMessage || '',
        rsvpDetails: invitationData.rsvpDetails || '',
        rsvpForm: invitationData.rsvpForm || '',
        dressCode: invitationData.dressCode || '',
        moreInfo: invitationData.moreInfo || '',
        contact: invitationData.contact || ''
      });
    }
  };

  const handleSave = async () => {
    if (!invitation) return;
    
    const result = await updateInvitation(invitation.id, formData);
    if (result) {
      setInvitation(result);
      setIsEditing(false);
      alert('Invitation mise à jour avec succès !');
    }
  };

  const handlePublish = async () => {
    if (!invitation) return;
    
    const result = await publishInvitation(invitation.id);
    if (result) {
      setInvitation((prev: any) => prev ? { ...prev, status: 'PUBLISHED' } : null);
      alert('Invitation publiée avec succès !');
    }
  };

  const getDesignName = (designId: string) => {
    const design = designs.find(d => d.id === designId);
    return design ? design.name : 'Design inconnu';
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
            <h1>{invitation.coupleName}</h1>
            <span className={`${styles.status} ${styles[invitation.status.toLowerCase()]}`}>
              {invitation.status}
            </span>
          </div>
        </div>
        
        <div className={styles.headerActions}>
          <button 
            className={styles.previewButton}
            onClick={() => router.push(`/client/invitations/${invitation.id}/preview`)}
          >
            Aperçu
          </button>
          
          {!isEditing ? (
            <button 
              className={styles.editButton}
              onClick={() => router.push(`/client/invitations/${invitation.id}/edit`)}
            >
              Modifier
            </button>
          ) : (
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
          <div className={styles.detailsSection}>
            <div className={styles.infoCard}>
              <h3>Informations générales</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Couple</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.coupleName}
                      onChange={(e) => setFormData(prev => ({ ...prev, coupleName: e.target.value }))}
                    />
                  ) : (
                    <span>{invitation.coupleName}</span>
                  )}
                </div>
              
              <div className={styles.infoItem}>
                <label>Date du mariage</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.weddingDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, weddingDate: e.target.value }))}
                  />
                ) : (
                  <span>{new Date(invitation.weddingDate).toLocaleDateString('fr-FR')}</span>
                )}
              </div>
              
              <div className={styles.infoItem}>
                <label>Heure de cérémonie</label>
                {isEditing ? (
                  <input
                    type="time"
                    value={formData.ceremonyTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, ceremonyTime: e.target.value }))}
                  />
                ) : (
                  <span>{invitation.ceremonyTime || 'Non spécifiée'}</span>
                )}
              </div>
              
              <div className={styles.infoItem}>
                <label>Heure de réception</label>
                {isEditing ? (
                  <input
                    type="time"
                    value={formData.receptionTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, receptionTime: e.target.value }))}
                  />
                ) : (
                  <span>{invitation.receptionTime || 'Non spécifiée'}</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.infoCard}>
            <h3>Lieu</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Nom du lieu</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.venueName}
                    onChange={(e) => setFormData(prev => ({ ...prev, venueName: e.target.value }))}
                  />
                ) : (
                  <span>{invitation.venueName}</span>
                )}
              </div>
              
              <div className={styles.infoItem}>
                <label>Adresse</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.venueAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, venueAddress: e.target.value }))}
                  />
                ) : (
                  <span>{invitation.venueAddress}</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.infoCard}>
            <h3>Textes d'invitation</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Texte d'invitation</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.invitationText}
                    onChange={(e) => setFormData(prev => ({ ...prev, invitationText: e.target.value }))}
                    placeholder="Vous êtes cordialement invités"
                  />
                ) : (
                  <span>{invitation.invitationText || 'Non spécifié'}</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.infoCard}>
            <h3>Messages personnalisés</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Message principal</label>
                {isEditing ? (
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    placeholder="Votre présence sera notre plus beau cadeau"
                  />
                ) : (
                  <span>{invitation.message || 'Non spécifié'}</span>
                )}
              </div>
              
              <div className={styles.infoItem}>
                <label>Texte de bénédiction</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.blessingText}
                    onChange={(e) => setFormData(prev => ({ ...prev, blessingText: e.target.value }))}
                    placeholder="Avec leurs familles"
                  />
                ) : (
                  <span>{invitation.blessingText || 'Non spécifié'}</span>
                )}
              </div>
              
              <div className={styles.infoItem}>
                <label>Message de bienvenue</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.welcomeMessage}
                    onChange={(e) => setFormData(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                    placeholder="Bienvenue à notre mariage"
                  />
                ) : (
                  <span>{invitation.welcomeMessage || 'Non spécifié'}</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.infoCard}>
            <h3>RSVP et détails</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Date limite RSVP</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.rsvpDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, rsvpDate: e.target.value }))}
                  />
                ) : (
                  <span>{invitation.rsvpDate ? new Date(invitation.rsvpDate).toLocaleDateString('fr-FR') : 'Non spécifiée'}</span>
                )}
              </div>
              
              <div className={styles.infoItem}>
                <label>Instructions RSVP</label>
                {isEditing ? (
                  <textarea
                    value={formData.rsvpDetails}
                    onChange={(e) => setFormData(prev => ({ ...prev, rsvpDetails: e.target.value }))}
                    rows={2}
                    placeholder="Merci de confirmer votre présence"
                  />
                ) : (
                  <span>{invitation.rsvpDetails || 'Non spécifié'}</span>
                )}
              </div>
              
              <div className={styles.infoItem}>
                <label>Texte formulaire RSVP</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.rsvpForm}
                    onChange={(e) => setFormData(prev => ({ ...prev, rsvpForm: e.target.value }))}
                    placeholder="RSVP requis"
                  />
                ) : (
                  <span>{invitation.rsvpForm || 'Non spécifié'}</span>
                )}
              </div>
              
              <div className={styles.infoItem}>
                <label>Code vestimentaire</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.dressCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, dressCode: e.target.value }))}
                    placeholder="Tenue de soirée souhaitée"
                  />
                ) : (
                  <span>{invitation.dressCode || 'Non spécifié'}</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.infoCard}>
            <h3>Informations complémentaires</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Informations supplémentaires</label>
                {isEditing ? (
                  <textarea
                    value={formData.moreInfo}
                    onChange={(e) => setFormData(prev => ({ ...prev, moreInfo: e.target.value }))}
                    rows={3}
                    placeholder="Détails sur la cérémonie, le transport, l'hébergement..."
                  />
                ) : (
                  <span>{invitation.moreInfo || 'Aucune'}</span>
                )}
              </div>
              
              <div className={styles.infoItem}>
                <label>Informations de contact</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                    placeholder="marie.pierre@email.com ou 06 12 34 56 78"
                  />
                ) : (
                  <span>{invitation.contact || 'Non spécifié'}</span>
                )}
              </div>
            </div>
          </div>

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