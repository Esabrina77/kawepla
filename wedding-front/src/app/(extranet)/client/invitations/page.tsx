'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInvitations } from '@/hooks/useInvitations';
import { useDesigns } from '@/hooks/useDesigns';
import { useAuth } from '@/hooks/useAuth';
import { TemplateEngine } from '@/lib/templateEngine';
import { mergeInvitationData } from '@/lib/templateEngine';
import { LimitsIndicator } from '@/components/LimitsIndicator/LimitsIndicator';
import { useInvitationLimits } from '@/hooks/useInvitationLimits';
import { 
  CalendarRange, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Share2, 
  CheckCircle, 
  Clock,
  Palette,
  Users,
  Mail
} from 'lucide-react';
import styles from './invitations.module.css';

// Valeurs par défaut pour les champs optionnels
const getDefaultFormData = () => ({
  eventTitle: '',
  eventDate: '',
  eventTime: '15:00',
  location: '',
  eventType: 'event' as const,
  customText: 'Vous êtes cordialement invités à célébrer avec nous',
  moreInfo: 'Informations complémentaires',
  designId: ''
});

export default function InvitationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { invitations, loading, error, createInvitation, updateInvitation, publishInvitation } = useInvitations();
  const { designs } = useDesigns();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDesignId, setSelectedDesignId] = useState<string>('');
  // NOUVELLE ARCHITECTURE SIMPLIFIÉE
  const [formData, setFormData] = useState(getDefaultFormData());

  // Vérifier si l'utilisateur peut créer une invitation
  const { canCreateInvitation: canCreateInvitationFn, loading: limitsLoading } = useInvitationLimits();
  const canCreate = canCreateInvitationFn();

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

  // Générer la prévisualisation en temps réel (NOUVELLE ARCHITECTURE)
  const getPreviewHtml = () => {
    if (!selectedDesign || !selectedDesign.template) return '';
    
    try {
      // Convertir les données du formulaire en données de template (nouvelle structure)
      const templateData = mergeInvitationData({
        eventTitle: formData.eventTitle || 'Votre Événement',
        eventDate: formData.eventDate ? new Date(formData.eventDate) : new Date('2024-06-15T15:00:00'),
        eventTime: formData.eventTime || '15:00',
        location: formData.location || 'Lieu de l\'événement',
        eventType: formData.eventType || 'event',
        customText: formData.customText, // Utiliser directement la valeur du formulaire (pré-remplie)
        moreInfo: formData.moreInfo // Utiliser directement la valeur du formulaire (pré-remplie)
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

    // Utiliser le design sélectionné via URL ou le premier design disponible
    const designToUse = selectedDesignId || designs[0]?.id;
    
    if (!designToUse) {
      // Rediriger vers la page des designs
      router.push('/client/design?returnTo=invitations');
      return;
    }

    // Définir le design dans le formulaire
    setFormData(prev => ({ ...prev, designId: designToUse }));
    setShowCreateForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.eventTitle || !formData.eventDate || !formData.location) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Préparer les données pour l'API backend (NOUVELLE ARCHITECTURE)
    const dataToSend = {
      eventTitle: formData.eventTitle,
      eventDate: formData.eventDate,
      eventTime: formData.eventTime || undefined,
      location: formData.location,
      eventType: formData.eventType,
      customText: formData.customText || undefined,
      moreInfo: formData.moreInfo || undefined,
      designId: formData.designId
    };

    console.log('Données envoyées:', dataToSend);

    const result = await createInvitation(dataToSend);
    if (result) {
      setShowCreateForm(false);
      setFormData(getDefaultFormData());
      // Suppression de l'alert pour éviter les problèmes avec les navigateurs
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

  // Fonction pour obtenir le label et la couleur du type d'événement
  const getEventTypeInfo = (eventType: string) => {
    const types = {
      'WEDDING': { label: 'Mariage', color: '#8B4B6B' },
      'BIRTHDAY': { label: 'Anniversaire', color: '#D4A574' },
      'BAPTISM': { label: 'Baptême', color: '#6B8E4B' },
      'ANNIVERSARY': { label: 'Anniversaire de mariage', color: '#B45A7D' },
      'GRADUATION': { label: 'Remise de diplôme', color: '#4A90A4' },
      'BABY_SHOWER': { label: 'Baby shower', color: '#F4A261' },
      'CORPORATE': { label: 'Événement d\'entreprise', color: '#2C5F2D' },
      'OTHER': { label: 'Autre', color: '#6C757D' }
    };
    return types[eventType as keyof typeof types] || { label: 'Inconnu', color: '#6C757D' };
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
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement des invitations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <p>Erreur: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.invitationsPage}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.badge}>
          <CalendarRange style={{ width: '16px', height: '16px' }} />
          Gestion des invitations
        </div>
        
        <h1 className={styles.title}>
          Vos <span className={styles.titleAccent}>invitations</span>
        </h1>
        
        <p className={styles.subtitle}>
          Créez et gérez vos invitations d'événements avec élégance
        </p>

        {/* Limits Indicator */}
        <LimitsIndicator />
      </div>

      {/* Create Button */}
      {!showCreateForm && canCreate && (
        <div className={styles.createButtonContainer}>
            <button 
              onClick={handleCreateInvitation}
            className={styles.createButton}
            >
            <Plus style={{ width: '20px', height: '20px' }} />
              Créer une invitation
            </button>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className={styles.createFormContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Créer une nouvelle invitation</h2>
            <button 
              onClick={() => setShowCreateForm(false)}
              className={styles.closeFormButton}
            >
              ×
            </button>
          </div>

          <div className={styles.formWithPreview}>
            {/* Formulaire */}
            <div className={styles.formSection}>
              <form onSubmit={handleFormSubmit} className={styles.createForm}>

                {/* Type d'événement */}
                <div className={styles.formGroup}>
                  <h3>Type d'événement</h3>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Type *</label>
                    <select
                      value={formData.eventType}
                      onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value as any }))}
                      className={styles.formSelect}
                      required
                    >
                      <option value="WEDDING">Mariage</option>
                      <option value="BIRTHDAY">Anniversaire</option>
                      <option value="BAPTISM">Baptême</option>
                      <option value="ANNIVERSARY">Anniversaire de mariage</option>
                      <option value="GRADUATION">Remise de diplôme</option>
                      <option value="BABY_SHOWER">Baby shower</option>
                      <option value="CORPORATE">Événement d'entreprise</option>
                      <option value="OTHER">Autre</option>
                    </select>
                  </div>
                </div>

                {/* 1. Titre de l'événement (affiché en premier dans l'invitation) */}
                <div className={styles.formGroup}>
                  <h3>1. Titre de l'événement</h3>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Titre *</label>
                    <input
                      type="text"
                      value={formData.eventTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, eventTitle: e.target.value }))}
                      className={styles.formInput}
                      placeholder="Ex: Marie & Pierre, Anniversaire de Marie, Baptême de Lucas"
                      required
                    />
                  </div>
                </div>

                {/* 2. Texte personnalisé (affiché en deuxième dans l'invitation) */}
                <div className={styles.formGroup}>
                  <h3>2. Message personnalisé</h3>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Texte d'invitation (optionnel)</label>
                    <textarea
                      value={formData.customText}
                      onChange={(e) => setFormData(prev => ({ ...prev, customText: e.target.value }))}
                      className={styles.formTextarea}
                      placeholder="Ex: Vous êtes cordialement invités à célébrer avec nous..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* 3. Date et heure (affichées en troisième et quatrième dans l'invitation) */}
                <div className={styles.formGroup}>
                  <h3>3. Date et heure</h3>
                  <div className={styles.formRow}>
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Date de l'événement *</label>
                      <input
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                        className={styles.formInput}
                        required
                      />
                    </div>
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Heure (optionnel)</label>
                      <input
                        type="time"
                        value={formData.eventTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, eventTime: e.target.value }))}
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Lieu (affiché en cinquième dans l'invitation) */}
                <div className={styles.formGroup}>
                  <h3>4. Lieu de l'événement</h3>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Lieu complet *</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className={styles.formInput}
                      placeholder="Ex: Château de Versailles, 1 Place d'Armes, 78000 Versailles"
                      required
                    />
                  </div>
                </div>

                {/* 5. Informations complémentaires (affichées en dernier dans l'invitation) */}
                <div className={styles.formGroup}>
                  <h3>5. Informations complémentaires</h3>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Détails supplémentaires (optionnel)</label>
                    <textarea
                      value={formData.moreInfo}
                      onChange={(e) => setFormData(prev => ({ ...prev, moreInfo: e.target.value }))}
                      className={styles.formTextarea}
                      placeholder="Ex: Tenue élégante souhaitée. Parking disponible. Contact: marie@email.com"
                      rows={4}
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Prévisualisation */}
            <div className={styles.previewSection}>
              <div className={styles.previewContainer}>
                {selectedDesign && formData.designId ? (
                  <div 
                    className={styles.preview}
                    dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                  />
                ) : (
                  <div className={styles.previewPlaceholder}>
                    <p>Sélectionnez un design pour voir l'aperçu</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className={styles.formActions}>
            <button type="button" onClick={() => setShowCreateForm(false)} className={styles.cancelButton}>
              Annuler
            </button>
            <button 
              type="submit" 
              onClick={handleFormSubmit}
              className={styles.submitButton}
              disabled={!formData.eventTitle || !formData.eventDate || !formData.location}
            >
              Créer l'invitation
            </button>
          </div>
        </div>
      )}
      
      {/* Invitations Grid */}
      {!showCreateForm && (
        <div className={styles.invitationsGrid}>
          {invitations.map((invitation) => (
            <div key={invitation.id} className={styles.invitationCard}>
            {/* Status Badge */}
            <div className={`${styles.statusBadge} ${invitation.status === 'PUBLISHED' ? styles.published : styles.draft}`}>
              {invitation.status === 'PUBLISHED' ? (
                <CheckCircle style={{ width: '12px', height: '12px' }} />
              ) : (
                <Clock style={{ width: '12px', height: '12px' }} />
              )}
              {invitation.status === 'PUBLISHED' ? 'Publiée' : 'Brouillon'}
            </div>

            {/* Event Type Tag */}
            <div 
              className={styles.eventTypeTag}
              style={{ 
                backgroundColor: getEventTypeInfo(invitation.eventType || 'OTHER').color + '20',
                borderColor: getEventTypeInfo(invitation.eventType || 'OTHER').color,
                color: getEventTypeInfo(invitation.eventType || 'OTHER').color
              }}
            >
              {getEventTypeInfo(invitation.eventType || 'OTHER').label}
            </div>
            
            {/* Content */}
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>
                {invitation.eventTitle || 'Invitation sans titre'}
              </h3>
              
              <div className={styles.cardDetail}>
                <Palette style={{ width: '14px', height: '14px' }} />
                {getDesignName(invitation.designId)}
              </div>

              <div className={styles.cardDetail}>
                <CalendarRange style={{ width: '14px', height: '14px' }} />
                {invitation.eventDate ? new Date(invitation.eventDate).toLocaleDateString('fr-FR') : 'Date non définie'}
              </div>
            </div>
            
            {/* Actions */}
            <div className={styles.cardActions}>
              <button
                onClick={() => router.push(`/client/invitations/${invitation.id}`)}
                className={`${styles.actionButton} ${styles.viewButton}`}
              >
                <Eye style={{ width: '16px', height: '16px' }} />
                Voir
              </button>
              
              <button 
                onClick={() => router.push(`/client/invitations/${invitation.id}/edit`)}
                className={`${styles.actionButton} ${styles.editButton}`}
              >
                <Edit style={{ width: '16px', height: '16px' }} />
                Modifier
              </button>
            </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!showCreateForm && invitations.length === 0 && (
        <div className={styles.emptyState}>
          <CalendarRange className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>Aucune invitation créée</h3>
          <p className={styles.emptyText}>Commencez par créer votre première invitation d'événement</p>
        </div>
      )}

    </div>
  );
} 