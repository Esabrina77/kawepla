/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAdminProviders } from "@/hooks/useAdminProviders";
import { HeaderMobile } from "@/components/HeaderMobile";
import {
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  Eye,
  UserCheck,
  UserX,
  Pause,
  Trash2,
  RefreshCw,
  Star,
  MapPin,
  Phone,
  LayoutGrid,
  MessageSquare,
} from "lucide-react";
import styles from "./providers.module.css";
import { ProviderProfile } from "@/lib/api/providers";

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
    deleteProvider,
  } = useAdminProviders();

  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Actions
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderProfile | null>(null);
  const [actionType, setActionType] = useState<
    "approve" | "reject" | "suspend" | "delete"
  >("approve");

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchProviders({
          status: statusFilter || undefined,
          limit: 100,
        }),
        fetchStats(),
      ]);
    } catch (err) {
      console.error("Erreur chargement données:", err);
    }
  };

  const handleProviderAction = async (
    provider: ProviderProfile,
    action: "approve" | "reject" | "suspend" | "delete",
  ) => {
    try {
      setActionLoading(provider.id);

      switch (action) {
        case "approve":
          await approveProvider(provider.id);
          break;
        case "reject":
          await rejectProvider(provider.id);
          break;
        case "suspend":
          await suspendProvider(provider.id);
          break;
        case "delete":
          await deleteProvider(provider.id);
          break;
      }
    } catch (err) {
      console.error(`Erreur ${action}:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const openActionModal = (
    provider: ProviderProfile,
    action: "approve" | "reject" | "suspend" | "delete",
  ) => {
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

  // Calcul des stats de secours si l'API renvoie des zéros (problème possible côté serveur)
  const computedStats = {
    totalProviders: stats?.totalProviders || providers.length || 0,
    approvedProviders:
      stats?.approvedProviders ||
      providers.filter((p) => p.status === "APPROVED").length ||
      0,
    pendingProviders:
      stats?.pendingProviders ||
      providers.filter((p) => p.status === "PENDING").length ||
      0,
    averageRating:
      stats?.averageRating ||
      (providers.length > 0
        ? providers.reduce((acc, p) => acc + (p.rating || 0), 0) /
          providers.length
        : 0),
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          label: "Approuvé",
          className: styles.status_approved,
          color: "#10B981",
          icon: CheckCircle,
        };
      case "PENDING":
        return {
          label: "En attente",
          className: styles.status_pending,
          color: "#F59E0B",
          icon: Clock,
        };
      case "SUSPENDED":
        return {
          label: "Suspendu",
          className: styles.status_suspended,
          color: "#EF4444",
          icon: Pause,
        };
      case "REJECTED":
        return {
          label: "Rejeté",
          className: styles.status_rejected,
          color: "#6B7280",
          icon: XCircle,
        };
      default:
        return {
          label: "Inconnu",
          className: "",
          color: "#9CA3AF",
          icon: AlertTriangle,
        };
    }
  };

  const filteredProviders = providers.filter((provider) => {
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

  if (loading && providers.length === 0) {
    return (
      <div className={styles.providersPage}>
        <HeaderMobile title="Providers" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement des prestataires...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.providersPage}>
      <HeaderMobile title="Providers" />

      <div className={styles.pageContent}>
        {/* Statistiques Bento */}
        {stats && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Users size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{computedStats.totalProviders}</h3>
                <p>Total Prestataires</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <CheckCircle size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{computedStats.approvedProviders}</h3>
                <p>Approuvés</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Clock size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{computedStats.pendingProviders}</h3>
                <p>En Attente</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Star size={20} />
              </div>
              <div className={styles.statContent}>
                <h3>{computedStats.averageRating.toFixed(1)}</h3>
                <p>Note Moyenne</p>
              </div>
            </div>
          </div>
        )}

        {/* Barre de Recherche & Filtres */}
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
              className={`${styles.filterButton} ${showFilters ? styles.filterButtonActive : ""}`}
            >
              <Filter size={18} />
              Filtres
            </button>

            <button
              onClick={loadData}
              className={styles.refreshButton}
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? styles.spinning : ""} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Panel de filtres extensibles */}
        {showFilters && (
          <div className={styles.filtersPanel}>
            <div className={styles.filterGroup}>
              <label>Statut du compte</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="PENDING">En attente de validation</option>
                <option value="APPROVED">Vérifié & Approuvé</option>
                <option value="SUSPENDED">Suspendu temporairement</option>
                <option value="REJECTED">Refusé / Rejeté</option>
              </select>
            </div>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className={styles.errorMessage}>
            <AlertTriangle size={24} />
            <p>{error}</p>
            <button onClick={loadData}>Réessayer</button>
          </div>
        )}

        {/* Grille de Prestataires Bento */}
        <div className={styles.providersGrid}>
          {filteredProviders.length > 0 ? (
            filteredProviders.map((provider) => {
              const status = getStatusInfo(provider.status);
              const StatusIcon = status.icon;

              return (
                <div key={provider.id} className={styles.providerCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.providerPhoto}>
                      {provider.profilePhoto ? (
                        <img
                          src={provider.profilePhoto}
                          alt={provider.businessName}
                        />
                      ) : (
                        <div className={styles.photoPlaceholder}>
                          <Users size={24} />
                        </div>
                      )}
                    </div>
                    <div className={styles.providerMainInfo}>
                      <h4>{provider.businessName}</h4>
                      <span className={styles.categoryBadge}>
                        {!provider.category?.icon ||
                        provider.category.icon.length > 2 ||
                        provider.category.icon.charCodeAt(0) > 0xffff
                          ? "🏢"
                          : provider.category.icon}{" "}
                        {provider.category?.name || "Général"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <div className={styles.infoRow}>
                      <MapPin size={16} />
                      {provider.displayCity}
                    </div>
                    <div className={styles.infoRow}>
                      <Phone size={16} />
                      {provider.phone || "Non renseigné"}
                    </div>

                    <div className={styles.ratingRow}>
                      <div className={styles.starGroup}>
                        <Star size={14} fill="currentColor" />
                        <span>{provider.rating.toFixed(1)}</span>
                      </div>
                      <span className={styles.reviewCount}>
                        ({provider.reviewCount} avis)
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <span
                      className={styles.statusBadge}
                      style={{
                        background: `color-mix(in srgb, ${status.color} 12%, var(--card))`,
                        color: status.color,
                      }}
                    >
                      <StatusIcon size={14} />
                      {status.label}
                    </span>

                    <div className={styles.actions}>
                      <Link
                        href={`/super-admin/providers/${provider.id}`}
                        className={`${styles.actionButton} ${styles.viewButton}`}
                        title="Voir le profil"
                      >
                        <Eye size={18} />
                      </Link>

                      <Link
                        href={`/super-admin/discussions?userId=${provider.userId}`}
                        className={`${styles.actionButton} ${styles.viewButton}`}
                        title="Discuter avec ce prestataire"
                      >
                        <MessageSquare size={18} />
                      </Link>

                      <button
                        className={styles.actionButton}
                        onClick={() => openActionModal(provider, "approve")}
                        disabled={
                          actionLoading === provider.id ||
                          provider.status === "APPROVED"
                        }
                        title="Approuver"
                      >
                        <UserCheck size={18} />
                      </button>

                      <button
                        className={styles.actionButton}
                        onClick={() => openActionModal(provider, "suspend")}
                        disabled={
                          actionLoading === provider.id ||
                          provider.status === "SUSPENDED"
                        }
                        title="Suspendre"
                      >
                        <Pause size={18} />
                      </button>

                      <button
                        className={styles.actionButton}
                        onClick={() => openActionModal(provider, "delete")}
                        disabled={actionLoading === provider.id}
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <LayoutGrid size={40} />
              </div>
              <h3>Aucun prestataire trouvé</h3>
              <p>Essayez de modifier vos filtres ou votre recherche.</p>
            </div>
          )}
        </div>

        {/* Modal de confirmation Bento */}
        {showActionModal && selectedProvider && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowActionModal(false)}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3>
                  {actionType === "approve" && "Approuver le compte"}
                  {actionType === "reject" && "Rejeter l'accès"}
                  {actionType === "suspend" && "Suspendre le compte"}
                  {actionType === "delete" && "Supprimer définitivement"}
                </h3>
              </div>

              <div className={styles.modalBody}>
                <p>
                  Confirmez-vous vouloir{" "}
                  {actionType === "approve"
                    ? "approuver"
                    : actionType === "reject"
                      ? "rejeter"
                      : actionType === "suspend"
                        ? "suspendre"
                        : "supprimer"}{" "}
                  l&apos;accès pour ce professionnel ?
                </p>
                <div className={styles.providerSummary}>
                  <h4>{selectedProvider.businessName}</h4>
                  <p>
                    {selectedProvider.displayCity} •{" "}
                    {selectedProvider.category?.name}
                  </p>
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
                  disabled={!!actionLoading}
                >
                  {actionLoading ? (
                    <RefreshCw size={18} className={styles.spinning} />
                  ) : (
                    "Confirmer l'action"
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
