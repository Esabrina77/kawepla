'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRSVPMessages } from '@/hooks/useRSVPMessages';
import { useInvitations } from '@/hooks/useInvitations';
import { useNotifications } from '@/hooks/useNotifications';
import { RSVPMessage } from '@/types';
import { HeaderMobile } from '@/components/HeaderMobile';
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
  Bell,
  X
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

  // Filtrer les messages : uniquement ceux qui ont un message non vide
  const filteredMessages = messages.filter(message => {
    // Exclure les messages vides ou null
    if (!message.message || message.message.trim() === '') {
      return false;
    }
    
    // Si pas de recherche, retourner tous les messages avec contenu
    if (!searchQuery.trim()) return true;
    
    // Filtrer par terme de recherche
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
      <HeaderMobile title="Vos Messages" />

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
        {filteredMessages.map((message) => {
          const hasMessage = message.message && message.message.trim() !== '';
          const statusClass = message.status.toLowerCase();
          const avatarClass = `avatar${statusClass.charAt(0).toUpperCase() + statusClass.slice(1)}`;
          
          return (
            <div key={message.id} className={styles.messageCard}>
              {/* Header avec avatar, nom, email et statut */}
            <div className={styles.messageCardHeader}>
                <div className={`${styles.guestAvatar} ${styles[avatarClass]}`}>
                {getInitials(message.guest.firstName, message.guest.lastName)}
              </div>
              
              <div className={styles.guestInfo}>
                  <p className={styles.guestName}>
                  {message.guest.firstName} {message.guest.lastName}
                  </p>
                  <p className={styles.guestEmail}>
                  {message.guest.email}
                  </p>
                </div>
                
                <div className={`${styles.statusBadge} ${styles[statusClass]}`}>
                  <div className={styles.statusDot}></div>
                  {getStatusLabel(message.status)}
                </div>
              </div>
              
              {/* Contenu : titre invitation, message, date */}
              <div className={styles.messageContent}>
                <p className={styles.invitationTitle}>
                {message.invitation.eventTitle}
                </p>
                <p className={`${styles.messageText} ${!hasMessage ? styles.noMessage : ''}`}>
                  {hasMessage ? message.message : 'Aucun message'}
                </p>
                <p className={styles.messageDate}>
                  {formatDate(message.createdAt)}
                </p>
              </div>

              {/* Bouton Voir détails */}
              <button
                onClick={() => setSelectedMessage(message)}
                className={styles.viewDetailsButton}
              >
                Voir détail du message
              </button>
            </div>
          );
        })}
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
        <div className={styles.modalOverlay} onClick={() => setSelectedMessage(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Détail du message</h2>
            <button
              onClick={() => setSelectedMessage(null)}
              className={styles.modalCloseButton}
            >
                <X size={20} />
            </button>
              </div>
              
            {/* Modal Body */}
            <div className={styles.modalBody}>
              <div className={styles.modalDetailRow}>
                <span className={styles.modalDetailLabel}>Nom complet</span>
                <span className={styles.modalDetailValue}>
                  {selectedMessage.guest.firstName} {selectedMessage.guest.lastName}
                </span>
              </div>
                
              <div className={styles.modalDetailRow}>
                <span className={styles.modalDetailLabel}>Email</span>
                <span className={`${styles.modalDetailValue} ${styles.modalEmail}`}>
                  {selectedMessage.guest.email}
                </span>
                </div>
                
                {selectedMessage.guest.phone && (
                <div className={styles.modalDetailRow}>
                  <span className={styles.modalDetailLabel}>Téléphone</span>
                  <span className={styles.modalDetailValue}>
                    {selectedMessage.guest.phone}
                  </span>
                  </div>
                )}
                
              <div className={styles.modalDivider}></div>

              <div className={styles.modalDetailRow}>
                <span className={styles.modalDetailLabel}>Statut RSVP</span>
                <span className={styles.modalDetailValue}>
                  {getStatusLabel(selectedMessage.status)} {selectedMessage.status === 'CONFIRMED' && '✅'}
                </span>
              </div>

              <div className={styles.modalDetailRow}>
                <span className={styles.modalDetailLabel}>Titre invitation</span>
                <span className={styles.modalDetailValue}>
                  {selectedMessage.invitation.eventTitle}
                </span>
              </div>

              <div className={styles.modalMessageSection}>
                <span className={styles.modalDetailLabel}>Message</span>
                <div className={styles.modalMessageBox}>
                  {selectedMessage.message && selectedMessage.message.trim() !== '' 
                    ? selectedMessage.message 
                    : 'Aucun message'}
                </div>
              </div>

              <div className={styles.modalDivider}></div>

              {selectedMessage.guest.plusOne && (
                <div className={styles.modalDetailRow}>
                  <span className={styles.modalDetailLabel}>Accompagnants</span>
                  <span className={styles.modalDetailValue}>
                    {selectedMessage.guest.plusOneName ? '1' : '0'}
                  </span>
                  </div>
                )}
                
                {selectedMessage.guest.dietaryRestrictions && (
                <div className={styles.modalMessageSection}>
                  <span className={styles.modalDetailLabel}>Restrictions alimentaires</span>
                  <p className={styles.modalDetailValue}>
                    {selectedMessage.guest.dietaryRestrictions}
                  </p>
                  </div>
                )}

              <div className={styles.modalDetailRow}>
                <span className={styles.modalDetailLabel}>Répondu le</span>
                <span className={styles.modalDetailValue}>
                {formatDate(selectedMessage.createdAt)}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={styles.modalFooter}>
              <button
                onClick={() => setSelectedMessage(null)}
                className={styles.modalCloseButtonMain}
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