'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Filter, 
  CheckCircle, 
  Clock, 
  XCircle,
  Euro,
  Users,
  MapPin,
  Phone, 
  Mail, 
  MessageSquare
} from 'lucide-react';
import styles from './bookings.module.css';

// Types temporaires - à remplacer par l'API réelle
interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  eventDate: string;
  eventTime?: string;
  eventType: string;
  guestCount?: number;
  message?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'DISPUTED';
  totalPrice: number;
  serviceName: string;
  createdAt: string;
}

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });

  // Données de démonstration - à remplacer par l'API réelle
  useEffect(() => {
    const mockBookings: Booking[] = [
      {
        id: '1',
        clientName: 'Marie Dubois',
        clientEmail: 'marie@email.com',
        clientPhone: '06 12 34 56 78',
        eventDate: '2024-06-15',
        eventTime: '15:00',
        eventType: 'WEDDING',
        guestCount: 80,
        message: 'Nous souhaitons une ambiance romantique pour notre mariage',
        status: 'CONFIRMED',
        totalPrice: 1200,
        serviceName: 'Séance photo mariage',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        clientName: 'Pierre Martin',
        clientEmail: 'pierre@email.com',
        eventDate: '2024-07-20',
        eventTime: '18:00',
        eventType: 'BIRTHDAY',
        guestCount: 30,
        status: 'PENDING',
        totalPrice: 800,
        serviceName: 'Photographie événement',
        createdAt: '2024-01-20T14:15:00Z'
      },
      {
        id: '3',
        clientName: 'Sophie Laurent',
        clientEmail: 'sophie@email.com',
        clientPhone: '06 98 76 54 32',
        eventDate: '2024-05-10',
        eventTime: '16:30',
        eventType: 'BAPTISM',
        guestCount: 25,
        message: 'Cérémonie en extérieur, prévoir équipement pour la pluie',
        status: 'COMPLETED',
        totalPrice: 600,
        serviceName: 'Reportage baptême',
        createdAt: '2024-01-10T09:45:00Z'
      }
    ];

    setTimeout(() => {
      setBookings(mockBookings);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    const newStats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'PENDING').length,
      confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
      completed: bookings.filter(b => b.status === 'COMPLETED').length,
      cancelled: bookings.filter(b => b.status === 'CANCELLED').length
    };
    setStats(newStats);
  }, [bookings]);

  const filteredBookings = bookings.filter(booking => {
    if (selectedFilter === 'all') return true;
    return booking.status.toLowerCase() === selectedFilter.toLowerCase();
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'En attente', color: '#f39c12', icon: Clock };
      case 'CONFIRMED':
        return { label: 'Confirmé', color: '#27ae60', icon: CheckCircle };
      case 'COMPLETED':
        return { label: 'Terminé', color: '#3498db', icon: CheckCircle };
      case 'CANCELLED':
        return { label: 'Annulé', color: '#e74c3c', icon: XCircle };
      case 'DISPUTED':
        return { label: 'Litige', color: '#9b59b6', icon: XCircle };
      default:
        return { label: 'Inconnu', color: '#6c757d', icon: Clock };
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case 'WEDDING': return 'Mariage';
      case 'BIRTHDAY': return 'Anniversaire';
      case 'BAPTISM': return 'Baptême';
      case 'ANNIVERSARY': return 'Anniversaire de mariage';
      case 'GRADUATION': return 'Remise de diplôme';
      case 'BABY_SHOWER': return 'Baby shower';
      case 'CORPORATE': return 'Événement d\'entreprise';
      default: return 'Autre';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    // TODO: Implémenter l'API de mise à jour du statut
    console.log(`Mise à jour du statut de la réservation ${bookingId} vers ${newStatus}`);
    
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: newStatus as any }
        : booking
    ));
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
    <div className={styles.bookingsContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.badge}>
          <Calendar style={{ width: '16px', height: '16px' }} />
          Gestion des réservations
        </div>
        
        <h1 className={styles.title}>
          Mes <span className={styles.titleAccent}>réservations</span>
        </h1>
        
        <p className={styles.subtitle}>
          Gérez les demandes de vos clients et suivez vos événements
        </p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Calendar size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.total}</h3>
            <p>Total réservations</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Clock size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.pending}</h3>
          <p>En attente</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <CheckCircle size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.confirmed}</h3>
          <p>Confirmées</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Euro size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{bookings.reduce((sum, b) => sum + b.totalPrice, 0)}€</h3>
          <p>Chiffre d'affaires</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersContainer}>
        <div className={styles.filterGroup}>
          <Filter size={16} />
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
        </div>
      </div>

      {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className={styles.emptyState}>
          <Calendar className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>Aucune réservation</h3>
          <p className={styles.emptyText}>
            {selectedFilter === 'all' 
              ? 'Vous n\'avez pas encore de réservations'
              : `Aucune réservation avec le statut "${selectedFilter}"`
            }
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
                  style={{ backgroundColor: statusInfo.color + '20', borderColor: statusInfo.color }}
                >
                  <StatusIcon size={12} />
                  <span style={{ color: statusInfo.color }}>{statusInfo.label}</span>
                </div>

                {/* Booking Header */}
                <div className={styles.bookingHeader}>
                  <h3 className={styles.clientName}>{booking.clientName}</h3>
                  <div className={styles.serviceName}>{booking.serviceName}</div>
              </div>

                {/* Event Details */}
                <div className={styles.eventDetails}>
                  <div className={styles.eventDate}>
                    <Calendar size={14} />
                    <span>{formatDate(booking.eventDate)}</span>
                  </div>
                  
                  {booking.eventTime && (
                    <div className={styles.eventTime}>
                      <Clock size={14} />
                      <span>{formatTime(booking.eventTime)}</span>
                    </div>
                  )}
                  
                  <div className={styles.eventType}>
                    {getEventTypeLabel(booking.eventType)}
                  </div>
                </div>

                {/* Client Info */}
                <div className={styles.clientInfo}>
                  <div className={styles.clientContact}>
                    <Mail size={14} />
                    <span>{booking.clientEmail}</span>
                  </div>
                  
                  {booking.clientPhone && (
                    <div className={styles.clientContact}>
                      <Phone size={14} />
                      <span>{booking.clientPhone}</span>
                    </div>
                  )}
                  
                  {booking.guestCount && (
                    <div className={styles.guestCount}>
                      <Users size={14} />
                      <span>{booking.guestCount} personnes</span>
                    </div>
                  )}
                </div>

                {/* Message */}
                {booking.message && (
                  <div className={styles.clientMessage}>
                    <MessageSquare size={14} />
                    <p>{booking.message}</p>
                </div>
                )}

                {/* Price */}
                <div className={styles.bookingPrice}>
                  <Euro size={16} />
                  <span>{booking.totalPrice}€</span>
                </div>

                {/* Actions */}
              <div className={styles.bookingActions}>
                {booking.status === 'PENDING' && (
                  <>
                    <button
                        onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                        className={`${styles.actionButton} ${styles.confirmButton}`}
                    >
                        <CheckCircle size={16} />
                      Confirmer
                    </button>
                    <button
                        onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                        className={`${styles.actionButton} ${styles.cancelButton}`}
                    >
                        <XCircle size={16} />
                      Refuser
                    </button>
                  </>
                )}
                
                {booking.status === 'CONFIRMED' && (
                  <button
                      onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                      className={`${styles.actionButton} ${styles.completeButton}`}
                  >
                      <CheckCircle size={16} />
                    Marquer comme terminé
                  </button>
                )}
                </div>
              </div>
            );
          })}
      </div>
      )}
    </div>
  );
}
