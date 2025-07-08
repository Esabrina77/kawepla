'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInvitations } from '@/hooks/useInvitations';
import { useDesigns } from '@/hooks/useDesigns';
import { TemplateEngine, mergeTemplateData } from '@/lib/templateEngine';
import styles from './edit.module.css';

export default function InvitationEditPage() {
  const params = useParams();
  const router = useRouter();
  const { getInvitationById, updateInvitation, loading } = useInvitations();
  const { designs } = useDesigns();
  
  const [invitation, setInvitation] = useState<any>(null);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitation) return;
    
    const result = await updateInvitation(invitation.id, formData);
    if (result) {
      alert('Invitation mise à jour avec succès !');
      router.push(`/client/invitations/${invitation.id}`);
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
      // Assembler les détails complets
      const ceremonyInfo = formData.ceremonyTime ? `Cérémonie : ${formData.ceremonyTime}` : '';
      const receptionInfo = formData.receptionTime ? `Réception : ${formData.receptionTime}` : '';
      const venueInfo = formData.venueName ? `Lieu : ${formData.venueName}` : '';
      const addressInfo = formData.venueAddress ? `Adresse : ${formData.venueAddress}` : '';
      const moreInfoText = formData.moreInfo || '';
      
      // Assembler tous les détails
      const allDetails = [venueInfo, addressInfo, ceremonyInfo, receptionInfo, moreInfoText]
        .filter(Boolean)
        .join('\n');
      
      // Convertir les données du formulaire en données de template
      const templateData = mergeTemplateData({
        coupleName: formData.coupleName || 'Votre couple',
        day: formData.weddingDate ? new Date(formData.weddingDate).getDate().toString() : '15',
        month: formData.weddingDate ? new Date(formData.weddingDate).toLocaleDateString('fr-FR', { month: 'long' }) : 'Juin',
        year: formData.weddingDate ? new Date(formData.weddingDate).getFullYear().toString() : '2024',
        date: formData.weddingDate ? new Date(formData.weddingDate).toLocaleDateString('fr-FR', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }) : '15 Juin 2024',
        time: formData.ceremonyTime || '15h00',
        invitationText: formData.invitationText || 'Vous êtes cordialement invités',
        venue: formData.venueName || 'Lieu de la cérémonie',
        address: formData.venueAddress || 'Adresse du lieu',
        details: allDetails || 'Détails de la cérémonie',
        moreInfo: formData.moreInfo || '',
        rsvpDetails: formData.rsvpDetails || 'Merci de confirmer votre présence',
        rsvpForm: formData.rsvpForm || 'RSVP requis',
        rsvpDate: formData.rsvpDate ? new Date(formData.rsvpDate).toLocaleDateString('fr-FR') : '',
        message: formData.message || 'Votre présence sera notre plus beau cadeau',
        blessingText: formData.blessingText || 'Avec leurs familles',
        welcomeMessage: formData.welcomeMessage || 'Bienvenue à notre mariage',
        dressCode: formData.dressCode || 'Tenue de soirée souhaitée',
        contact: formData.contact || '',
        ceremony: formData.ceremonyTime ? `Cérémonie à ${formData.ceremonyTime}` : 'Cérémonie à 15h00',
        reception: formData.receptionTime ? `Réception à ${formData.receptionTime}` : 'Réception à 18h00'
      });

      return new TemplateEngine().render(selectedDesign, templateData);
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
    <div className={styles.editPage}>
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => router.push(`/client/invitations/${invitation.id}`)}
        >
          ← Retour
        </button>
        <h1>Modifier l'invitation - {invitation.coupleName}</h1>
      </div>

      <div className={styles.editContainer}>
        <div className={styles.formSection}>
          <form onSubmit={handleSave} className={styles.form}>
            <div className={styles.formGroup}>
              <h3>Informations du couple</h3>
              <label htmlFor="coupleName">Nom du couple *</label>
              <input
                type="text"
                id="coupleName"
                value={formData.coupleName}
                onChange={(e) => setFormData(prev => ({ ...prev, coupleName: e.target.value }))}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <h3>Date et heure</h3>
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label htmlFor="weddingDate">Date du mariage *</label>
                  <input
                    type="date"
                    id="weddingDate"
                    value={formData.weddingDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, weddingDate: e.target.value }))}
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="ceremonyTime">Heure de cérémonie</label>
                  <input
                    type="time"
                    id="ceremonyTime"
                    value={formData.ceremonyTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, ceremonyTime: e.target.value }))}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label htmlFor="receptionTime">Heure de réception</label>
                  <input
                    type="time"
                    id="receptionTime"
                    value={formData.receptionTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, receptionTime: e.target.value }))}
                  />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="rsvpDate">Date limite RSVP</label>
                  <input
                    type="date"
                    id="rsvpDate"
                    value={formData.rsvpDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, rsvpDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <h3>Lieu</h3>
              <label htmlFor="venueName">Nom du lieu *</label>
              <input
                type="text"
                id="venueName"
                value={formData.venueName}
                onChange={(e) => setFormData(prev => ({ ...prev, venueName: e.target.value }))}
                required
              />
              <label htmlFor="venueAddress">Adresse *</label>
              <input
                type="text"
                id="venueAddress"
                value={formData.venueAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, venueAddress: e.target.value }))}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <h3>Messages personnalisés</h3>
              <label htmlFor="invitationText">Texte d'invitation</label>
              <textarea
                id="invitationText"
                value={formData.invitationText}
                onChange={(e) => setFormData(prev => ({ ...prev, invitationText: e.target.value }))}
                rows={2}
              />
              <label htmlFor="message">Message principal</label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
              />
              <label htmlFor="moreInfo">Informations supplémentaires</label>
              <textarea
                id="moreInfo"
                value={formData.moreInfo}
                onChange={(e) => setFormData(prev => ({ ...prev, moreInfo: e.target.value }))}
                rows={3}
              />
              <label htmlFor="contact">Contact</label>
              <input
                type="text"
                id="contact"
                value={formData.contact}
                onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
              />
            </div>

            <div className={styles.formActions}>
              <button 
                type="button"
                className={styles.cancelButton}
                onClick={() => router.push(`/client/invitations/${invitation.id}`)}
              >
                Annuler
              </button>
              <button 
                type="submit"
                className={styles.saveButton}
              >
                Sauvegarder
              </button>
            </div>
          </form>
        </div>

        <div className={styles.previewSection}>
          <div className={styles.previewContainer}>
            <h3>Aperçu en temps réel</h3>
            <div 
              className={styles.previewContent}
              dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 