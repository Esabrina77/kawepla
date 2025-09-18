'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRSVPMessages } from '@/hooks/useRSVPMessages';
import { useInvitations } from '@/hooks/useInvitations';
import { useNotifications } from '@/hooks/useNotifications';
import { RSVPMessage } from '@/types';
import styles from './messages.module.css';

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
  Users,
  Heart,
  Filter,
  Bell
} from 'lucide-react';


export default function MessagesPage() {
  const router = useRouter();
  const { invitations, loading: loadingInvitations } = useInvitations();
  const [selectedInvitationId, setSelectedInvitationId] = useState<string>('');
  const { messages, loading: loadingMessages, error, refetch } = useRSVPMessages();
  const { notifyRSVPConfirmed, notifyRSVPDeclined } = useNotifications();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<RSVPMessage | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Sélectionner automatiquement la première invitation
  useEffect(() => {
    if (invitations.length > 0 && !selectedInvitationId) {
      const publishedInvitation = invitations.find(inv => inv.status === 'PUBLISHED');
      const defaultInvitation = publishedInvitation || invitations[0];
      setSelectedInvitationId(defaultInvitation.id);
    }
  }, [invitations, selectedInvitationId]);

  // Test des notifications
  const testNotifications = () => {
    notifyRSVPConfirmed('Marie Dupont', 'événement de Sophie & Thomas');
    setTimeout(() => {
      notifyRSVPDeclined('Jean Martin', 'événement de Sophie & Thomas');
    }, 2000);
  };

  // Fonction helper pour vérifier si une chaîne contient le terme de recherche
  const containsSearchTerm = (value: string | null | undefined, searchTerm: string): boolean => {
    if (!value || !searchTerm) return false;
    return value.toLowerCase().includes(searchTerm.toLowerCase());
  };

  // Filtrer les messages par terme de recherche et exclure ceux sans message
  const filteredMessages = messages.filter(message => {
    // Exclure les messages vides ou null
    if (!message.message || message.message.trim() === '') {
      return false;
    }
    
    if (!searchQuery.trim()) return true;
    
    return (
      containsSearchTerm(message.guest.firstName, searchQuery) ||
      containsSearchTerm(message.guest.lastName, searchQuery) ||
      containsSearchTerm(message.guest.email, searchQuery) ||
      containsSearchTerm(message.invitation.eventTitle, searchQuery) ||
      containsSearchTerm(message.message, searchQuery)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'var(--alert-success)';
      case 'DECLINED':
        return 'var(--alert-error)';
      case 'PENDING':
        return 'var(--text-secondary)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle style={{ width: '16px', height: '16px' }} />;
      case 'DECLINED':
        return <XCircle style={{ width: '16px', height: '16px' }} />;
      case 'PENDING':
        return <Clock style={{ width: '16px', height: '16px' }} />;
      default:
        return <Clock style={{ width: '16px', height: '16px' }} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmé';
      case 'DECLINED':
        return 'Décliné';
      case 'PENDING':
        return 'En attente';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const truncateText = (text: string, maxLength: number = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loadingMessages) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Chargement des messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <p className={styles.errorText}>{error}</p>
          <button 
            onClick={refetch}
            className={styles.retryButton}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            <MessageSquare className={styles.titleIcon} />
            Messages RSVP
          </h1>
          <p className={styles.subtitle}>
            Consultez les messages et réponses de vos invités
          </p>
        </div>
        

      </div>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Messages Grid */}
      <div className={styles.messagesGrid}>
        {filteredMessages.map((message) => (
          <div key={message.id} 
            className={styles.messageCard}
            onClick={() => setSelectedMessage(message)}
          >
            {/* Header */}
            <div className={styles.messageCardHeader}>
              <div className={styles.guestAvatar}>
                {getInitials(message.guest.firstName, message.guest.lastName)}
              </div>
              
              <div className={styles.guestInfo}>
                <h3 className={styles.guestName}>
                  {message.guest.firstName} {message.guest.lastName}
                </h3>
                
                <div className={styles.guestEmail}>
                  <Mail className={styles.emailIcon} />
                  {message.guest.email}
                </div>
              </div>
              
              <div className={`${styles.statusBadge} ${styles[message.status.toLowerCase()]}`}>
                {getStatusIcon(message.status)}
                {getStatusLabel(message.status)}
              </div>
            </div>

            {/* Invitation Info */}
            <div className={styles.invitationInfo}>
              <div className={styles.invitationTitle}>
                <Calendar className={styles.calendarIcon} />
                {message.invitation.eventTitle}
              </div>
            </div>

            {/* Message */}
            <div className={styles.messageContent}>
              <p className={styles.messageText}>
                "{truncateText(message.message)}"
              </p>
              {message.message.length > 30 && (
                <div className={styles.messageIndicator}>
                  <span>Cliquez pour voir plus</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={styles.messageFooter}>
              <span className={styles.messageDate}>
                {formatDate(message.createdAt)}
              </span>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMessage(message);
                }}
                className={styles.viewDetailsButton}
              >
                <Eye className={styles.viewDetailsIcon} />
                Voir détails
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMessages.length === 0 && (
        <div className={styles.emptyStateContainer}>
          <MessageSquare className={styles.emptyStateIcon} />
          <h3 className={styles.emptyStateTitle}>
            {searchQuery ? 'Aucun message trouvé' : 'Aucun message pour le moment'}
          </h3>
          <p className={styles.emptyStateText}>
            {searchQuery 
              ? 'Essayez de modifier vos critères de recherche' 
              : 'Les messages de vos invités apparaîtront ici'
            }
          </p>
        </div>
      )}

      {/* Modal pour les détails */}
      {selectedMessage && (
        <div className={styles.modalOverlay}
        onClick={() => setSelectedMessage(null)}
        >
          <div className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMessage(null)}
              className={styles.modalCloseButton}
            >
              ×
            </button>

            <div className={styles.modalHeader}>
              <div className={styles.modalGuestAvatar}>
                {getInitials(selectedMessage.guest.firstName, selectedMessage.guest.lastName)}
              </div>
              
              <div className={styles.modalGuestInfo}>
                <h2>
                  {selectedMessage.guest.firstName} {selectedMessage.guest.lastName}
                </h2>
                
                <div className={styles.modalGuestEmail}>
                  <Mail style={{ width: '16px', height: '16px' }} />
                  {selectedMessage.guest.email}
                </div>
                
                {selectedMessage.guest.phone && (
                  <div className={styles.modalGuestPhone}>
                    <Phone style={{ width: '14px', height: '14px' }} />
                    {selectedMessage.guest.phone}
                  </div>
                )}
                
                {selectedMessage.guest.plusOne && selectedMessage.guest.plusOneName && (
                  <div className={styles.modalGuestPlusOne}>
                    <Users style={{ width: '14px', height: '14px' }} />
                    Accompagnant: {selectedMessage.guest.plusOneName}
                  </div>
                )}
                
                {selectedMessage.guest.dietaryRestrictions && (
                  <div className={styles.modalGuestDietary}>
                    <Heart style={{ width: '14px', height: '14px' }} />
                    Restrictions: {selectedMessage.guest.dietaryRestrictions}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalInvitationInfo}>
              <h3 className={styles.modalInvitationTitle}>
                {selectedMessage.invitation.eventTitle}
              </h3>
              
              <div className={styles.modalInvitationDate}>
                <Calendar style={{ width: '14px', height: '14px' }} />
                {formatDate(selectedMessage.createdAt)}
              </div>
            </div>

            {selectedMessage.message && (
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>
                  Message de l'invité
                </h4>
                <div className={styles.modalMessageText}>
                  "{selectedMessage.message}"
                </div>
              </div>
            )}

            <div className={styles.modalStatusSection} style={{ color: getStatusColor(selectedMessage.status) }}>
              {getStatusIcon(selectedMessage.status)}
              <span className={styles.modalStatusText}>
                Statut : {getStatusLabel(selectedMessage.status)}
              </span>
            </div>
          </div>
        </div>
      )}


    </div>
  );
} 