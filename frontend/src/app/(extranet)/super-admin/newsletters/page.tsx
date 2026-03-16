"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNewsletters } from "@/hooks/useNewsletters";
import { newslettersApi } from "@/lib/api/newsletters";
import { HeaderMobile } from "@/components/HeaderMobile";
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
  Pause,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import styles from "./newsletters.module.css";
import { SuccessModal, ErrorModal, ConfirmModal } from "@/components/ui/modal";

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
    clearError,
  } = useNewsletters();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [audienceFilter, setAudienceFilter] = useState<string>("ALL");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal states for feedback
  const [modalState, setModalState] = useState<{
    type: "success" | "error" | null;
    title: string;
    message: string;
  }>({
    type: null,
    title: "",
    message: "",
  });

  // Charger les newsletters au montage
  useEffect(() => {
    fetchNewsletters({
      page: 1,
      limit: 10,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
      audience: audienceFilter !== "ALL" ? audienceFilter : undefined,
    });
  }, []);

  // Filtres et recherche
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchNewsletters({
        page: 1,
        limit: 10,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        audience: audienceFilter !== "ALL" ? audienceFilter : undefined,
      });
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [statusFilter, audienceFilter]);

  const handleDeleteNewsletter = async (id: string) => {
    setActionLoading(id);
    try {
      const success = await deleteNewsletter(id);
      if (success) {
        setShowDeleteConfirm(null);
      }
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendNewsletter = async (id: string) => {
    setActionLoading(id);
    try {
      const result = await sendNewsletter(id, true);
      if (result) {
        setModalState({
          type: "success",
          title: "Envoi réussi",
          message: `La newsletter a été envoyée avec succès à ${result.sentCount} destinataires.`,
        });
        fetchNewsletters({ page: pagination?.page || 1 });
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelNewsletter = async (id: string) => {
    setActionLoading(id);
    try {
      await cancelNewsletter(id);
    } catch (err) {
      console.error("Erreur lors de l'annulation:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Edit size={14} />;
      case "SCHEDULED":
        return <Clock size={14} />;
      case "SENDING":
        return <Play size={14} />;
      case "SENT":
        return <CheckCircle size={14} />;
      case "CANCELLED":
        return <X size={14} />;
      default:
        return <AlertCircle size={14} />;
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case "PROVIDERS_ONLY":
        return <UserCheck size={14} />;
      default:
        return <Users size={14} />;
    }
  };

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={48} />
        <h2>Erreur de chargement</h2>
        <p>{error}</p>
        <button onClick={clearError} className={styles.retryButton}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className={styles.newslettersPage}>
      <HeaderMobile title="Newsletter" />

      {/* Header Bento style */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Mail className={styles.headerIcon} size={24} />
            <div>
              <h1>Campagnes</h1>
              <p>Gérez vos communications e-mail.</p>
            </div>
          </div>
          <button
            className={styles.createButton}
            onClick={() => router.push("/super-admin/newsletters/create")}
          >
            <Plus size={18} />
            Nouvelle Campagne
          </button>
        </div>
      </div>

      {/* Filtres Bento */}
      <div className={styles.filtersSection}>
        <div className={styles.searchBar}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Rechercher par titre ou objet..."
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
              <option value="SENDING">Envoi en cours</option>
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
              <option value="ALL">Toute l'audience</option>
              <option value="ALL_USERS">Tous les membres</option>
              <option value="HOSTS_ONLY">Organisateurs</option>
              <option value="PROVIDERS_ONLY">Prestataires</option>
              <option value="ADMINS_ONLY">Admins</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des newsletters */}
      <div className={styles.newslettersGrid}>
        {loading && newsletters.length === 0 ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Chargement des campagnes...</p>
          </div>
        ) : newsletters.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Mail size={40} />
            </div>
            <h3>Aucune campagne trouvée</h3>
            <p>
              Créez votre première newsletter pour engager votre communauté
              Kawepla.
            </p>
            <div className={styles.emptyFeatures}>
              <div className={styles.feature}>
                <Users size={16} /> Ciblage
              </div>
              <div className={styles.feature}>
                <Calendar size={16} /> Planning
              </div>
              <div className={styles.feature}>
                <BarChart3 size={16} /> Stats
              </div>
            </div>
            <button
              className={styles.createButton}
              onClick={() => router.push("/super-admin/newsletters/create")}
            >
              Créer ma première newsletter
            </button>
          </div>
        ) : (
          newsletters.map((newsletter) => (
            <div key={newsletter.id} className={styles.newsletterCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <h3>{newsletter.title}</h3>
                  <span className={styles.subject}>{newsletter.subject}</span>
                </div>
                <div className={styles.cardActions}>
                  <button
                    className={styles.actionButton}
                    onClick={() =>
                      router.push(`/super-admin/newsletters/${newsletter.id}`)
                    }
                    title="Détails"
                  >
                    <Eye size={14} />
                  </button>
                  {newsletter.status === "DRAFT" && (
                    <button
                      className={styles.actionButton}
                      onClick={() =>
                        router.push(
                          `/super-admin/newsletters/${newsletter.id}/edit`,
                        )
                      }
                      title="Modifier"
                    >
                      <Edit size={14} />
                    </button>
                  )}
                  {(newsletter.status === "DRAFT" ||
                    newsletter.status === "SCHEDULED") && (
                    <button
                      className={styles.deleteButton}
                      onClick={() => setShowDeleteConfirm(newsletter.id)}
                      disabled={actionLoading === newsletter.id}
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.cardMeta}>
                <div
                  className={`${styles.statusBadge} ${styles[newsletter.status.toLowerCase()]}`}
                >
                  {getStatusIcon(newsletter.status)}
                  {newslettersApi.getStatusLabel(newsletter.status)}
                </div>
                <div className={styles.audienceBadge}>
                  {getAudienceIcon(newsletter.targetAudience)}
                  {newslettersApi.getAudienceLabel(newsletter.targetAudience)}
                </div>
              </div>

              <div className={styles.cardContent}>
                <p>{newsletter.content}</p>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.cardStats}>
                  <span className={styles.stat}>
                    <Users size={12} />
                    {newsletter._count?.recipients || 0}
                  </span>
                  {newsletter.sentAt && (
                    <span className={styles.stat}>
                      <CheckCircle size={12} />
                      {newsletter.sentCount}
                    </span>
                  )}
                </div>

                <div className={styles.cardDate}>
                  <span>
                    {newsletter.status === "SCHEDULED" ? (
                      <Clock size={12} />
                    ) : (
                      <Calendar size={12} />
                    )}
                    {new Date(
                      newsletter.scheduledAt ||
                        newsletter.sentAt ||
                        newsletter.updatedAt,
                    ).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>

              {/* Quick Action Footer Overlay Logic */}
              {(newsletter.status === "DRAFT" ||
                newsletter.status === "SCHEDULED") && (
                <div className={styles.quickActions}>
                  {newsletter.status === "DRAFT" && (
                    <button
                      className={styles.sendButton}
                      onClick={() => handleSendNewsletter(newsletter.id)}
                      disabled={actionLoading === newsletter.id}
                    >
                      <Send size={14} />
                      {actionLoading === newsletter.id
                        ? "..."
                        : "Envoyer maintenant"}
                    </button>
                  )}
                  {newsletter.status === "SCHEDULED" && (
                    <button
                      className={styles.cancelButton}
                      onClick={() => handleCancelNewsletter(newsletter.id)}
                      disabled={actionLoading === newsletter.id}
                    >
                      <Pause size={14} />
                      Annuler l'envoi
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={pagination.page === 1}
            onClick={() => fetchNewsletters({ page: pagination.page - 1 })}
          >
            Précédent
          </button>
          <span>
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page === pagination.totalPages}
            onClick={() => fetchNewsletters({ page: pagination.page + 1 })}
          >
            Suivant
          </button>
        </div>
      )}

      {/* Modals de feedback */}
      <SuccessModal
        isOpen={modalState.type === "success"}
        onClose={() => setModalState((prev) => ({ ...prev, type: null }))}
        title={modalState.title}
        message={modalState.message}
        confirmText="OK"
      />

      <ErrorModal
        isOpen={modalState.type === "error"}
        onClose={() => setModalState((prev) => ({ ...prev, type: null }))}
        title={modalState.title}
        message={modalState.message}
        confirmText="OK"
      />

      <ConfirmModal
        isOpen={showDeleteConfirm !== null}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() =>
          showDeleteConfirm && handleDeleteNewsletter(showDeleteConfirm)
        }
        title="Supprimer la campagne ?"
        message="Cette action supprimera définitivement le brouillon de la newsletter. Les emails déjà envoyés ne seront pas affectés."
        confirmText="Supprimer"
        cancelText="Conserver"
        isLoading={actionLoading === showDeleteConfirm}
      />
    </div>
  );
}
