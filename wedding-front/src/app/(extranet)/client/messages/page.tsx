'use client';

import { useState } from 'react';
import styles from './messages.module.css';
import Image from 'next/image';
import { useRSVPMessages } from '@/hooks/useRSVPMessages';
import { RSVPMessage } from '@/types';

export default function MessagesPage() {
  const { messages, loading, error, refetch } = useRSVPMessages();
  const [selectedMessage, setSelectedMessage] = useState<RSVPMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fonction helper pour vérifier si une chaîne contient le terme de recherche
  const containsSearchTerm = (value: string | null | undefined, searchTerm: string): boolean => {
    if (!value || !searchTerm) return false;
    return value.toLowerCase().includes(searchTerm.toLowerCase());
  };

  // Filtrer les messages par terme de recherche et exclure les messages vides
  const filteredMessages = messages.filter(message => {
    // Exclure les messages vides ou contenant seulement des espaces
    if (!message.message || !message.message.trim()) {
      return false;
    }
    
    if (!searchTerm.trim()) return true;
    
    return (
      containsSearchTerm(message.guest.firstName, searchTerm) ||
      containsSearchTerm(message.guest.lastName, searchTerm) ||
      containsSearchTerm(message.guest.email, searchTerm) ||
      containsSearchTerm(message.invitation.title, searchTerm) ||
      containsSearchTerm(message.message, searchTerm)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return styles.statusConfirmed;
      case 'DECLINED':
        return styles.statusDeclined;
      case 'PENDING':
        return styles.statusPending;
      default:
        return styles.statusPending;
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

  if (loading) {
    return (
      <div className={styles.messagesContainer}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement des messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.messagesContainer}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={refetch} className={styles.retryButton}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.messagesContainer}>
      <div className={styles.header}>
        <h1>Messages de vos invités</h1>
        <p>Messages laissés par vos invités lors de leur réponse</p>
      </div>

      <div className={styles.content}>
        {/* Liste des messages */}
        <div className={styles.messagesList}>
          <div className={styles.searchBar}>
            <input 
              type="search" 
              placeholder="Rechercher un message..." 
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.messagesGrid}>
            {filteredMessages.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>💌</div>
                <h3>Aucun message</h3>
                <p>Vos invités n'ont pas encore laissé de messages avec leurs réponses RSVP.</p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div 
                  key={message.id} 
                  className={`${styles.messageCard} ${selectedMessage?.id === message.id ? styles.selected : ''}`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className={styles.messageHeader}>
                    <div className={styles.guestAvatar}>
                      <span>{getInitials(message.guest.firstName, message.guest.lastName)}</span>
                    </div>
                    <div className={styles.guestInfo}>
                      <h3>{message.guest.firstName} {message.guest.lastName}</h3>
                      <p className={styles.guestEmail}>{message.guest.email}</p>
                      <p className={styles.invitationTitle}>{message.invitation.title}</p>
                    </div>
                    <div className={styles.messageStatus}>
                      <span className={`${styles.statusBadge} ${getStatusColor(message.status)}`}>
                        {getStatusLabel(message.status)}
                      </span>
                      <span className={styles.messageDate}>
                        {formatDate(message.respondedAt || message.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.messagePreview}>
                    <p>{message.message}</p>
                  </div>
                  
                  <div className={styles.messageDetails}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Invités:</span>
                      <span className={styles.detailValue}>{message.numberOfGuests}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Cérémonie:</span>
                      <span className={styles.detailValue}>
                        {message.attendingCeremony ? '✓ Oui' : '✗ Non'}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Réception:</span>
                      <span className={styles.detailValue}>
                        {message.attendingReception ? '✓ Oui' : '✗ Non'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Détail du message sélectionné */}
        {selectedMessage && (
          <>
            <div className={styles.modalOverlay} onClick={() => setSelectedMessage(null)}>
            </div>
            <div className={styles.messageDetail}>
              <div className={styles.detailHeader}>
                <div className={styles.detailGuestInfo}>
                  <div className={styles.detailAvatar}>
                    <span>{getInitials(selectedMessage.guest.firstName, selectedMessage.guest.lastName)}</span>
                  </div>
                  <div>
                    <h2>{selectedMessage.guest.firstName} {selectedMessage.guest.lastName}</h2>
                    <p className={styles.detailEmail}>{selectedMessage.guest.email}</p>
                  </div>
                </div>
                <button 
                  className={styles.closeButton}
                  onClick={() => setSelectedMessage(null)}
                >
                  ✕
                </button>
              </div>

              <div className={styles.detailContent}>
                <div className={styles.detailSection}>
                  <h3>Message</h3>
                  <div className={styles.messageText}>
                    <p>{selectedMessage.message}</p>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>Détails de la réponse</h3>
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailCard}>
                      <span className={styles.detailCardLabel}>Statut</span>
                      <span className={`${styles.statusBadge} ${getStatusColor(selectedMessage.status)}`}>
                        {getStatusLabel(selectedMessage.status)}
                      </span>
                    </div>
                    <div className={styles.detailCard}>
                      <span className={styles.detailCardLabel}>Nombre d'invités</span>
                      <span className={styles.detailCardValue}>{selectedMessage.numberOfGuests}</span>
                    </div>
                    <div className={styles.detailCard}>
                      <span className={styles.detailCardLabel}>Cérémonie</span>
                      <span className={styles.detailCardValue}>
                        {selectedMessage.attendingCeremony ? 'Oui' : 'Non'}
                      </span>
                    </div>
                    <div className={styles.detailCard}>
                      <span className={styles.detailCardLabel}>Réception</span>
                      <span className={styles.detailCardValue}>
                        {selectedMessage.attendingReception ? 'Oui' : 'Non'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>Invitation</h3>
                  <div className={styles.invitationInfo}>
                    <h4>Informations de l'invitation</h4>
                    <p><strong>Répondu le:</strong> {formatDate(selectedMessage.respondedAt || selectedMessage.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 