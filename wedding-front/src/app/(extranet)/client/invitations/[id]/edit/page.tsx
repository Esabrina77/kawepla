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
  Edit,
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

  const showModal = (title: string, message: string, type: 'success' | 'error' | 'warning' = 'error') => {
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

    // Validation côté frontend
    if (!formData.eventTitle.trim()) {
      showModal('Erreur de validation', 'Le titre de l\'événement est obligatoire');
      return;
    }

    if (!formData.eventDate) {
      showModal('Erreur de validation', 'La date de l\'événement est obligatoire');
      return;
    }

    if (!formData.location.trim()) {
      showModal('Erreur de validation', 'Le lieu de l\'événement est obligatoire');
      return;
    }

    // Préparer les données pour l'API (comme dans la création)
    const dataToSend = {
      eventTitle: formData.eventTitle,
      eventDate: formData.eventDate,
      eventTime: formData.eventTime || undefined,
      location: formData.location,
      eventType: formData.eventType,
      customText: formData.customText || undefined,
      moreInfo: formData.moreInfo || undefined,
      designId: invitation.designId // Inclure l'ID du design (potentiellement modifié)
    };

    console.log('🔍 Debug update invitation - DataToSend:', dataToSend);
    console.log('🔍 Debug update invitation - Invitation ID:', invitation.id);

    try {
      const result = await updateInvitation(invitation.id, dataToSend);
      if (result) {
        showModal('Succès', 'Invitation mise à jour avec succès !', 'success');
        setTimeout(() => {
          router.push(`/client/invitations/${invitation.id}`);
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);

      // Gestion spécifique des erreurs
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';

      if (errorMessage.includes('publiée') || errorMessage.includes('published')) {
        showModal('Invitation publiée',
          'Cette invitation a déjà été publiée et ne peut plus être modifiée.\n\n' +
          'Pour modifier une invitation publiée, vous devez d\'abord la dépublier depuis la page de gestion des invitations.',
          'warning'
        );
      } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        showModal('Erreur de permission', 'Vous n\'avez pas les permissions nécessaires pour modifier cette invitation.');
      } else if (errorMessage.includes('not found') || errorMessage.includes('introuvable')) {
        showModal('Invitation introuvable', 'Cette invitation n\'existe plus ou a été supprimée.');
      } else {
        showModal('Erreur de mise à jour', `Erreur lors de la mise à jour : ${errorMessage}`);
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

  // Filtrer uniquement les designs personnalisés de l'utilisateur (pas les templates)
  // On suppose que les templates ont isTemplate=true ou que l'utilisateur a ses propres designs
  const userDesigns = designs.filter(d => !d.isTemplate);



  if (loading) {
    return (
      <div className={styles.editPage}>
        <HeaderMobile title="Modifier l'invitation" />
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
        <HeaderMobile title="Modifier l'invitation" />
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <h2>Invitation non trouvée</h2>
            <button onClick={() => router.push('/client/invitations')} className={styles.backButton}>
              Retour aux invitations
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editPage}>
      {/* Modal d'erreur/succès */}
      {modal.show && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles[modal.type]}`}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                {modal.type === 'success' && <CheckCircle size={24} />}
                {modal.type === 'error' && <AlertTriangle size={24} />}
                {modal.type === 'warning' && <AlertTriangle size={24} />}
              </div>
              <h3 className={styles.modalTitle}>{modal.title}</h3>
            </div>
            <div className={styles.modalContent}>
              <p style={{ whiteSpace: 'pre-line' }}>{modal.message}</p>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.modalButton}
                onClick={closeModal}
              >
                {modal.type === 'success' ? 'Continuer' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <HeaderMobile title={`Modifier - ${invitation.eventTitle || 'Invitation'}`} />

      <main className={styles.main}>
        <div className={styles.editContainer}>
          <div className={styles.formSection}>
            <form onSubmit={handleSave} className={styles.form}>
              {/* Type d'événement */}
              <div className={styles.formGroup}>
                <h3>Type d'événement *</h3>
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
                    <option value="CORPORATE">Événement d'entreprise</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>
              </div>

              {/* 1. Titre de l'événement (affiché en premier dans l'invitation) */}
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

              {/* 2. Texte personnalisé (affiché en deuxième dans l'invitation) */}
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

              {/* 3. Date et heure (affichées en troisième et quatrième dans l'invitation) */}
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

              {/* 4. Lieu (affiché en cinquième dans l'invitation) */}
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

              {/* 5. Informations complémentaires (affichées en dernier dans l'invitation) */}
              <div className={styles.formGroup}>
                <h3>5. Détails supplémentaires (optionnel)</h3>
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

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => router.push(`/client/invitations/${invitation.id}`)}
                >
                  <X size={18} />
                  Annuler
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                >
                  <Save size={18} />
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>

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
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowDesignModal(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#1e293b'
                  }}
                >
                  <Palette size={16} />
                  Changer de design
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de sélection de design */}
      {showDesignModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDesignModal(false)}>
          <div className={styles.modal} style={{ maxWidth: '800px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                <Palette size={24} />
              </div>
              <h3 className={styles.modalTitle}>Choisir un design</h3>
            </div>
            <div className={styles.modalContent} style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <p style={{ marginBottom: '1rem' }}>Sélectionnez l'un de vos designs personnalisés :</p>

              {userDesigns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  <p>Vous n'avez pas encore de designs personnalisés.</p>
                  <button
                    onClick={() => router.push('/client/design')}
                    style={{
                      marginTop: '1rem',
                      padding: '0.5rem 1rem',
                      background: '#000',
                      color: 'white',
                      borderRadius: '0.25rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Créer un nouveau design
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '1rem'
                }}>
                  {userDesigns.map(design => (
                    <div
                      key={design.id}
                      onClick={() => handleDesignSelect(design.id)}
                      style={{
                        border: invitation.designId === design.id ? '2px solid #000' : '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                    >
                      <div style={{ aspectRatio: '2/3', background: '#f1f5f9', position: 'relative' }}>
                        {design.thumbnail || design.previewImage ? (
                          <img
                            src={design.thumbnail || design.previewImage}
                            alt={design.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                            <Palette size={32} />
                          </div>
                        )}
                        {invitation.designId === design.id && (
                          <div style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            background: '#000',
                            color: 'white',
                            borderRadius: '50%',
                            padding: '0.25rem'
                          }}>
                            <CheckCircle size={16} />
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '0.5rem', fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}