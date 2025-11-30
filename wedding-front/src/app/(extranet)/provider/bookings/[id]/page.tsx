'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { bookingsApi, Booking } from '@/lib/api/bookings';
import { HeaderMobile } from '@/components/HeaderMobile/HeaderMobile';
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
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import styles from './booking-detail.module.css';

const EVENT_TYPES: Record<string, string> = {
  WEDDING: 'Mariage',
  BIRTHDAY: 'Anniversaire',
  BAPTISM: 'Baptême',
  ANNIVERSARY: 'Anniversaire de mariage',
  GRADUATION: 'Remise de diplôme',
  BABY_SHOWER: 'Baby shower',
  CORPORATE: 'Événement d\'entreprise',
  OTHER: 'Autre'
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmé',
  CANCELLED: 'Annulé',
  COMPLETED: 'Terminé',
  DISPUTED: 'Litige'
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
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la réservation');
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
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string, timeString?: string) => {
    const date = new Date(dateString);
    let formatted = date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
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
          <p>{error || 'Réservation non trouvée'}</p>
          <Link href="/provider/bookings" className={styles.backButton}>
            <ArrowLeft size={16} />
            Retour aux réservations
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = {
    PENDING: { label: 'En attente', color: '#f39c12', icon: Clock },
    CONFIRMED: { label: 'Confirmé', color: '#27ae60', icon: CheckCircle },
    COMPLETED: { label: 'Terminé', color: '#3498db', icon: CheckCircle },
    CANCELLED: { label: 'Annulé', color: '#e74c3c', icon: XCircle },
    DISPUTED: { label: 'Litige', color: '#9b59b6', icon: XCircle }
  }[booking.status] || { label: 'Inconnu', color: '#6c757d', icon: Clock };

  const StatusIcon = statusInfo.icon;

  return (
    <div className={styles.bookingDetailPage}>
      <HeaderMobile title={`Réservation #${booking.id.substring(0, 8)}`} />

      <main className={styles.main}>
        {/* Status Badge */}
        <div 
          className={styles.statusBadge}
          style={{ backgroundColor: statusInfo.color + '20', borderColor: statusInfo.color }}
        >
          <StatusIcon size={16} />
          <span style={{ color: statusInfo.color }}>{statusInfo.label}</span>
        </div>

        {/* Client Information */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Informations client</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <strong>Nom :</strong>
              <span>{booking.clientName}</span>
            </div>
            <div className={styles.infoItem}>
              <Mail size={16} />
              <span>{booking.clientEmail}</span>
            </div>
            {booking.clientPhone && (
              <div className={styles.infoItem}>
                <Phone size={16} />
                <span>{booking.clientPhone}</span>
              </div>
            )}
          </div>
        </section>

        {/* Service Information */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Service</h2>
          <div className={styles.serviceCard}>
            <h3>{booking.service?.name || booking.customServiceName || 'Service personnalisé'}</h3>
            {booking.service?.category && (
              <p className={styles.category}>{booking.service.category.name}</p>
            )}
            {booking.customServiceDescription && (
              <p className={styles.description}>{booking.customServiceDescription}</p>
            )}
          </div>
        </section>

        {/* Event Details */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Détails de l'événement</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailCard}>
              <Calendar size={20} />
              <div>
                <strong>Date</strong>
                <p>{formatDate(booking.eventDate)}</p>
              </div>
            </div>
            
            {booking.eventTime && (
              <div className={styles.detailCard}>
                <Clock size={20} />
                <div>
                  <strong>Heure</strong>
                  <p>{booking.eventTime}</p>
                </div>
              </div>
            )}
            
            <div className={styles.detailCard}>
              <Users size={20} />
              <div>
                <strong>Type d'événement</strong>
                <p>{EVENT_TYPES[booking.eventType] || booking.eventType}</p>
              </div>
            </div>
            
            {booking.guestCount && (
              <div className={styles.detailCard}>
                <Users size={20} />
                <div>
                  <strong>Nombre d'invités</strong>
                  <p>{booking.guestCount} personnes</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Message */}
        {booking.message && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Message du client</h2>
            <div className={styles.messageCard}>
              <MessageSquare size={20} />
              <p>{booking.message}</p>
            </div>
          </section>
        )}

        {/* Price */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Montant</h2>
          <div className={styles.priceCard}>
            <Euro size={24} />
            <span className={styles.priceAmount}>{booking.totalPrice}€</span>
          </div>
        </section>

        {/* Dates */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Dates importantes</h2>
          <div className={styles.datesList}>
            <div className={styles.dateItem}>
              <strong>Créée le :</strong>
              <span>{formatDateTime(booking.createdAt)}</span>
            </div>
            {booking.confirmedAt && (
              <div className={styles.dateItem}>
                <strong>Confirmée le :</strong>
                <span>{formatDateTime(booking.confirmedAt)}</span>
              </div>
            )}
            {booking.cancelledAt && (
              <div className={styles.dateItem}>
                <strong>Annulée le :</strong>
                <span>{formatDateTime(booking.cancelledAt)}</span>
              </div>
            )}
            {booking.completedAt && (
              <div className={styles.dateItem}>
                <strong>Terminée le :</strong>
                <span>{formatDateTime(booking.completedAt)}</span>
              </div>
            )}
          </div>
        </section>

        {/* Actions */}
        {booking.status === 'PENDING' && (
          <section className={styles.actionsSection}>
            <button
              onClick={() => handleStatusUpdate('CONFIRMED')}
              disabled={updating}
              className={`${styles.actionButton} ${styles.confirmButton}`}
            >
              <CheckCircle size={20} />
              Confirmer la réservation
            </button>
            <button
              onClick={() => handleStatusUpdate('CANCELLED')}
              disabled={updating}
              className={`${styles.actionButton} ${styles.cancelButton}`}
            >
              <XCircle size={20} />
              Annuler la réservation
            </button>
          </section>
        )}

        {booking.status === 'CONFIRMED' && (
          <section className={styles.actionsSection}>
            <button
              onClick={() => handleStatusUpdate('COMPLETED')}
              disabled={updating}
              className={`${styles.actionButton} ${styles.completeButton}`}
            >
              <CheckCircle size={20} />
              Marquer comme terminé
            </button>
          </section>
        )}

        {/* Link to conversation */}
        {(booking as any).conversationId && (
          <section className={styles.section}>
            <Link 
              href={`/provider/messages?conversationId=${(booking as any).conversationId}`}
              className={styles.conversationLink}
            >
              <MessageSquare size={20} />
              Voir la conversation
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}

