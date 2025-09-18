'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNewsletters } from '@/hooks/useNewsletters';
import { newslettersApi } from '@/lib/api/newsletters';
import { 
  Mail, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  Calendar, 
  Eye, 
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Play,
  Pause
} from 'lucide-react';
import styles from './newsletters.module.css';

export default function NewslettersPage() {
  const router = useRouter();
  const {
    newsletters,
    loading,
    error,
    pagination,
    fetchNewsletters,
    deleteNewsletter,
    sendNewsletter,
    cancelNewsletter,
    clearError
  } = useNewsletters();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [audienceFilter, setAudienceFilter] = useState<string>('ALL');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Charger les newsletters au montage
  useEffect(() => {
    fetchNewsletters({
      page: 1,
      limit: 10,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      audience: audienceFilter !== 'ALL' ? audienceFilter : undefined,
    });
  }, []);

  // Filtres et recherche avec debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchNewsletters({
        page: 1,
        limit: 10,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        audience: audienceFilter !== 'ALL' ? audienceFilter : undefined,
      });
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [statusFilter, audienceFilter]);

  const handleDeleteNewsletter = async (id: string) => {
    setActionLoading(id);
    try {
      const success = await deleteNewsletter(id);
      if (success) {
        setShowDeleteModal(null);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendNewsletter = async (id: string) => {
    setActionLoading(id);
    try {
      const result = await sendNewsletter(id, true);
      if (result) {
        alert(`Newsletter envoyée avec succès à ${result.sentCount} destinataires`);
      }
    } catch (err) {
      console.error('Erreur lors de l\'envoi:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelNewsletter = async (id: string) => {
    setActionLoading(id);
    try {
      await cancelNewsletter(id);
    } catch (err) {
      console.error('Erreur lors de l\'annulation:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Edit size={16} />;
      case 'SCHEDULED': return <Clock size={16} />;
      case 'SENDING': return <Play size={16} />;
      case 'SENT': return <CheckCircle size={16} />;
      case 'CANCELLED': return <X size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'ALL_USERS': return <Users size={16} />;
      case 'HOSTS_ONLY': return <Users size={16} />;
      case 'PROVIDERS_ONLY': return <Users size={16} />;
      case 'ADMINS_ONLY': return <Users size={16} />;
      case 'SPECIFIC_USERS': return <Users size={16} />;
      default: return <Users size={16} />;
    }
  };

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

  return (
    <div className={styles.newslettersPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Mail className={styles.headerIcon} size={32} />
            <div>
              <h1>Newsletters</h1>
              <p>Gérez vos campagnes d'emailing</p>
            </div>
          </div>
          <button 
            className={styles.createButton}
            onClick={() => router.push('/super-admin/newsletters/create')}
          >
            <Plus size={20} />
            Nouvelle Newsletter
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className={styles.filtersSection}>
        <div className={styles.searchBar}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Rechercher une newsletter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <Filter size={16} />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Tous les statuts</option>
              <option value="DRAFT">Brouillon</option>
              <option value="SCHEDULED">Programmées</option>
              <option value="SENDING">En cours d'envoi</option>
              <option value="SENT">Envoyées</option>
              <option value="CANCELLED">Annulées</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <Users size={16} />
            <select 
              value={audienceFilter} 
              onChange={(e) => setAudienceFilter(e.target.value)}
            >
              <option value="ALL">Toutes les audiences</option>
              <option value="ALL_USERS">Tous les utilisateurs</option>
              <option value="HOSTS_ONLY">Organisateurs</option>
              <option value="PROVIDERS_ONLY">Prestataires</option>
              <option value="ADMINS_ONLY">Administrateurs</option>
              <option value="SPECIFIC_USERS">Utilisateurs spécifiques</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des newsletters */}
      <div className={styles.newslettersGrid}>
        {loading && newsletters.length === 0 ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Chargement des newsletters...</p>
          </div>
        ) : newsletters.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Mail size={80} />
            </div>
            <h3>Commencez votre première campagne</h3>
            <p>Créez et envoyez des newsletters personnalisées à vos utilisateurs pour les tenir informés des nouvelles fonctionnalités, promotions et actualités.</p>
            <div className={styles.emptyFeatures}>
              <div className={styles.feature}>
                <Users size={20} />
                <span>Ciblage précis par audience</span>
              </div>
              <div className={styles.feature}>
                <Calendar size={20} />
                <span>Programmation d'envoi</span>
              </div>
              <div className={styles.feature}>
                <BarChart3 size={20} />
                <span>Statistiques détaillées</span>
              </div>
            </div>
            <button 
              className={styles.createButton}
              onClick={() => router.push('/super-admin/newsletters/create')}
            >
              <Plus size={20} />
              Créer ma première newsletter
            </button>
          </div>
        ) : (
          newsletters.map((newsletter) => (
            <div key={newsletter.id} className={styles.newsletterCard}>
              {/* Header de la carte */}
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <h3>{newsletter.title}</h3>
                  <span className={styles.subject}>{newsletter.subject}</span>
                </div>
                <div className={styles.cardActions}>
                  <button
                    className={styles.actionButton}
                    onClick={() => router.push(`/super-admin/newsletters/${newsletter.id}`)}
                    title="Voir les détails"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => router.push(`/super-admin/newsletters/${newsletter.id}/stats`)}
                    title="Statistiques"
                  >
                    <BarChart3 size={16} />
                  </button>
                  {newsletter.status === 'DRAFT' && (
                    <button
                      className={styles.actionButton}
                      onClick={() => router.push(`/super-admin/newsletters/${newsletter.id}/edit`)}
                      title="Modifier"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  {(newsletter.status === 'DRAFT' || newsletter.status === 'SCHEDULED') && (
                    <button
                      className={styles.deleteButton}
                      onClick={() => setShowDeleteModal(newsletter.id)}
                      title="Supprimer"
                      disabled={actionLoading === newsletter.id}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Statut et audience */}
              <div className={styles.cardMeta}>
                <div className={`${styles.statusBadge} ${styles[newsletter.status.toLowerCase()]}`}>
                  {getStatusIcon(newsletter.status)}
                  {newslettersApi.getStatusLabel(newsletter.status)}
                </div>
                <div className={styles.audienceBadge}>
                  {getAudienceIcon(newsletter.targetAudience)}
                  {newslettersApi.getAudienceLabel(newsletter.targetAudience)}
                </div>
              </div>

              {/* Contenu */}
              <div className={styles.cardContent}>
                <p>{newsletter.content.substring(0, 150)}...</p>
              </div>

              {/* Footer de la carte */}
              <div className={styles.cardFooter}>
                <div className={styles.cardStats}>
                  <span className={styles.stat}>
                    <Users size={14} />
                    {newsletter._count?.recipients || 0} destinataires
                  </span>
                  {newsletter.sentAt && (
                    <span className={styles.stat}>
                      <CheckCircle size={14} />
                      {newsletter.sentCount} envoyés
                    </span>
                  )}
                </div>

                <div className={styles.cardDate}>
                  {newsletter.status === 'SCHEDULED' && newsletter.scheduledAt ? (
                    <span>
                      <Calendar size={14} />
                      {new Date(newsletter.scheduledAt).toLocaleDateString('fr-FR')}
                    </span>
                  ) : newsletter.sentAt ? (
                    <span>
                      <CheckCircle size={14} />
                      {new Date(newsletter.sentAt).toLocaleDateString('fr-FR')}
                    </span>
                  ) : (
                    <span>
                      <Edit size={14} />
                      {new Date(newsletter.updatedAt).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions rapides */}
              <div className={styles.quickActions}>
                {newsletter.status === 'DRAFT' && (
                  <button
                    className={styles.sendButton}
                    onClick={() => handleSendNewsletter(newsletter.id)}
                    disabled={actionLoading === newsletter.id}
                  >
                    <Send size={16} />
                    {actionLoading === newsletter.id ? 'Envoi...' : 'Envoyer maintenant'}
                  </button>
                )}
                {newsletter.status === 'SCHEDULED' && (
                  <button
                    className={styles.cancelButton}
                    onClick={() => handleCancelNewsletter(newsletter.id)}
                    disabled={actionLoading === newsletter.id}
                  >
                    <Pause size={16} />
                    {actionLoading === newsletter.id ? 'Annulation...' : 'Annuler'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={pagination.page === 1}
            onClick={() => fetchNewsletters({ 
              page: pagination.page - 1, 
              limit: 10,
              status: statusFilter !== 'ALL' ? statusFilter : undefined,
              audience: audienceFilter !== 'ALL' ? audienceFilter : undefined,
            })}
          >
            Précédent
          </button>
          <span>
            Page {pagination.page} sur {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page === pagination.totalPages}
            onClick={() => fetchNewsletters({ 
              page: pagination.page + 1, 
              limit: 10,
              status: statusFilter !== 'ALL' ? statusFilter : undefined,
              audience: audienceFilter !== 'ALL' ? audienceFilter : undefined,
            })}
          >
            Suivant
          </button>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Confirmer la suppression</h3>
              <button onClick={() => setShowDeleteModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalContent}>
              <p>Êtes-vous sûr de vouloir supprimer cette newsletter ? Cette action est irréversible.</p>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelModalButton}
                onClick={() => setShowDeleteModal(null)}
              >
                Annuler
              </button>
              <button
                className={styles.deleteModalButton}
                onClick={() => handleDeleteNewsletter(showDeleteModal)}
                disabled={actionLoading === showDeleteModal}
              >
                {actionLoading === showDeleteModal ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
