'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useNewsletters } from '@/hooks/useNewsletters';
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  Users, 
  BarChart3,
  Edit,
  Send,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Play,
  Pause
} from 'lucide-react';
import styles from '../newsletters.module.css';

export default function NewsletterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const newsletterId = params.id as string;
  
  const {
    currentNewsletter,
    loading,
    error,
    fetchNewsletterById,
    sendNewsletter,
    deleteNewsletter,
    cancelNewsletter,
    clearError
  } = useNewsletters();

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (newsletterId) {
      fetchNewsletterById(newsletterId);
    }
  }, [newsletterId, fetchNewsletterById]);

  const handleSendNewsletter = async () => {
    if (!currentNewsletter) return;
    
    setActionLoading('send');
    try {
      const result = await sendNewsletter(currentNewsletter.id, true);
      if (result) {
        alert(`Newsletter envoyée avec succès à ${result.sentCount} destinataires`);
      }
    } catch (err) {
      console.error('Erreur lors de l\'envoi:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteNewsletter = async () => {
    if (!currentNewsletter) return;
    
    setActionLoading('delete');
    try {
      const success = await deleteNewsletter(currentNewsletter.id);
      if (success) {
        router.push('/super-admin/newsletters');
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    } finally {
      setActionLoading(null);
      setShowDeleteModal(false);
    }
  };

  const handleCancelNewsletter = async () => {
    if (!currentNewsletter) return;
    
    setActionLoading('cancel');
    try {
      await cancelNewsletter(currentNewsletter.id);
    } catch (err) {
      console.error('Erreur lors de l\'annulation:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Edit size={20} />;
      case 'SCHEDULED': return <Clock size={20} />;
      case 'SENDING': return <Play size={20} />;
      case 'SENT': return <CheckCircle size={20} />;
      case 'CANCELLED': return <X size={20} />;
      default: return <AlertCircle size={20} />;
    }
  };

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case 'ALL_USERS': return 'Tous les utilisateurs';
      case 'HOSTS_ONLY': return 'Organisateurs seulement';
      case 'PROVIDERS_ONLY': return 'Prestataires seulement';
      case 'ADMINS_ONLY': return 'Administrateurs seulement';
      case 'SPECIFIC_USERS': return 'Utilisateurs spécifiques';
      default: return audience;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Chargement de la newsletter...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={48} />
        <h2>Erreur</h2>
        <p>{error}</p>
        <button onClick={clearError} className={styles.retryButton}>
          Réessayer
        </button>
      </div>
    );
  }

  if (!currentNewsletter) {
    return (
      <div className={styles.errorContainer}>
        <Mail size={48} />
        <h2>Newsletter introuvable</h2>
        <p>Cette newsletter n'existe pas ou a été supprimée.</p>
        <button onClick={() => router.push('/super-admin/newsletters')} className={styles.retryButton}>
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className={styles.detailPage}>
      {/* Header */}
      <div className={styles.detailHeader}>
        <div className={styles.headerLeft}>
          <button 
            className={styles.backButton}
            onClick={() => router.push('/super-admin/newsletters')}
          >
            <ArrowLeft size={20} />
            Retour
          </button>
          <div>
            <h1>{currentNewsletter.title}</h1>
            <p>Détails de la newsletter</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          {currentNewsletter.status === 'DRAFT' && (
            <button
              className={styles.editButton}
              onClick={() => router.push(`/super-admin/newsletters/${currentNewsletter.id}/edit`)}
            >
              <Edit size={16} />
              Modifier
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={styles.detailContent}>
        {/* Newsletter Info */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <h3>Informations générales</h3>
            <div className={`${styles.statusBadge} ${styles[currentNewsletter.status.toLowerCase()]}`}>
              {getStatusIcon(currentNewsletter.status)}
              {currentNewsletter.status}
            </div>
          </div>
          
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Titre</label>
              <span>{currentNewsletter.title}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Sujet</label>
              <span>{currentNewsletter.subject}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Audience cible</label>
              <span>{getAudienceLabel(currentNewsletter.targetAudience)}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Créée par</label>
              <span>{currentNewsletter.creator.firstName} {currentNewsletter.creator.lastName}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Date de création</label>
              <span>{new Date(currentNewsletter.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
            {currentNewsletter.scheduledAt && (
              <div className={styles.infoItem}>
                <label>Programmée pour</label>
                <span>{new Date(currentNewsletter.scheduledAt).toLocaleString('fr-FR')}</span>
              </div>
            )}
            {currentNewsletter.sentAt && (
              <div className={styles.infoItem}>
                <label>Envoyée le</label>
                <span>{new Date(currentNewsletter.sentAt).toLocaleString('fr-FR')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Newsletter Content */}
        <div className={styles.contentCard}>
          <h3>Contenu de la newsletter</h3>
          <div className={styles.contentPreview}>
            <div className={styles.emailPreview}>
              <div className={styles.emailHeader}>
                <h2>📧 Kawepla Newsletter</h2>
                <p>{currentNewsletter.title}</p>
              </div>
              
              <div className={styles.emailBody}>
                <h3>Bonjour 👋</h3>
                
                <div className={styles.newsletterContent}>
                  {currentNewsletter.htmlContent ? (
                    <div dangerouslySetInnerHTML={{ __html: currentNewsletter.htmlContent }} />
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {currentNewsletter.content}
                    </div>
                  )}
                </div>
                
                <div className={styles.emailFooter}>
                  <p>Cet email vous a été envoyé par Kawepla</p>
                  <p>La plateforme complète pour organiser vos événements parfaits</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {currentNewsletter.status === 'SENT' && (
          <div className={styles.statsCard}>
            <h3>Statistiques d'envoi</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <Users size={24} />
                <div>
                  <span className={styles.statNumber}>{currentNewsletter.sentCount}</span>
                  <span className={styles.statLabel}>Envoyés</span>
                </div>
              </div>
              <div className={styles.statItem}>
                <Eye size={24} />
                <div>
                  <span className={styles.statNumber}>{currentNewsletter.openCount}</span>
                  <span className={styles.statLabel}>Ouvertures</span>
                </div>
              </div>
              <div className={styles.statItem}>
                <BarChart3 size={24} />
                <div>
                  <span className={styles.statNumber}>{currentNewsletter.clickCount}</span>
                  <span className={styles.statLabel}>Clics</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={styles.actionsCard}>
          <h3>Actions</h3>
          <div className={styles.actionButtons}>
            {currentNewsletter.status === 'DRAFT' && (
              <button
                className={styles.sendButton}
                onClick={handleSendNewsletter}
                disabled={actionLoading === 'send'}
              >
                <Send size={16} />
                {actionLoading === 'send' ? 'Envoi...' : 'Envoyer maintenant'}
              </button>
            )}
            
            {currentNewsletter.status === 'SCHEDULED' && (
              <button
                className={styles.cancelButton}
                onClick={handleCancelNewsletter}
                disabled={actionLoading === 'cancel'}
              >
                <Pause size={16} />
                {actionLoading === 'cancel' ? 'Annulation...' : 'Annuler la programmation'}
              </button>
            )}
            
            {(currentNewsletter.status === 'DRAFT' || currentNewsletter.status === 'SCHEDULED') && (
              <button
                className={styles.deleteButton}
                onClick={() => setShowDeleteModal(true)}
                disabled={actionLoading === 'delete'}
              >
                <Trash2 size={16} />
                {actionLoading === 'delete' ? 'Suppression...' : 'Supprimer'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Confirmer la suppression</h3>
              <button onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <p>Êtes-vous sûr de vouloir supprimer cette newsletter ? Cette action est irréversible.</p>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelModalButton}
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button
                className={styles.deleteModalButton}
                onClick={handleDeleteNewsletter}
                disabled={actionLoading === 'delete'}
              >
                {actionLoading === 'delete' ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
