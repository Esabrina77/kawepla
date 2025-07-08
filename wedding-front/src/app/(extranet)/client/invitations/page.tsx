'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInvitations, CreateInvitationData } from '@/hooks/useInvitations';
import { useDesigns } from '@/hooks/useDesigns';
import { useAuth } from '@/hooks/useAuth';
import { TemplateEngine } from '@/lib/templateEngine';
import { mergeTemplateData } from '@/lib/templateEngine';
import { SubscriptionLimits, canCreateInvitation } from '@/components/SubscriptionLimits/SubscriptionLimits';
import styles from './invitations.module.css';

export default function InvitationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { invitations, loading, error, createInvitation, updateInvitation, publishInvitation } = useInvitations();
  const { designs } = useDesigns();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDesignId, setSelectedDesignId] = useState<string>('');
  const [formData, setFormData] = useState({
    coupleName: '',
    weddingDate: '',
    ceremonyTime: '',
    receptionTime: '',
    rsvpDate: '',
    venueName: '',
    venueAddress: '',
    invitationText: 'Vous êtes cordialement invités',
    designId: '',
    message: 'Votre présence sera notre plus beau cadeau',
    blessingText: 'Avec leurs familles',
    welcomeMessage: 'Bienvenue à notre mariage',
    rsvpDetails: 'Merci de confirmer votre présence',
    rsvpForm: 'RSVP requis',
    dressCode: 'Tenue de soirée souhaitée',
    moreInfo: '',
    contact: ''
  });

  // Vérifier si l'utilisateur peut créer une invitation
  const canCreate = canCreateInvitation(user, invitations);

  // Vérifier si l'utilisateur a sélectionné un design
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const designId = urlParams.get('designId');
    if (designId) {
      setSelectedDesignId(designId);
      setFormData(prev => ({ ...prev, designId }));
      setShowCreateForm(true);
    }
  }, []);

  // Obtenir le design sélectionné pour la prévisualisation
  const selectedDesign = designs.find(d => d.id === formData.designId);

  // Générer la prévisualisation en temps réel
  const getPreviewHtml = () => {
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

      console.log('Template data pour preview:', templateData);
      console.log('Selected design:', selectedDesign);

      return new TemplateEngine().render(selectedDesign, templateData);
    } catch (error) {
      console.error('Erreur lors de la génération de la prévisualisation:', error);
      return '<div>Erreur de prévisualisation</div>';
    }
  };

  const handleCreateInvitation = () => {
    if (!canCreate) {
      alert('Vous avez atteint la limite d\'invitations pour votre abonnement gratuit.');
      return;
    }

    if (designs.length === 0) {
      alert('Aucun design disponible. Veuillez d\'abord créer ou importer des designs.');
      return;
    }

    if (!selectedDesignId) {
      // Rediriger vers la page des designs
      router.push('/client/design?returnTo=invitations');
      return;
    }

    setShowCreateForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.designId) {
      alert('Veuillez sélectionner un design');
      return;
    }

    // Préparer les données pour l'API backend
    const dataToSend: any = {
      coupleName: formData.coupleName,
      weddingDate: formData.weddingDate,
      venueName: formData.venueName,
      venueAddress: formData.venueAddress,
      designId: formData.designId
    };

    // Ajouter les champs optionnels seulement s'ils ont une valeur
    if (formData.ceremonyTime) dataToSend.ceremonyTime = formData.ceremonyTime;
    if (formData.receptionTime) dataToSend.receptionTime = formData.receptionTime;
    if (formData.invitationText) dataToSend.invitationText = formData.invitationText;
    if (formData.moreInfo) dataToSend.moreInfo = formData.moreInfo;
    if (formData.rsvpDetails) dataToSend.rsvpDetails = formData.rsvpDetails;
    if (formData.rsvpForm) dataToSend.rsvpForm = formData.rsvpForm;
    if (formData.rsvpDate) dataToSend.rsvpDate = formData.rsvpDate;
    if (formData.message) dataToSend.message = formData.message;
    if (formData.blessingText) dataToSend.blessingText = formData.blessingText;
    if (formData.welcomeMessage) dataToSend.welcomeMessage = formData.welcomeMessage;
    if (formData.dressCode) dataToSend.dressCode = formData.dressCode;
    if (formData.contact) dataToSend.contact = formData.contact;

    console.log('Données envoyées:', dataToSend);

    const result = await createInvitation(dataToSend);
    if (result) {
      setShowCreateForm(false);
      setFormData({
        coupleName: '',
        weddingDate: '',
        ceremonyTime: '',
        receptionTime: '',
        rsvpDate: '',
        venueName: '',
        venueAddress: '',
        invitationText: 'Vous êtes cordialement invités',
        designId: '',
        message: 'Votre présence sera notre plus beau cadeau',
        blessingText: 'Avec leurs familles',
        welcomeMessage: 'Bienvenue à notre mariage',
        rsvpDetails: 'Merci de confirmer votre présence',
        rsvpForm: 'RSVP requis',
        dressCode: 'Tenue de soirée souhaitée',
        moreInfo: '',
        contact: ''
      });
      alert('Invitation créée avec succès !');
    }
  };

  const handlePublish = async (id: string) => {
    const result = await publishInvitation(id);
    if (result) {
      alert('Invitation publiée avec succès !');
    }
  };

  const getDesignName = (designId: string) => {
    const design = designs.find(d => d.id === designId);
    return design ? design.name : 'Design inconnu';
  };

  const getStatusInFrench = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DRAFT':
        return 'Brouillon';
      case 'PUBLISHED':
        return 'Publiée';
      case 'ARCHIVED':
        return 'Archivée';
      default:
        return status;
    }
  };

  if (loading) {
    return <div className={styles.loading}>Chargement des invitations...</div>;
  }

  if (error) {
    return <div className={styles.error}>Erreur: {error}</div>;
  }

  return (
    <div className={styles.invitationsPage}>
      <div className={styles.header}>
        <h1>Mes Invitations</h1>
        {canCreate && (
          <button 
            className={styles.createButton}
            onClick={handleCreateInvitation}
          >
            Créer une invitation
          </button>
        )}
      </div>
      
      {/* Affichage des limites d'abonnement */}
      <SubscriptionLimits />
      
      {invitations.length === 0 && !showCreateForm ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📝</div>
          <h2>Aucune invitation créée</h2>
          <p>Commencez par créer votre première invitation de mariage</p>
          {canCreate && (
            <button 
              className={styles.createButtonLarge}
              onClick={handleCreateInvitation}
            >
              Créer ma première invitation
            </button>
          )}
        </div>
      ) : (
        <div className={styles.invitationsGrid}>
          {invitations.map((invitation) => (
            <div key={invitation.id} className={styles.invitationCard}>
              <div className={styles.cardHeader}>
                <h3>{invitation.coupleName}</h3>
                <span className={`${styles.status} ${styles[invitation.status.toLowerCase()]}`}>
                  {getStatusInFrench(invitation.status)}
                </span>
              </div>
              
              <div className={styles.cardContent}>
                <div className={styles.detail}>
                  <strong>Date:</strong> {new Date(invitation.weddingDate).toLocaleDateString('fr-FR')}
                </div>
                <div className={styles.detail}>
                  <strong>Lieu:</strong> {invitation.venueName}
                </div>
                <div className={styles.detail}>
                  <strong>Adresse:</strong> {invitation.venueAddress}
                </div>
                <div className={styles.detail}>
                  <strong>Design:</strong> {getDesignName(invitation.designId)}
                </div>
              </div>

              <div className={styles.cardActions}>
                <button 
                  className={styles.editButton}
                  onClick={() => router.push(`/client/invitations/${invitation.id}`)}
                >
                  Voir détails
                </button>
                <button 
                  className={styles.viewButton}
                  onClick={() => router.push(`/client/invitations/${invitation.id}/preview`)}
                >
                  Aperçu
                </button>
                {invitation.status === 'DRAFT' && (
                  <button 
                    className={styles.publishButton}
                    onClick={() => handlePublish(invitation.id)}
                  >
                    Publier
                  </button>
                )}
              </div>
          </div>
      ))}
    </div>
      )}

      {/* Formulaire de création avec prévisualisation */}
      {showCreateForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Créer une nouvelle invitation</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.formWithPreview}>
              {/* Formulaire */}
              <div className={styles.formSection}>
                <form onSubmit={handleFormSubmit} className={styles.form}>
                  {/* Informations du couple */}
                  <div className={styles.formGroup}>
                    <h3>Informations du couple</h3>
                    <div className={styles.formField}>
                      <label htmlFor="coupleName" className="required">Nom du couple</label>
          <input
            type="text"
                        id="coupleName"
                        value={formData.coupleName}
                        onChange={(e) => setFormData(prev => ({ ...prev, coupleName: e.target.value }))}
                        required
                        placeholder="Marie & Pierre"
                      />
                    </div>
                  </div>

                  {/* Date et heure */}
                  <div className={styles.formGroup}>
                    <h3>Date et heure</h3>
                    <div className={styles.formRow}>
                      <div className={styles.formField}>
                        <label htmlFor="weddingDate" className="required">Date du mariage</label>
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
                          placeholder="15:00"
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
                          placeholder="18:00"
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

                  {/* Lieu */}
                  <div className={styles.formGroup}>
                    <h3>Lieu de la cérémonie</h3>
                    <div className={styles.formField}>
                      <label htmlFor="venueName" className="required">Nom du lieu</label>
          <input
            type="text"
                        id="venueName"
                        value={formData.venueName}
                        onChange={(e) => setFormData(prev => ({ ...prev, venueName: e.target.value }))}
                        required
                        placeholder="Château de Versailles"
          />
        </div>
                    <div className={styles.formField}>
                      <label htmlFor="venueAddress" className="required">Adresse complète</label>
          <input
            type="text"
                        id="venueAddress"
                        value={formData.venueAddress}
                        onChange={(e) => setFormData(prev => ({ ...prev, venueAddress: e.target.value }))}
                        required
                        placeholder="Place d'Armes, 78000 Versailles"
          />
        </div>
      </div>

                  {/* Textes d'invitation */}
                  <div className={styles.formGroup}>
                    <h3>Textes d'invitation</h3>
                    <div className={styles.formField}>
                      <label htmlFor="invitationText">Texte d'invitation principal</label>
        <input
                        type="text"
                        id="invitationText"
                        value={formData.invitationText}
                        onChange={(e) => setFormData(prev => ({ ...prev, invitationText: e.target.value }))}
                        placeholder="Vous êtes cordialement invités à célébrer notre union"
                      />
                    </div>
                  </div>

                  {/* Messages personnalisés */}
                  <div className={styles.formGroup}>
                    <h3>Messages personnalisés</h3>
                    <div className={styles.formRow}>
                      <div className={styles.formField}>
                        <label htmlFor="message">Message principal</label>
                        <textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Votre présence sera notre plus beau cadeau"
                          rows={3}
        />
      </div>
                      <div className={styles.formField}>
                        <label htmlFor="blessingText">Texte de bénédiction</label>
          <input
            type="text"
                          id="blessingText"
                          value={formData.blessingText}
                          onChange={(e) => setFormData(prev => ({ ...prev, blessingText: e.target.value }))}
                          placeholder="Avec leurs familles"
                        />
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formField}>
                        <label htmlFor="welcomeMessage">Message de bienvenue</label>
          <input
            type="text"
                          id="welcomeMessage"
                          value={formData.welcomeMessage}
                          onChange={(e) => setFormData(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                          placeholder="Bienvenue à notre mariage"
                        />
                      </div>
                      <div className={styles.formField}>
                        <label htmlFor="dressCode">Code vestimentaire</label>
            <input
              type="text"
                          id="dressCode"
                          value={formData.dressCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, dressCode: e.target.value }))}
                          placeholder="Tenue de soirée souhaitée"
                        />
                      </div>
                    </div>
                  </div>

                  {/* RSVP et contact */}
                  <div className={styles.formGroup}>
                    <h3>RSVP et contact</h3>
                    <div className={styles.formRow}>
                      <div className={styles.formField}>
                        <label htmlFor="rsvpDetails">Instructions RSVP</label>
                        <textarea
                          id="rsvpDetails"
                          value={formData.rsvpDetails}
                          onChange={(e) => setFormData(prev => ({ ...prev, rsvpDetails: e.target.value }))}
                          placeholder="Merci de confirmer votre présence avant le..."
                          rows={2}
                        />
                      </div>
                      <div className={styles.formField}>
                        <label htmlFor="contact">Contact</label>
            <input
              type="text"
                          id="contact"
                          value={formData.contact}
                          onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                          placeholder="marie.pierre@email.com ou 06 12 34 56 78"
            />
          </div>
        </div>
      </div>

                  {/* Informations supplémentaires */}
                  <div className={styles.formGroup}>
                    <h3>Informations supplémentaires</h3>
                    <div className={styles.formField}>
                      <label htmlFor="moreInfo">Détails complémentaires</label>
        <textarea
                        id="moreInfo"
                        value={formData.moreInfo}
                        onChange={(e) => setFormData(prev => ({ ...prev, moreInfo: e.target.value }))}
                        placeholder="Informations sur l'hébergement, le transport, le programme..."
                        rows={3}
        />
      </div>
                  </div>

                  {/* Design */}
                  <div className={styles.formGroup}>
                    <h3>Choix du design</h3>
                    <div className={styles.formField}>
                      <label htmlFor="designId" className="required">Design de l'invitation</label>
                      <div className={styles.designSelector}>
                        {designs.map(design => (
                          <div
                            key={design.id}
                            className={`${styles.designOption} ${formData.designId === design.id ? styles.selected : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, designId: design.id }))}
                          >
                            <h4>{design.name}</h4>
                            <p>{design.description || 'Design élégant'}</p>
                          </div>
                        ))}
                      </div>
                      {designs.length === 0 && (
                        <p style={{ color: '#6c757d', fontStyle: 'italic', marginTop: '0.5rem' }}>
                          Aucun design disponible. Veuillez contacter l'administrateur.
                        </p>
                      )}
                    </div>
                  </div>
    </form>
              </div>

              {/* Prévisualisation */}
              <div className={styles.previewSection}>
                <h3>Aperçu en temps réel</h3>
                <div className={styles.previewContainer}>
                  {selectedDesign ? (
                    <div 
                      className={styles.preview}
                      dangerouslySetInnerHTML={{
                        __html: getPreviewHtml()
                      }}
                    />
                  ) : (
                    <div className={styles.previewPlaceholder}>
                      <p>Sélectionnez un design pour voir l'aperçu</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Actions du formulaire */}
            <div className={styles.formActions}>
              <button type="button" onClick={() => setShowCreateForm(false)}>
                Annuler
              </button>
              <button 
                type="submit" 
                className={styles.submitButton}
                onClick={handleFormSubmit}
                disabled={!formData.coupleName || !formData.weddingDate || !formData.venueName || !formData.venueAddress || !formData.designId}
              >
                Créer l'invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 