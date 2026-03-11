"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useNewsletters } from "@/hooks/useNewsletters";
import { HeaderMobile } from "@/components/HeaderMobile";
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
  Pause,
  UserCheck,
} from "lucide-react";
import styles from "./page.module.css";
import { SuccessModal, ErrorModal, ConfirmModal } from "@/components/ui/modal";

export default function NewsletterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const newsletterId = params.id as string;

  const {
    currentNewsletter,
    recipients,
    loading,
    error,
    fetchNewsletterById,
    fetchRecipients,
    sendNewsletter,
    deleteNewsletter,
    cancelNewsletter,
    clearError,
  } = useNewsletters();

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  useEffect(() => {
    if (newsletterId) {
      fetchNewsletterById(newsletterId);
      fetchRecipients(newsletterId);
    }
  }, [newsletterId, fetchNewsletterById, fetchRecipients]);

  const handleSendNewsletter = async () => {
    if (!currentNewsletter) return;

    setActionLoading("send");
    try {
      const result = await sendNewsletter(currentNewsletter.id, true);
      if (result) {
        setModalState({
          type: "success",
          title: "Envoi réussi",
          message: `La newsletter a été envoyée avec succès à ${result.sentCount} destinataires.`,
        });
        fetchNewsletterById(currentNewsletter.id);
        fetchRecipients(currentNewsletter.id);
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteNewsletter = async () => {
    if (!currentNewsletter) return;

    setActionLoading("delete");
    try {
      const success = await deleteNewsletter(currentNewsletter.id);
      if (success) {
        router.push("/super-admin/newsletters");
      }
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
    } finally {
      setActionLoading(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelNewsletter = async () => {
    if (!currentNewsletter) return;

    setActionLoading("cancel");
    try {
      await cancelNewsletter(currentNewsletter.id);
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

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case "ALL_USERS":
        return "Tous les utilisateurs";
      case "HOSTS_ONLY":
        return "Organisateurs";
      case "PROVIDERS_ONLY":
        return "Prestataires";
      case "ADMINS_ONLY":
        return "Admin";
      case "SPECIFIC_USERS":
        return "Ciblé";
      default:
        return audience;
    }
  };

  if (loading && !currentNewsletter) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Chargement des détails...</p>
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
        <h2>Introuvable</h2>
        <button
          onClick={() => router.push("/super-admin/newsletters")}
          className={styles.retryButton}
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className={styles.detailPage}>
      <HeaderMobile title="Détails Campagne" />

      {/* Header Bento style inspiré de la page parent */}
      <div className={styles.detailHeader}>
        <div className={styles.headerLeft}>
          <div>
            <h1>{currentNewsletter.title}</h1>
            <p>
              Diffusion du{" "}
              {new Date(currentNewsletter.createdAt).toLocaleDateString(
                "fr-FR",
              )}
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          {currentNewsletter.status === "DRAFT" && (
            <button
              className={styles.editButton}
              onClick={() =>
                router.push(
                  `/super-admin/newsletters/${currentNewsletter.id}/edit`,
                )
              }
            >
              <Edit size={16} />
              Modifier le contenu
            </button>
          )}
        </div>
      </div>

      <div className={styles.detailContent}>
        {/* Main Column */}
        <div className={styles.mainColumn}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {/* Info Card */}
            <div className={styles.infoCard}>
              <div
                className={styles.cardHeader}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Users size={18} style={{ color: "var(--admin)" }} />
                  Configuration de l'envoi
                </h3>
                <div
                  className={`${styles.statusBadge} ${styles[currentNewsletter.status.toLowerCase()]}`}
                >
                  {getStatusIcon(currentNewsletter.status)}
                  {currentNewsletter.status}
                </div>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Sujet de l'email</label>
                  <span>{currentNewsletter.subject}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Audience cible</label>
                  <span>
                    {getAudienceLabel(currentNewsletter.targetAudience)}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <label>Auteur de la campagne</label>
                  <span>
                    {currentNewsletter.creator.firstName}{" "}
                    {currentNewsletter.creator.lastName}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <label>Date de création</label>
                  <span>
                    {new Date(currentNewsletter.createdAt).toLocaleDateString(
                      "fr-FR",
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Preview Card */}
            <div className={styles.contentCard}>
              <h3>Aperçu du contenu envoyé</h3>
              <div className={styles.emailPreview}>
                <div className={styles.emailHeader}>
                  <h2 style={{ fontSize: "1rem", opacity: 0.8 }}>
                    Campagne : {currentNewsletter.title}
                  </h2>
                  <p style={{ fontWeight: 800 }}>
                    Objet : {currentNewsletter.subject}
                  </p>
                </div>

                <div className={styles.emailBody}>
                  <div className={styles.newsletterContent}>
                    {currentNewsletter.htmlContent ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: currentNewsletter.htmlContent,
                        }}
                      />
                    ) : (
                      <div style={{ whiteSpace: "pre-wrap" }}>
                        {currentNewsletter.content}
                      </div>
                    )}
                  </div>

                  <div className={styles.emailFooter}>
                    <p>
                      © {new Date().getFullYear()} Kawepla. Tous droits
                      réservés.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className={styles.sidebar}>
          {/* Performance Card - Simplified to Sent Count only */}
          <div className={styles.statsCard}>
            <h3>Volume d'envoi</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>
                  {currentNewsletter.sentCount || 0}
                </span>
                <span className={styles.statLabel}>
                  Emails expédiés avec succès
                </span>
              </div>
            </div>
          </div>

          {/* Recipients Card - New Section */}
          <div className={styles.infoCard}>
            <h3>Destinataires ({recipients.length})</h3>
            <div className={styles.recipientList}>
              {recipients.length > 0 ? (
                recipients.map((r, idx) => (
                  <div key={idx} className={styles.recipientItem}>
                    <span className={styles.recipientEmail}>
                      {r.user.email}
                    </span>
                    <span className={styles.recipientStatus}>
                      {r.sentAt ? "Reçu" : "En attente"}
                    </span>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    padding: "1rem 0",
                  }}
                >
                  Aucun destinataire enregistré pour le moment.
                </p>
              )}
            </div>
          </div>

          {/* Actions Card - Hidden if SENT */}
          {currentNewsletter.status !== "SENT" && (
            <div className={styles.actionsCard}>
              <h3>Contrôle</h3>
              <div className={styles.actionButtons}>
                {currentNewsletter.status === "DRAFT" && (
                  <button
                    className={styles.sendButton}
                    onClick={handleSendNewsletter}
                    disabled={actionLoading === "send"}
                  >
                    <Send size={16} />
                    {actionLoading === "send" ? "Envoi..." : "Lancer l'envoi"}
                  </button>
                )}

                {currentNewsletter.status === "SCHEDULED" && (
                  <button
                    className={styles.cancelButton}
                    onClick={handleCancelNewsletter}
                    disabled={actionLoading === "cancel"}
                    style={{
                      background: "#F59E0B",
                      color: "white",
                      border: "none",
                    }}
                  >
                    <Pause size={16} />
                    Annuler la programmation
                  </button>
                )}

                {(currentNewsletter.status === "DRAFT" ||
                  currentNewsletter.status === "SCHEDULED") && (
                  <button
                    className={styles.deleteButton}
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={actionLoading === "delete"}
                    style={{ border: "1px solid #EF4444", color: "#EF4444" }}
                  >
                    <Trash2 size={16} />
                    Supprimer la campagne
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Schedule Info if exists */}
          {currentNewsletter.status === "SCHEDULED" &&
            currentNewsletter.scheduledAt && (
              <div
                className={styles.infoCard}
                style={{ padding: "1rem", border: "1px solid #F59E0B" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "#F59E0B",
                  }}
                >
                  <Clock size={16} />
                  <span style={{ fontSize: "0.85rem", fontWeight: 800 }}>
                    DÉPART PRÉVU :
                  </span>
                </div>
                <p
                  style={{
                    margin: "0.5rem 0 0 0",
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: "#F59E0B",
                  }}
                >
                  {new Date(currentNewsletter.scheduledAt).toLocaleString(
                    "fr-FR",
                  )}
                </p>
              </div>
            )}
        </div>
      </div>

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
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteNewsletter}
        title="Supprimer la campagne ?"
        message="Souhaitez-vous vraiment supprimer définitivement cette newsletter ? Cette action est irréversible."
        confirmText="Oui, supprimer"
        cancelText="Non, garder"
        isLoading={actionLoading === "delete"}
      />
    </div>
  );
}
