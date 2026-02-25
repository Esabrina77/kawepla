'use client';

import { useState, useEffect } from 'react';
import { providersApi, ProviderProfile, ProviderStats } from '@/lib/api/providers';
import { useAdminProviders } from '@/hooks/useAdminProviders';
import { HeaderMobile } from '@/components/HeaderMobile';
import {
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  MoreVertical,
  Eye,
  UserCheck,
  UserX,
  Pause,
  Trash2,
  RefreshCw,
  TrendingUp,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Link
} from 'lucide-react';
import styles from './providers.module.css';

export default function AdminProvidersPage() {
  const {
    providers,
    stats,
    loading,
    error,
    fetchProviders,
    fetchStats,
    approveProvider,
    rejectProvider,
    suspendProvider,
    deleteProvider
  } = useAdminProviders();

  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Actions
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderProfile | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'suspend' | 'delete'>('approve');

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchProviders({
          status: statusFilter || undefined,
          limit: 100
        }),
        fetchStats()
      ]);
    } catch (err) {
      console.error('Erreur chargement données:', err);
    }
  };

  const handleProviderAction = async (provider: ProviderProfile, action: 'approve' | 'reject' | 'suspend' | 'delete') => {
    try {
      setActionLoading(provider.id);

      switch (action) {
        case 'approve':
          await approveProvider(provider.id);
          break;
        case 'reject':
          await rejectProvider(provider.id);
          break;
        case 'suspend':
          await suspendProvider(provider.id);
          break;
        case 'delete':
          await deleteProvider(provider.id);
          break;
      }

    } catch (err) {
      console.error(`Erreur ${action}:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const openActionModal = (provider: ProviderProfile, action: 'approve' | 'reject' | 'suspend' | 'delete') => {
    setSelectedProvider(provider);
    setActionType(action);
    setShowActionModal(true);
  };

  const confirmAction = async () => {
    if (!selectedProvider) return;

    await handleProviderAction(selectedProvider, actionType);

    setShowActionModal(false);
    setSelectedProvider(null);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { label: 'Approuvé', color: '#27ae60', icon: CheckCircle };
      case 'PENDING':
        return { label: 'En attente', color: '#f39c12', icon: Clock };
      case 'SUSPENDED':
        return { label: 'Suspendu', color: '#e74c3c', icon: Pause };
      case 'REJECTED':
        return { label: 'Rejeté', color: '#95a5a6', icon: XCircle };
      default:
        return { label: 'Inconnu', color: '#6c757d', icon: AlertTriangle };
    }
  };

  const filteredProviders = providers.filter(provider => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        provider.businessName.toLowerCase().includes(query) ||
        provider.displayCity.toLowerCase().includes(query) ||
        provider.category?.name.toLowerCase().includes(query) ||
        provider.phone.includes(query)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className={styles.providersPage}>
        <HeaderMobile title="Providers" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement des providers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.providersPage}>
      <HeaderMobile title="Providers" />

      <div className={styles.pageContent}>

        {/* Statistiques */}
        {stats && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Users size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.totalProviders}</h3>
                <p>Total Providers</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <CheckCircle size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.approvedProviders}</h3>
                <p>Approuvés</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Clock size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.pendingProviders}</h3>
                <p>En attente</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Star size={24} />
              </div>
              <div className={styles.statContent}>
                <h3>{stats.averageRating.toFixed(1)}</h3>
                <p>Note moyenne</p>
              </div>
            </div>
          </div>
        )}

        {/* Filtres et recherche */}
        <div className={styles.filtersSection}>
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Rechercher par nom, ville, catégorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterControls}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={styles.filterButton}
            >
              <Filter size={16} />
              Filtres
            </button>

            <button
              onClick={loadData}
              className={styles.refreshButton}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? styles.spinning : ''} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Panel de filtres */}
        {showFilters && (
          <div className={styles.filtersPanel}>
            <div className={styles.filterGroup}>
              <label>Statut</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="APPROVED">Approuvé</option>
                <option value="SUSPENDED">Suspendu</option>
                <option value="REJECTED">Rejeté</option>
              </select>
            </div>
          </div>
        )}

        {/* Liste des providers */}
        <div className={styles.providersSection}>
          <div className={styles.sectionHeader}>
            <h2>Providers ({filteredProviders.length})</h2>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <p>❌ {error}</p>
              <button onClick={loadData}>Réessayer</button>
            </div>
          )}

          <div className={styles.providersTable}>
            <div className={styles.tableHeader}>
              <div className={styles.tableCell}>Provider</div>
              <div className={styles.tableCell}>Catégorie</div>
              <div className={styles.tableCell}>Localisation</div>
              <div className={styles.tableCell}>Contact</div>
              <div className={styles.tableCell}>Statut</div>
              <div className={styles.tableCell}>Note</div>
              <div className={styles.tableCell}>Actions</div>
            </div>

            {filteredProviders.map((provider) => {
              const statusInfo = getStatusInfo(provider.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div key={provider.id} className={styles.tableRow}>
                  <div className={styles.tableCell}>
                    <div className={styles.providerInfo}>
                      <div className={styles.providerPhoto}>
                        {provider.profilePhoto ? (
                          <img src={provider.profilePhoto} alt={provider.businessName} />
                        ) : (
                          <div className={styles.photoPlaceholder}>
                            <Users size={16} />
                          </div>
                        )}
                      </div>
                      <div className={styles.providerDetails}>
                        <h4>{provider.businessName}</h4>
                        <p className={styles.providerDescription}>
                          {provider.description?.substring(0, 60)}
                          {provider.description && provider.description.length > 60 && '...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.tableCell}>
                    <span className={styles.category}>
                      {provider.category?.icon} {provider.category?.name}
                    </span>
                  </div>

                  <div className={styles.tableCell}>
                    <div className={styles.location}>
                      <MapPin size={14} />
                      {provider.displayCity}
                    </div>
                  </div>

                  <div className={styles.tableCell}>
                    <div className={styles.contact}>
                      <div className={styles.contactItem}>
                        <Phone size={12} />
                        {provider.phone}
                      </div>
                    </div>
                  </div>

                  <div className={styles.tableCell}>
                    <span
                      className={styles.statusBadge}
                      style={{ color: statusInfo.color }}
                    >
                      <StatusIcon size={14} />
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className={styles.tableCell}>
                    <div className={styles.rating}>
                      <Star size={14} className={styles.starIcon} />
                      <span>{provider.rating.toFixed(1)}</span>
                      <span className={styles.reviewCount}>({provider.reviewCount})</span>
                    </div>
                  </div>

                  <div className={styles.tableCell}>
                    <div className={styles.actions}>
                      <Link
                        className={styles.actionButton}
                        href={`/super-admin/providers/${provider.id}`}
                        target="_blank"
                      >
                        <Eye size={16} />
                      </Link>
                      {/* <button
                      className={styles.actionButton}
                      onClick={() => window.open(`/super-admin/providers/${provider.id}`, '_blank')}
                      title="Voir le détail"
                    >
                      <Eye size={16} />
                    </button> */}

                      <button
                        className={styles.actionButton}
                        onClick={() => openActionModal(provider, 'approve')}
                        disabled={actionLoading === provider.id || provider.status === 'APPROVED'}
                        title="Approuver"
                      >
                        <UserCheck size={16} />
                      </button>

                      <button
                        className={styles.actionButton}
                        onClick={() => openActionModal(provider, 'suspend')}
                        disabled={actionLoading === provider.id || provider.status === 'SUSPENDED'}
                        title="Suspendre"
                      >
                        <Pause size={16} />
                      </button>

                      <button
                        className={styles.actionButton}
                        onClick={() => openActionModal(provider, 'reject')}
                        disabled={actionLoading === provider.id || provider.status === 'REJECTED'}
                        title="Rejeter"
                      >
                        <UserX size={16} />
                      </button>

                      <button
                        className={styles.actionButton}
                        onClick={() => openActionModal(provider, 'delete')}
                        disabled={actionLoading === provider.id}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal de confirmation */}
        {showActionModal && selectedProvider && (
          <div className={styles.modal} onClick={() => setShowActionModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>
                  {actionType === 'approve' && 'Approuver le provider'}
                  {actionType === 'reject' && 'Rejeter le provider'}
                  {actionType === 'suspend' && 'Suspendre le provider'}
                  {actionType === 'delete' && 'Supprimer le provider'}
                </h3>
              </div>

              <div className={styles.modalBody}>
                <p>
                  Êtes-vous sûr de vouloir {actionType === 'approve' ? 'approuver' :
                    actionType === 'reject' ? 'rejeter' :
                      actionType === 'suspend' ? 'suspendre' : 'supprimer'} le provider :
                </p>
                <div className={styles.providerSummary}>
                  <h4>{selectedProvider.businessName}</h4>
                  <p>{selectedProvider.displayCity} • {selectedProvider.category?.name}</p>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  onClick={() => setShowActionModal(false)}
                  className={styles.cancelButton}
                >
                  Annuler
                </button>
                <button
                  onClick={confirmAction}
                  className={styles.confirmButton}
                  disabled={actionLoading === selectedProvider.id}
                >
                  {actionLoading === selectedProvider.id ? (
                    <>
                      <div className={styles.loadingSpinner}></div>
                      Traitement...
                    </>
                  ) : (
                    'Confirmer'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
