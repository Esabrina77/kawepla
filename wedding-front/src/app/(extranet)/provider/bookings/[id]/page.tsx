"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { bookingsApi, Booking } from "@/lib/api/bookings";
import { HeaderMobile } from "@/components/HeaderMobile/HeaderMobile";
import {
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  MessageSquare,
  Euro,
  CheckCircle,
  XCircle,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import styles from "./booking-detail.module.css";

const EVENT_TYPES: Record<string, string> = {
  WEDDING: "Mariage",
  BIRTHDAY: "Anniversaire",
  BAPTISM: "Baptême",
  ANNIVERSARY: "Anniversaire de mariage",
  GRADUATION: "Remise de diplôme",
  BABY_SHOWER: "Baby shower",
  CORPORATE: "Événement d'entreprise",
  OTHER: "Autre",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  CANCELLED: "Annulé",
  COMPLETED: "Terminé",
  DISPUTED: "Litige",
};

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await bookingsApi.getBookingById(bookingId);
        setBooking(response.booking);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement de la réservation",
        );
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!booking) return;

    try {
      setUpdating(true);
      await bookingsApi.updateBookingStatus(booking.id, newStatus);

      // Mettre à jour localement
      setBooking({ ...booking, status: newStatus as any });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la mise à jour du statut",
      );
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string, timeString?: string) => {
    const date = new Date(dateString);
    let formatted = date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    if (timeString) {
      formatted += ` à ${timeString}`;
    }

    return formatted;
  };

  if (loading) {
    return (
      <div className={styles.bookingDetailPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement de la réservation...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className={styles.bookingDetailPage}>
        <div className={styles.errorContainer}>
          <p>{error || "Réservation non trouvée"}</p>
          <Link href="/provider/bookings" className={styles.backButton}>
            <ArrowLeft size={16} />
            Retour aux réservations
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = {
    PENDING: { label: "En attente", color: "#f39c12", icon: Clock },
    CONFIRMED: { label: "Confirmé", color: "#27ae60", icon: CheckCircle },
    COMPLETED: { label: "Terminé", color: "#3498db", icon: CheckCircle },
    CANCELLED: { label: "Annulé", color: "#e74c3c", icon: XCircle },
    DISPUTED: { label: "Litige", color: "#9b59b6", icon: XCircle },
  }[booking.status] || { label: "Inconnu", color: "#6c757d", icon: Clock };

  const StatusIcon = statusInfo.icon;

  return (
    <div className={styles.bookingDetailPage}>
      <HeaderMobile title={`Réservation #${booking.id.substring(0, 8)}`} />

      <div className={styles.pageContent}>
        {/* Header Compact */}
        <div className={styles.statusHeader}>
          <Link href="/provider/bookings" className={styles.backLink}>
            <ArrowLeft size={14} />
            Réservations
          </Link>
          <div
            className={styles.statusBadge}
            style={{
              backgroundColor: statusInfo.color + "15",
              color: statusInfo.color,
            }}
          >
            <StatusIcon size={12} />
            <span>{statusInfo.label}</span>
          </div>
        </div>

        <div className={styles.mainGrid}>
          {/* Left Column: Client & Event */}
          <div className={styles.infoColumn}>
            {/* Client Info Card */}
            <section className={styles.section}>
              <div className={styles.sectionTitle}>Client</div>
              <div className={styles.card}>
                <div className={styles.infoList}>
                  <div className={styles.infoLine}>
                    <span className={styles.infoLabel}>Nom</span>
                    <span className={styles.infoValue}>
                      {booking.clientName}
                    </span>
                  </div>
                  <div className={styles.infoLine}>
                    <span className={styles.infoLabel}>Email</span>
                    <span className={styles.infoValue}>
                      {booking.clientEmail}
                    </span>
                  </div>
                  {booking.clientPhone && (
                    <div className={styles.infoLine}>
                      <span className={styles.infoLabel}>Tel</span>
                      <span className={styles.infoValue}>
                        {booking.clientPhone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Event Details Card */}
            <section
              className={styles.section}
              style={{ marginTop: "1.25rem" }}
            >
              <div className={styles.sectionTitle}>L'événement</div>
              <div className={styles.card}>
                <div className={styles.compactDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.infoLabel}>Date</span>
                    <span className={styles.infoValue}>
                      {formatDate(booking.eventDate)}
                    </span>
                  </div>
                  {booking.eventTime && (
                    <div className={styles.detailItem}>
                      <span className={styles.infoLabel}>Heure</span>
                      <span className={styles.infoValue}>
                        {booking.eventTime}
                      </span>
                    </div>
                  )}
                  <div className={styles.detailItem}>
                    <span className={styles.infoLabel}>Type</span>
                    <span className={styles.infoValue}>
                      {EVENT_TYPES[booking.eventType] || booking.eventType}
                    </span>
                  </div>
                  {booking.guestCount && (
                    <div className={styles.detailItem}>
                      <span className={styles.infoLabel}>Invités</span>
                      <span className={styles.infoValue}>
                        {booking.guestCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Message Card */}
            {booking.message && (
              <section
                className={styles.section}
                style={{ marginTop: "1.25rem" }}
              >
                <div className={styles.sectionTitle}>Message</div>
                <div className={styles.messageCard}>
                  <p className={styles.messageText}>"{booking.message}"</p>
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Service, Price & Actions */}
          <div className={styles.sideColumn}>
            {/* Service & Price Block */}
            <section className={styles.section}>
              <div className={styles.sectionTitle}>Prestation</div>
              <div className={styles.card}>
                <div className={styles.servicePriceBlock}>
                  <div>
                    <h3 className={styles.serviceTitle}>
                      {booking.service?.name ||
                        booking.customServiceName ||
                        "Service personnalisé"}
                    </h3>
                    {booking.service?.category && (
                      <span className={styles.categoryLabel}>
                        {booking.service.category.name}
                      </span>
                    )}
                  </div>

                  <div className={styles.priceDisplay}>
                    <span className={styles.priceLabel}>Montant total</span>
                    <span className={styles.priceValue}>
                      {booking.totalPrice}€
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* History Card */}
            <section
              className={styles.section}
              style={{ marginTop: "1.25rem" }}
            >
              <div className={styles.sectionTitle}>Statut</div>
              <div className={styles.card}>
                <div className={styles.historyList}>
                  <div className={styles.historyItem}>
                    <span className={styles.infoLabel}>Créée</span>
                    <span className={styles.infoValue}>
                      {formatDateTime(booking.createdAt)}
                    </span>
                  </div>
                  {booking.confirmedAt && (
                    <div className={styles.historyItem}>
                      <span className={styles.infoLabel}>Confirmée</span>
                      <span className={styles.infoValue}>
                        {formatDateTime(booking.confirmedAt)}
                      </span>
                    </div>
                  )}
                  {booking.completedAt && (
                    <div className={styles.historyItem}>
                      <span className={styles.infoLabel}>Terminée</span>
                      <span className={styles.infoValue}>
                        {formatDateTime(booking.completedAt)}
                      </span>
                    </div>
                  )}
                  {booking.cancelledAt && (
                    <div className={styles.historyItem}>
                      <span className={styles.infoLabel}>Annulée</span>
                      <span className={styles.infoValue}>
                        {formatDateTime(booking.cancelledAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Actions Section */}
            <div className={styles.actionsSection}>
              {booking.status === "PENDING" && (
                <div className={styles.statusGroup}>
                  <button
                    onClick={() => handleStatusUpdate("CONFIRMED")}
                    disabled={updating}
                    className={`${styles.actionButton} ${styles.confirmButton}`}
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("CANCELLED")}
                    disabled={updating}
                    className={`${styles.actionButton} ${styles.cancelButton}`}
                  >
                    Refuser
                  </button>
                </div>
              )}

              {booking.status === "CONFIRMED" && (
                <button
                  onClick={() => handleStatusUpdate("COMPLETED")}
                  disabled={updating}
                  className={`${styles.actionButton} ${styles.confirmButton}`}
                >
                  Terminer la mission
                </button>
              )}

              {/* Conversation link */}
              {(booking as any).conversationId && (
                <Link
                  href={`/provider/messages?conversationId=${(booking as any).conversationId}`}
                  className={`${styles.actionButton} ${styles.conversationLink}`}
                >
                  <MessageSquare size={14} />
                  Accéder au chat
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
