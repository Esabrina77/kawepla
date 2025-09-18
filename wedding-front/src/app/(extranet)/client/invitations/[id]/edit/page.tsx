'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInvitations } from '@/hooks/useInvitations';
import { useDesigns } from '@/hooks/useDesigns';
import { TemplateEngine } from '@/lib/templateEngine';
import { 
  CalendarRange, 
  Edit, 
  Save,
  X,
  AlertTriangle,
  CheckCircle
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
      moreInfo: formData.moreInfo || undefined
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

  const getPreviewHtml = () => {
    const selectedDesign = getSelectedDesign();
    if (!selectedDesign) return '';
    
    try {
      const templateEngine = new TemplateEngine();
      // Utiliser la NOUVELLE architecture avec les données du formulaire
      const invitationData = {
        eventTitle: formData.eventTitle || '',
        eventDate: formData.eventDate ? new Date(formData.eventDate) : new Date(),
        eventTime: formData.eventTime || '',
        location: formData.location || '',
        eventType: formData.eventType || 'event',
        customText: formData.customText || '',
        moreInfo: formData.moreInfo || ''
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

      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => router.push(`/client/invitations/${invitation.id}`)}
        >
          ← Retour
        </button>
        <h1>Modifier l'invitation - {invitation.eventTitle || 'Invitation sans titre'}</h1>
      </div>

      <div className={styles.editContainer}>
        <div className={styles.formSection}>
          <form onSubmit={handleSave} className={styles.form}>
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

            <div className={styles.formActions}>
              <button 
                type="button"
                className={styles.cancelButton}
                onClick={() => router.push(`/client/invitations/${invitation.id}`)}
              >
                <X style={{ width: '16px', height: '16px' }} />
                Annuler
              </button>
              <button 
                type="submit"
                className={styles.saveButton}
              >
                <Save style={{ width: '16px', height: '16px' }} />
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
              key={`preview-edit-${invitation?.id}-${formData.eventTitle}-${formData.eventDate}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 