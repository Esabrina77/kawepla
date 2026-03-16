'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HeaderMobile } from '@/components/HeaderMobile';
import { useInvitations } from '@/hooks/useInvitations';
import { useDesigns } from '@/hooks/useDesigns';
import { stripeApi } from '@/lib/api/stripe';
import { Plus, Eye, Edit, Mail, X, CalendarRange, Palette, Save } from 'lucide-react';
import styles from './invitations.module.css';
import DesignPreview from '@/components/DesignPreview';
import { useToast } from '@/components/ui/toast';

// Valeurs par défaut pour les champs optionnels
const getDefaultFormData = () => ({
  eventTitle: '',
  eventDate: '',
  eventTime: '15:00',
  location: '',
  eventType: 'WEDDING' as const,
  customText: 'Vous êtes cordialement invités à célébrer avec nous',
  moreInfo: 'Informations complémentaires',
  designId: ''
});

export default function InvitationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { invitations, loading: loadingInvitations, createInvitation } = useInvitations();
  const { designs } = useDesigns();
  const [limits, setLimits] = useState<{ usage: any; limits: any } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState(getDefaultFormData());
  const [creating, setCreating] = useState(false);

  // Charger les limites
  useEffect(() => {
    const loadLimits = async () => {
      try {
        const limitsData = await stripeApi.getUserLimitsAndUsage();
        setLimits(limitsData);
      } catch (error) {
        console.error('Erreur chargement limites:', error);
      }
    };
    loadLimits();
  }, []);

  // Détecter le designId dans l'URL et ouvrir le formulaire
  useEffect(() => {
    const designId = searchParams?.get('designId');
    if (designId) {
      setFormData(prev => ({ ...prev, designId }));
      setShowCreateForm(true);
      // Nettoyer l'URL
      router.replace('/client/invitations', { scroll: false });
    }
  }, [searchParams, router]);

  const handleCreateInvitation = () => {
    router.push('/client/design?tab=personal');
  };

  const handleViewInvitation = (invitationId: string) => {
    router.push(`/client/invitations/${invitationId}`);
  };

  const handleEditInvitation = (invitationId: string) => {
    router.push(`/client/invitations/${invitationId}/edit`);
  };

  const getEventTypeLabel = (eventType?: string) => {
    if (!eventType) return 'Événement';
    const types: Record<string, string> = {
      'WEDDING': 'Mariage',
      'BIRTHDAY': 'Anniversaire',
      'BAPTISM': 'Baptême',
      'ANNIVERSARY': 'Anniversaire de mariage',
      'GRADUATION': 'Remise de diplôme',
      'BABY_SHOWER': 'Baby shower',
      'CORPORATE': 'Événement d\'entreprise',
      'OTHER': 'Autre'
    };
    return types[eventType] || eventType;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDesignName = (designId?: string) => {
    if (!designId) return 'Design inconnu';
    const design = designs.find(d => d.id === designId);
    return design ? design.name : 'Design inconnu';
  };

  // Obtenir le design sélectionné pour la prévisualisation
  const selectedDesign = designs.find(d => d.id === formData.designId);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.eventTitle || !formData.eventDate || !formData.location || !formData.designId) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez remplir tous les champs obligatoires et sélectionner un design'
      });
      return;
    }

    // Vérifier les limites
    if (limits && limits.usage?.invitations >= limits.limits?.invitations) {
      addToast({
        type: 'error',
        title: 'Limite atteinte',
        message: 'Vous avez atteint la limite d\'invitations pour votre abonnement.'
      });
      return;
    }

    setCreating(true);
    try {
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

      const result = await createInvitation(dataToSend);
      if (result) {
        setShowCreateForm(false);
        setFormData(getDefaultFormData());
        // Rafraîchir la liste des invitations
        router.refresh();
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: `Erreur lors de la création : ${error.message || 'Une erreur est survenue'}`
      });
    } finally {
      setCreating(false);
    }
  };

  // Calculer le pourcentage pour la barre de progression
  const invitationsPercent = limits ? Math.min(100, (limits.usage?.invitations || 0) / (limits.limits?.invitations || 1) * 100) : 0;

  // Vérifier si la limite est atteinte
  const isLimitReached = limits && limits.usage?.invitations >= limits.limits?.invitations;

  if (loadingInvitations) {
    return (
      <div className={styles.invitationsPage}>
        <HeaderMobile title="Vos événements" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
            <div className={styles.loadingSpinner}></div>
            <p>Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.invitationsPage}>
      <HeaderMobile title="Vos événements" />

      <div className={styles.pageContent}>
        {/* Section Header: Limit info + Create button */}
        <div className={styles.sectionHeader}>
          <div>
            {limits && (
              <p className={styles.limitsLabel}>
                Quota : {limits.usage?.invitations || 0} / {limits.limits?.invitations || 0} utilisés
              </p>
            )}
          </div>
          {!showCreateForm && !isLimitReached && (
            <button
              className={styles.createButton}
              onClick={handleCreateInvitation}
            >
              <Plus size={16} />
              Nouveau
            </button>
          )}
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className={styles.createFormContainer}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Créer un nouvel évènement</h2>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData(getDefaultFormData());
                }}
                className={styles.closeFormButton}
                disabled={creating}
              >
                <X size={24} />
              </button>
            </div>

            <div className={styles.formWithPreview}>
              {/* Formulaire */}
              <div className={styles.formSection}>
                <form onSubmit={handleFormSubmit} className={styles.createForm}>
                  {/* Type d'événement */}
                  <div className={styles.formGroup}>
                    <h3>Type d'événement *</h3>
                    <div className={styles.formField}>
                      <select
                        value={formData.eventType}
                        onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value as any }))}
                        className={styles.formSelect}
                        required >
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

                  {/* Titre de l'événement */}
                  <div className={styles.formGroup}>
                    <h3>1. Titre de l'événement *</h3>
                    <div className={styles.formField}>
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

                  {/* Message personnalisé */}
                  <div className={styles.formGroup}>
                    <h3>2. Message personnalisé (optionnel)</h3>
                    <div className={styles.formField}>
                      <textarea
                        value={formData.customText}
                        onChange={(e) => setFormData(prev => ({ ...prev, customText: e.target.value }))}
                        className={styles.formTextarea}
                        placeholder="Ex: Vous êtes cordialement invités à célébrer avec nous..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Date et heure */}
                  <div className={styles.formGroup}>
                    <h3>3. Date et heure *</h3>
                    <div className={styles.formRow}>
                      <div className={styles.formField}>
                        <label className={styles.formLabel}>Date</label>
                        <input
                          type="date"
                          value={formData.eventDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                          className={styles.formInput}
                          required
                        />
                      </div>
                      <div className={styles.formField}>
                        <label className={styles.formLabel}> Heure </label>
                        <input
                          type="time"
                          value={formData.eventTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, eventTime: e.target.value }))}
                          className={styles.formInput}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lieu */}
                  <div className={styles.formGroup}>
                    <h3>4. Lieu de l'événement *</h3>
                    <div className={styles.formField}>
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

                  {/* Informations complémentaires */}
                  <div className={styles.formGroup}>
                    <h3>5. Détails supplémentaires (optionnel) </h3>
                    <div className={styles.formField}>
                      <textarea
                        value={formData.moreInfo}
                        onChange={(e) => setFormData(prev => ({ ...prev, moreInfo: e.target.value }))}
                        className={styles.formTextarea}
                        placeholder="Ex: Tenue élégante souhaitée. Parking disponible. Contact: marie@email.com"
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Design sélectionné - Affichage uniquement si aucun design */}
                  {!formData.designId && (
                    <div className={styles.formGroup}>
                      <div className={styles.formField}>
                        <label className={styles.formLabel}>Design *</label>
                        <p className={styles.formHelp}>
                          Veuillez sélectionner un design pour continuer
                        </p>
                        <button
                          type="button"
                          onClick={() => router.push('/client/design?tab=personal')}
                          className={styles.selectDesignButton}
                        >
                          <Palette size={18} />
                          Choisir un design
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Prévisualisation */}
              {formData.designId && selectedDesign && (
                <div className={styles.previewSection}>
                  <DesignPreview
                    design={selectedDesign}
                    width={500}
                    height={700}
                  />
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData(getDefaultFormData());
                }}
                className={styles.cancelButton}
                disabled={creating}
              >
                <X size={18} />
                Annuler
              </button>
              <button
                type="submit"
                onClick={handleFormSubmit}
                className={styles.submitButton}
                disabled={creating || !formData.eventTitle || !formData.eventDate || !formData.location || !formData.designId}
              >
                <Save size={18} />
                {creating ? 'Création...' : 'Créer l\'invitation'}
              </button>
            </div>
          </div>
        )}

        {/* Invitations Grid - Masqué quand le formulaire est ouvert */}
        {!showCreateForm && (
          <>
            {invitations.length === 0 ? (
              <div className={styles.emptyState}>
                <Mail size={80} />
                <h3>Aucune invitation créée</h3>
                <p>Commencez par créer votre première invitation pour la partager avec vos contacts.</p>
                {!isLimitReached && (
                  <button
                    className={styles.emptyStateButton}
                    onClick={handleCreateInvitation}
                  >
                    <Plus size={20} />
                    <span>Créer une invitation</span>
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.invitationsGrid} role="list" aria-label="Liste de vos invitations">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className={styles.invitationCard} role="listitem">
                    {/* Image Preview */}
                    <div className={styles.invitationImageWrapper}>
                      {/* Utiliser DesignPreview pour l'image de l'invitation */}
                      {invitation.designId && designs.find(d => d.id === invitation.designId) ? (
                        <DesignPreview
                          design={designs.find(d => d.id === invitation.designId)!}
                          width={300}
                          height={225} // Aspect ratio 4:3
                        />
                      ) : (
                        <div className={styles.invitationImage} style={{
                          background: 'linear-gradient(135deg, var(--luxury-champagne-gold), var(--luxury-rose-quartz))'
                        }} />
                      )}
                      <span className={`${styles.statusBadge} ${styles[invitation.status === 'PUBLISHED' ? 'published' : 'draft']}`}>
                        {invitation.status === 'PUBLISHED' ? 'Publiée' : 'Brouillon'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className={styles.invitationContent}>
                      <span className={styles.invitationType}>
                        {getEventTypeLabel(invitation.eventType)}
                      </span>
                      <h3 className={styles.invitationTitle}>
                        {invitation.eventTitle}
                      </h3>
                      <p className={styles.invitationDetail}>
                        Design : {getDesignName(invitation.designId)}
                      </p>
                      {invitation.eventDate && (
                        <p className={styles.invitationDetail}>
                          {formatDate(invitation.eventDate)}
                        </p>
                      )}

                      {/* Actions */}
                      <div className={styles.invitationActions}>
                        <button
                          className={`${styles.invitationActionButton} ${styles.view}`}
                          onClick={() => handleViewInvitation(invitation.id)}
                          aria-label={`Voir l'invitation ${invitation.eventTitle}`}
                        >
                          Voir
                        </button>
                        {invitation.status !== 'PUBLISHED' && (
                          <button
                            className={`${styles.invitationActionButton} ${styles.edit}`}
                            onClick={() => handleEditInvitation(invitation.id)}
                            aria-label={`Modifier l'invitation ${invitation.eventTitle}`}
                          >
                            Modifier
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
