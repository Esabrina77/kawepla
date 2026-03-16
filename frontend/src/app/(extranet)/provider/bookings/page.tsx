"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { bookingsApi, Booking } from "@/lib/api/bookings";
import { HeaderMobile } from "@/components/HeaderMobile/HeaderMobile";
import {
  Calendar,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Euro,
  Users,
  Phone,
  Mail,
  MessageSquare,
  ChevronDown,
  Eye,
} from "lucide-react";
import Link from "next/link";
import styles from "./bookings.module.css";

export default function ProviderBookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversationId");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
  });

  // Charger les vraies données depuis l'API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Si on a un conversationId, récupérer le booking correspondant
        if (conversationId) {
          try {
            const { booking } =
              await bookingsApi.getBookingByConversationId(conversationId);
            // Rediriger vers la page de détails
            router.push(`/provider/bookings/${booking.id}`);
            return;
          } catch (err) {
            // Si pas de booking trouvé, continuer avec la liste normale
            console.error("Booking non trouvé pour cette conversation:", err);
          }
        }

        const response = await bookingsApi.getProviderBookings({
          status: selectedFilter !== "all" ? selectedFilter : undefined,
          limit: 100,
        });

        setBookings(response.bookings || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement des réservations",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [selectedFilter, conversationId, router]);

  // Charger les statistiques
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await bookingsApi.getBookingStats();
        setStats({
          total: response.stats.totalBookings,
          pending: response.stats.statusCounts.PENDING || 0,
          confirmed: response.stats.statusCounts.CONFIRMED || 0,
          completed: response.stats.statusCounts.COMPLETED || 0,
          cancelled: response.stats.statusCounts.CANCELLED || 0,
          totalRevenue: response.stats.totalRevenue || 0,
        });
      } catch (err) {
        // Ignorer les erreurs de stats
      }
    };

    fetchStats();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    if (selectedFilter === "all") return true;
    return booking.status.toLowerCase() === selectedFilter.toLowerCase();
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
        return { label: "En attente", color: "#f39c12", icon: Clock };
      case "CONFIRMED":
        return { label: "Confirmé", color: "#27ae60", icon: CheckCircle };
      case "COMPLETED":
        return { label: "Terminé", color: "#3498db", icon: CheckCircle };
      case "CANCELLED":
        return { label: "Annulé", color: "#e74c3c", icon: XCircle };
      case "DISPUTED":
        return { label: "Litige", color: "#9b59b6", icon: XCircle };
      default:
        return { label: "Inconnu", color: "#6c757d", icon: Clock };
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case "WEDDING":
        return "Mariage";
      case "BIRTHDAY":
        return "Anniversaire";
      case "BAPTISM":
        return "Baptême";
      case "ANNIVERSARY":
        return "Anniversaire de mariage";
      case "GRADUATION":
        return "Remise de diplôme";
      case "BABY_SHOWER":
        return "Baby shower";
      case "CORPORATE":
        return "Événement d'entreprise";
      default:
        return "Autre";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    // Si le format est déjà correct (HH:mm), le retourner tel quel
    if (/^\d{2}:\d{2}$/.test(timeString)) {
      return timeString;
    }
    // Sinon, essayer de parser
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timeString;
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      await bookingsApi.updateBookingStatus(bookingId, newStatus);

      // Mettre à jour localement
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: newStatus as any }
            : booking,
        ),
      );

      // Recharger les stats
      const response = await bookingsApi.getBookingStats();
      setStats({
        total: response.stats.totalBookings,
        pending: response.stats.statusCounts.PENDING || 0,
        confirmed: response.stats.statusCounts.CONFIRMED || 0,
        completed: response.stats.statusCounts.COMPLETED || 0,
        cancelled: response.stats.statusCounts.CANCELLED || 0,
        totalRevenue: response.stats.totalRevenue || 0,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la mise à jour du statut",
      );
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Chargement des réservations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <p>Erreur: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bookingsPage}>
      <HeaderMobile title="Mes réservations" />

      <div className={styles.pageContent}>
        {/* Page Title */}
        <h1 className={styles.pageTitle}>Mes réservations</h1>

        {/* Section Statistiques */}
        <section className={styles.statsSection}>
          <div className={styles.sectionTitle}>Statistiques</div>

          <div className={styles.statsGrid}>
            {/* Total réservations */}
            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <Calendar size={20} />
              </div>
              <div className={styles.statValue}>{stats.total}</div>
              <div className={styles.statLabel}>Total réservations</div>
            </div>

            {/* En attente */}
            <div className={styles.statCard}>
              <div className={`${styles.statIconWrapper} ${styles.warning}`}>
                <Clock size={20} />
              </div>
              <div className={styles.statValue}>{stats.pending}</div>
              <div className={styles.statLabel}>En attente</div>
            </div>

            {/* Confirmées */}
            <div className={styles.statCard}>
              <div className={`${styles.statIconWrapper} ${styles.success}`}>
                <CheckCircle size={20} />
              </div>
              <div className={styles.statValue}>{stats.confirmed}</div>
              <div className={styles.statLabel}>Confirmées</div>
            </div>

            {/* Terminées */}
            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <CheckCircle size={20} />
              </div>
              <div className={styles.statValue}>{stats.completed}</div>
              <div className={styles.statLabel}>Terminées</div>
            </div>

            {/* Annulées */}
            <div className={styles.statCard}>
              <div className={`${styles.statIconWrapper} ${styles.error}`}>
                <XCircle size={20} />
              </div>
              <div className={styles.statValue}>{stats.cancelled}</div>
              <div className={styles.statLabel}>Annulées</div>
            </div>

            {/* Chiffre d'affaires */}
            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <Euro size={20} />
              </div>
              <div className={styles.statValue}>{stats.totalRevenue}€</div>
              <div className={styles.statLabel}>Chiffre d'affaires</div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <div className={styles.filtersContainer}>
          <div className={styles.filterGroup}>
            <Filter size={18} className={styles.selectIcon} />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">Toutes les réservations</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmées</option>
              <option value="completed">Terminées</option>
              <option value="cancelled">Annulées</option>
            </select>
            <ChevronDown className={styles.selectIcon} size={18} />
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className={styles.emptyState}>
            <Calendar className={styles.emptyIcon} size={64} />
            <h3 className={styles.emptyTitle}>Aucune réservation</h3>
            <p className={styles.emptyText}>
              {selectedFilter === "all"
                ? "Vous n'avez pas encore reçu de réservations. Elles apparaîtront ici dès qu'un client réservera l'un de vos services."
                : `Aucune réservation trouvée pour le statut "${selectedFilter}"`}
            </p>
          </div>
        ) : (
          <div className={styles.bookingsGrid}>
            {filteredBookings.map((booking) => {
              const statusInfo = getStatusInfo(booking.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div key={booking.id} className={styles.bookingCard}>
                  {/* Status Badge */}
                  <div
                    className={styles.statusBadge}
                    style={{
                      backgroundColor: statusInfo.color + "15",
                      color: statusInfo.color,
                      border: `1px solid ${statusInfo.color}30`,
                    }}
                  >
                    <StatusIcon size={14} />
                    <span>{statusInfo.label}</span>
                  </div>

                  {/* Booking Header */}
                  <div className={styles.bookingHeader}>
                    <h3 className={styles.clientName}>{booking.clientName}</h3>
                    <div className={styles.serviceName}>
                      {booking.service?.name ||
                        booking.customServiceName ||
                        "Service personnalisé"}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className={styles.detailsGrid}>
                    <div className={styles.eventDetails}>
                      <div className={styles.detailItem}>
                        <Calendar size={18} />
                        <span>{formatDate(booking.eventDate)}</span>
                      </div>

                      {booking.eventTime && (
                        <div className={styles.detailItem}>
                          <Clock size={18} />
                          <span>{formatTime(booking.eventTime)}</span>
                        </div>
                      )}

                      <div className={styles.eventTypeBadge}>
                        {getEventTypeLabel(booking.eventType)}
                      </div>
                    </div>

                    <div className={styles.clientInfo}>
                      <div className={styles.detailItem}>
                        <Mail size={18} />
                        <span>{booking.clientEmail}</span>
                      </div>

                      {booking.clientPhone && (
                        <div className={styles.detailItem}>
                          <Phone size={18} />
                          <span>{booking.clientPhone}</span>
                        </div>
                      )}

                      {booking.guestCount && (
                        <div className={styles.detailItem}>
                          <Users size={18} />
                          <span>{booking.guestCount} invités</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  {booking.message && (
                    <div className={styles.clientMessage}>
                      <p>"{booking.message}"</p>
                    </div>
                  )}

                  {/* Footer Section: Price & Actions */}
                  <div className={styles.footerSection}>
                    <div className={styles.bookingPrice}>
                      <span className={styles.priceLabel}>Montant total</span>
                      <span className={styles.priceValue}>
                        {booking.totalPrice}€
                      </span>
                    </div>

                    <div className={styles.bookingActions}>
                      <Link
                        href={`/provider/bookings/${booking.id}`}
                        className={`${styles.actionButton} ${styles.viewButton}`}
                      >
                        <Eye size={18} />
                        Détails complets
                      </Link>

                      {booking.status === "PENDING" && (
                        <div className={styles.statusGroup}>
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking.id, "CONFIRMED")
                            }
                            className={`${styles.actionButton} ${styles.confirmButton}`}
                          >
                            <CheckCircle size={18} />
                            Accepter
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking.id, "CANCELLED")
                            }
                            className={`${styles.actionButton} ${styles.cancelButton}`}
                          >
                            <XCircle size={18} />
                            Refuser
                          </button>
                        </div>
                      )}

                      {booking.status === "CONFIRMED" && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(booking.id, "COMPLETED")
                          }
                          className={`${styles.actionButton} ${styles.confirmButton}`}
                        >
                          <CheckCircle size={18} />
                          Terminer la mission
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
