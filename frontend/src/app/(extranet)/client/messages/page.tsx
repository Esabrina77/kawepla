"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRSVPMessages } from "@/hooks/useRSVPMessages";
import { useInvitations } from "@/hooks/useInvitations";
import { RSVPMessage } from "@/types";
import { HeaderMobile } from "@/components/HeaderMobile";
import styles from "./messages.module.css";

import {
  MessageSquare,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Mail,
  Eye,
  Phone,
  Filter,
  X,
  ArrowRight,
  Info,
} from "lucide-react";

export default function MessagesPage() {
  const { invitations, loading: loadingInvitations } = useInvitations();
  const {
    messages,
    loading: loadingMessages,
    error,
    refetch,
  } = useRSVPMessages();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<RSVPMessage | null>(
    null,
  );
  const [selectedInvitationId, setSelectedInvitationId] =
    useState<string>("all");

  // Restaurer l'invitation précédemment sélectionnée au chargement
  useEffect(() => {
    const savedId = localStorage.getItem("lastSelectedInvitationId");
    if (savedId) {
      setSelectedInvitationId(savedId);
    }
  }, []);

  const handleInvitationChange = (id: string) => {
    setSelectedInvitationId(id);
    localStorage.setItem("lastSelectedInvitationId", id);
  };

  // Stats calculation based on selected invitation
  const stats = useMemo(() => {
    const relevantMessages =
      selectedInvitationId === "all"
        ? messages
        : messages.filter((m) => m.invitation.id === selectedInvitationId);

    const total = relevantMessages.length;
    const confirmed = relevantMessages.filter(
      (m) => m.status === "CONFIRMED",
    ).length;
    const declined = relevantMessages.filter(
      (m) => m.status === "DECLINED",
    ).length;
    const pending = relevantMessages.filter(
      (m) => m.status === "PENDING",
    ).length;
    return { total, confirmed, declined, pending };
  }, [messages, selectedInvitationId]);

  // Combined messages filtering (search + invitation + has Content)
  const filteredMessages = useMemo(() => {
    return messages.filter((message) => {
      // Filtrer par invitation (CORRECTION ICI)
      if (
        selectedInvitationId !== "all" &&
        message.invitation.id !== selectedInvitationId
      ) {
        return false;
      }

      // Afficher uniquement les réponses avec un message
      const hasMessage = message.message && message.message.trim() !== "";
      if (!hasMessage) return false;

      // Search logic
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          message.guest.firstName.toLowerCase().includes(query) ||
          message.guest.lastName.toLowerCase().includes(query) ||
          message.guest.email.toLowerCase().includes(query) ||
          (message.message && message.message.toLowerCase().includes(query)) ||
          message.invitation.eventTitle.toLowerCase().includes(query);

        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [messages, searchQuery, selectedInvitationId]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Confirmé";
      case "DECLINED":
        return "Décliné";
      case "PENDING":
        return "En attente";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loadingMessages || loadingInvitations) {
    return (
      <div className={styles.pageContainer}>
        <HeaderMobile title="Réponses" />
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Chargement de vos messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <HeaderMobile title="Réponses" />
        <div className={styles.emptyContainer}>
          <Info className={styles.emptyIcon} style={{ color: "#EF4444" }} />
          <h3 className={styles.emptyTitle}>Une erreur est survenue</h3>
          <p className={styles.emptyText}>{error}</p>
          <button
            onClick={() => refetch()}
            className={styles.modalButtonPrimary}
            style={{ width: "auto", marginTop: "1rem" }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <HeaderMobile title="Réponses" />

      <div className={styles.pageContent}>
        {/* Welcome / Event Selector Section */}
        <div className={styles.pageHeader}>
          <div className={styles.headerTitleSection}>
            <h1 className={styles.mainTitle}>Vos Messages</h1>
            <p className={styles.pageSubtitle}>
              {selectedInvitationId === "all"
                ? "Consultez les réponses de tous vos événements"
                : `Réponses pour "${invitations.find((i) => i.id === selectedInvitationId)?.eventTitle}"`}
            </p>
          </div>

          {invitations.length > 0 && (
            <div className={styles.invitationSelectorWrapper}>
              <select
                value={selectedInvitationId}
                onChange={(e) => handleInvitationChange(e.target.value)}
                className={styles.invitationSelect}
                aria-label="Sélectionner l'événement"
              >
                <option value="all">Tous les événements</option>
                {invitations.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.eventTitle}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Barre de Recherche */}
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou contenu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Grille de Messages */}
        <div className={styles.messagesGrid}>
          {filteredMessages.map((message) => {
            const statusClass = message.status.toLowerCase();
            const avatarClass = `avatar${statusClass.charAt(0).toUpperCase() + statusClass.slice(1)}`;
            const hasMessage = message.message && message.message.trim() !== "";

            return (
              <div
                key={message.id}
                className={styles.messageCard}
                onClick={() => setSelectedMessage(message)}
              >
                <div className={styles.messageCardHeader}>
                  <div
                    className={`${styles.guestAvatar} ${styles[avatarClass]}`}
                  >
                    {getInitials(
                      message.guest.firstName,
                      message.guest.lastName,
                    )}
                  </div>

                  <div className={styles.guestInfo}>
                    <p className={styles.guestName}>
                      {message.guest.firstName} {message.guest.lastName}
                    </p>
                    <p className={styles.guestEmail}>
                      <Mail size={12} /> {message.guest.email}
                    </p>
                  </div>

                  <div
                    className={`${styles.statusBadge} ${styles[statusClass]}`}
                  >
                    {getStatusLabel(message.status)}
                  </div>
                </div>

                <div className={styles.messageBody}>
                  <p className={styles.invitationTitleBadge}>
                    <Calendar size={12} /> {message.invitation.eventTitle}
                  </p>
                  <div
                    className={`${styles.messageText} ${!hasMessage ? styles.noMessage : ""}`}
                  >
                    {hasMessage
                      ? message.message.length > 120
                        ? `${message.message.substring(0, 120)}...`
                        : message.message
                      : "Aucun message particulier"}
                  </div>
                </div>

                <div className={styles.messageFooter}>
                  <p className={styles.messageDate}>
                    <Clock size={12} /> {formatDate(message.createdAt)}
                  </p>
                  <div className={styles.viewAction}>
                    Détails <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* État Vide */}
        {filteredMessages.length === 0 && (
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIconWrapper}>
              <MessageSquare size={48} />
            </div>
            <h3 className={styles.emptyTitle}>
              {searchQuery ? "Aucun résultat" : "Aucune réponse"}
            </h3>
            <p className={styles.emptyText}>
              {searchQuery
                ? `Nous n'avons trouvé aucun message correspondant à "${searchQuery}"`
                : "Les réponses de vos invités apparaîtront ici dès qu'ils auront complété leur RSVP."}
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedMessage && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Détails de la réponse</h2>
              <button
                onClick={() => setSelectedMessage(null)}
                className={styles.modalClose}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <p className={styles.detailLabel}>Invité</p>
                <p className={styles.detailValue}>
                  <User size={16} /> {selectedMessage.guest.firstName}{" "}
                  {selectedMessage.guest.lastName}
                </p>
              </div>

              <div className={styles.detailSection}>
                <p className={styles.detailLabel}>Contact & Statut</p>
                <div
                  style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                >
                  <p className={styles.detailValue}>
                    <Mail size={14} /> {selectedMessage.guest.email}
                  </p>
                  {selectedMessage.guest.phone && (
                    <p className={styles.detailValue}>
                      <Phone size={14} /> {selectedMessage.guest.phone}
                    </p>
                  )}
                  <span
                    className={`${styles.statusBadge} ${styles[selectedMessage.status.toLowerCase()]}`}
                  >
                    {getStatusLabel(selectedMessage.status)}
                  </span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <p className={styles.detailLabel}>Événement</p>
                <p className={styles.detailValue}>
                  <Calendar size={16} /> {selectedMessage.invitation.eventTitle}
                </p>
              </div>

              <div className={styles.detailSection}>
                <p className={styles.detailLabel}>Message de l'invité</p>
                <div className={styles.modalMessageBox}>
                  {selectedMessage.message &&
                  selectedMessage.message.trim() !== ""
                    ? selectedMessage.message
                    : "L'invité n'a pas laissé de message particulier."}
                </div>
              </div>

              {/* Extras */}
              {(selectedMessage.guest.plusOne ||
                selectedMessage.guest.dietaryRestrictions) && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  {selectedMessage.guest.plusOne && (
                    <div className={styles.detailSection}>
                      <p className={styles.detailLabel}>Accompagnants</p>
                      <p className={styles.detailValue}>
                        {selectedMessage.guest.plusOneName || "1 personne"}
                      </p>
                    </div>
                  )}
                  {selectedMessage.guest.dietaryRestrictions && (
                    <div className={styles.detailSection}>
                      <p className={styles.detailLabel}>Régime / Allégie</p>
                      <p className={styles.detailValue}>
                        {selectedMessage.guest.dietaryRestrictions}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className={styles.detailSection}>
                <p className={styles.detailLabel}>Répondu le</p>
                <p className={styles.detailValue}>
                  <Clock size={16} /> {formatDate(selectedMessage.createdAt)}
                </p>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={() => setSelectedMessage(null)}
                className={styles.modalButtonPrimary}
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
