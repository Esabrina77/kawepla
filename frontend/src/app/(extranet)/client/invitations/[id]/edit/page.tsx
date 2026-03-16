'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { HeaderMobile } from '@/components/HeaderMobile';
import { useInvitations } from '@/hooks/useInvitations';
import { useDesigns } from '@/hooks/useDesigns';
import DesignPreview from '@/components/DesignPreview';
import {
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Palette
} from 'lucide-react';
import styles from './edit.module.css';

export default function InvitationEditPage() {
  const params = useParams();
  const router = useRouter();
  const { getInvitationById, updateInvitation, loading } = useInvitations();
  const { designs } = useDesigns();

  const [invitation, setInvitation] = useState<any>(null);
  const [modal, setModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
  }>({
    show: false,
    title: '',
    message: '',
    type: 'error'
  });
  const [showDesignModal, setShowDesignModal] = useState(false);

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

  const showModalFn = (title: string, message: string, type: 'success' | 'error' | 'warning' = 'error') => {
    setModal({ show: true, title, message, type });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, show: false }));
  };

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invitation) return;

    if (!formData.eventTitle.trim()) {
      showModalFn('Erreur de validation', 'Le titre de l\'événement est obligatoire');
      return;
    }

    if (!formData.eventDate) {
      showModalFn('Erreur de validation', 'La date de l\'événement est obligatoire');
      return;
    }

    if (!formData.location.trim()) {
      showModalFn('Erreur de validation', 'Le lieu de l\'événement est obligatoire');
      return;
    }

    const dataToSend = {
      eventTitle: formData.eventTitle,
      eventDate: formData.eventDate,
      eventTime: formData.eventTime || undefined,
      location: formData.location,
      eventType: formData.eventType,
      customText: formData.customText || undefined,
      moreInfo: formData.moreInfo || undefined,
      designId: invitation.designId
    };

    try {
      const result = await updateInvitation(invitation.id, dataToSend);
      if (result) {
        showModalFn('Succès', 'Événement mis à jour avec succès !', 'success');
        setTimeout(() => {
          router.push(`/client/invitations/${invitation.id}`);
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';

      if (errorMessage.includes('publiée') || errorMessage.includes('published')) {
        showModalFn('Événement publié',
          'Cet événement a déjà été publié et ne peut plus être modifié.\n\n' +
          'Pour le modifier, vous devez d\'abord le dépublier.',
          'warning'
        );
      } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        showModalFn('Erreur de permission', 'Vous n\'avez pas les permissions pour modifier cet événement.');
      } else if (errorMessage.includes('not found') || errorMessage.includes('introuvable')) {
        showModalFn('Événement introuvable', 'Cet événement n\'existe plus ou a été supprimé.');
      } else {
        showModalFn('Erreur', `Erreur lors de la mise à jour : ${errorMessage}`);
      }
    }
  };

  const getSelectedDesign = () => {
    if (!invitation) return null;
    return designs.find(d => d.id === invitation.designId);
  };

  const handleDesignSelect = (designId: string) => {
    setInvitation((prev: any) => ({ ...prev, designId }));
    setShowDesignModal(false);
  };

  const userDesigns = designs.filter(d => !d.isTemplate);

  if (loading) {
    return (
      <div className={styles.editPage}>
        <HeaderMobile title="Modifier l'événement" />
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
      <div className={styles.editPage}>
        <HeaderMobile title="Modifier l'événement" />
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <h2>Événement non trouvé</h2>
            <button onClick={() => router.push('/client/invitations')} className={styles.backButton}>
              Retour aux événements
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editPage}>
      {/* Modal feedback */}
      {modal.show && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={`${styles.modal} ${styles[modal.type]}`}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                {modal.type === 'success' && <CheckCircle size={22} />}
                {modal.type === 'error' && <AlertTriangle size={22} />}
                {modal.type === 'warning' && <AlertTriangle size={22} />}
              </div>
              <h3 className={styles.modalTitle}>{modal.title}</h3>
            </div>
            <div className={styles.modalContent}>
              <p style={{ whiteSpace: 'pre-line' }}>{modal.message}</p>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalButton} onClick={closeModal}>
                {modal.type === 'success' ? 'Continuer' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <HeaderMobile title={`Modifier — ${invitation.eventTitle || 'Événement'}`} />

      <div className={styles.pageContent}>
        <div className={styles.editContainer}>
          {/* Form */}
          <div className={styles.formSection}>
            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.formGroup}>
                <h3>Type d&apos;événement *</h3>
                <div className={styles.formField}>
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
                    <option value="CORPORATE">Événement d&apos;entreprise</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <h3>1. Titre *</h3>
                <div className={styles.formField}>
                  <input
                    type="text"
                    value={formData.eventTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventTitle: e.target.value }))}
                    className={styles.formInput}
                    placeholder="Ex: Marie & Pierre"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <h3>2. Message personnalisé</h3>
                <div className={styles.formField}>
                  <textarea
                    value={formData.customText}
                    onChange={(e) => setFormData(prev => ({ ...prev, customText: e.target.value }))}
                    className={styles.formTextarea}
                    placeholder="Vous êtes cordialement invités..."
                    rows={3}
                  />
                </div>
              </div>

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
                    <label className={styles.formLabel}>Heure</label>
                    <input
                      type="time"
                      value={formData.eventTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, eventTime: e.target.value }))}
                      className={styles.formInput}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <h3>4. Lieu *</h3>
                <div className={styles.formField}>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className={styles.formInput}
                    placeholder="Ex: Château de Versailles, 78000 Versailles"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <h3>5. Détails supplémentaires</h3>
                <div className={styles.formField}>
                  <textarea
                    value={formData.moreInfo}
                    onChange={(e) => setFormData(prev => ({ ...prev, moreInfo: e.target.value }))}
                    className={styles.formTextarea}
                    placeholder="Tenue élégante souhaitée. Parking disponible."
                    rows={4}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => router.push(`/client/invitations/${invitation.id}`)}
                >
                  <X size={16} />
                  Annuler
                </button>
                <button type="submit" className={styles.saveButton}>
                  <Save size={16} />
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>

          {/* Preview */}
          <div className={styles.previewSection}>
            <div className={styles.previewContainer}>
              {getSelectedDesign() && (
                <DesignPreview
                  design={getSelectedDesign()!}
                  width={600}
                  height={850}
                />
              )}
            </div>
            {invitation && (
              <button
                type="button"
                onClick={() => setShowDesignModal(true)}
                className={styles.changeDesignBtn}
              >
                <Palette size={16} />
                Changer de design
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Design picker modal */}
      {showDesignModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDesignModal(false)}>
          <div className={`${styles.modal} ${styles.designModal}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIcon} style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)' }}>
                <Palette size={22} />
              </div>
              <h3 className={styles.modalTitle}>Choisir un design</h3>
            </div>
            <div className={styles.modalContent}>
              <p className={styles.designModalIntro}>Sélectionnez l&apos;un de vos designs personnalisés :</p>

              {userDesigns.length === 0 ? (
                <div className={styles.emptyDesigns}>
                  <p>Vous n&apos;avez pas encore de designs personnalisés.</p>
                  <button
                    onClick={() => router.push('/client/design')}
                    className={styles.emptyDesignsBtn}
                  >
                    Créer un design
                  </button>
                </div>
              ) : (
                <div className={styles.designGrid}>
                  {userDesigns.map(design => (
                    <div
                      key={design.id}
                      onClick={() => handleDesignSelect(design.id)}
                      className={`${styles.designGridItem} ${invitation.designId === design.id ? styles.selected : ''}`}
                    >
                      <div className={styles.designGridThumb}>
                        {design.thumbnail || design.previewImage ? (
                          <img
                            src={design.thumbnail || design.previewImage}
                            alt={design.name}
                          />
                        ) : (
                          <Palette size={28} />
                        )}
                        {invitation.designId === design.id && (
                          <div className={styles.selectedBadge}>
                            <CheckCircle size={14} />
                          </div>
                        )}
                      </div>
                      <div className={styles.designGridName}>
                        {design.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.modalButton}
                onClick={() => setShowDesignModal(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}