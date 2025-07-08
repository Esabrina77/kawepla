'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/apiClient';
import styles from './invitation-detail.module.css';

interface InvitationDetail {
  id: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
  };
  guests: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    invitationSentAt: string | null;
    createdAt: string;
    rsvp: {
      id: string;
      status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
      respondedAt: string | null;
    } | null;
  }>;
  _count: {
    guests: number;
    rsvps: number;
  };
}

export default function InvitationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invitationId = params.id as string;
  
  const [invitation, setInvitation] = useState<InvitationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitationDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient.get<InvitationDetail>(`/admin/invitations/${invitationId}`);
      setInvitation(data);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'invitation:', err);
      setError('Erreur lors du chargement de l\'invitation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (invitationId) {
      fetchInvitationDetail();
    }
  }, [invitationId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return styles.statusPublished;
      case 'DRAFT':
        return styles.statusDraft;
      case 'ARCHIVED':
        return styles.statusArchived;
      default:
        return styles.statusDefault;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'Publiée';
      case 'DRAFT':
        return 'Brouillon';
      case 'ARCHIVED':
        return 'Archivée';
      default:
        return status;
    }
  };

  const getRSVPStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return styles.rsvpConfirmed;
      case 'DECLINED':
        return styles.rsvpDeclined;
      case 'PENDING':
        return styles.rsvpPending;
      default:
        return styles.rsvpDefault;
    }
  };

  const getRSVPStatusLabel = (status: string) => {
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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Chargement de l'invitation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
        <button onClick={fetchInvitationDetail} className={styles.retryButton}>
          Réessayer
        </button>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Invitation non trouvée</div>
      </div>
    );
  }

  const confirmedRSVPs = invitation.guests.filter(g => g.rsvp?.status === 'CONFIRMED').length;
  const declinedRSVPs = invitation.guests.filter(g => g.rsvp?.status === 'DECLINED').length;
  const pendingRSVPs = invitation.guests.filter(g => g.rsvp?.status === 'PENDING').length;
  const sentInvitations = invitation.guests.filter(g => g.invitationSentAt).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          onClick={() => window.history.back()} 
          className={styles.backButton}
        >
          ← Retour
        </button>
        <h1>{invitation.title}</h1>
        <span className={`${styles.status} ${getStatusColor(invitation.status)}`}>
          {getStatusLabel(invitation.status)}
        </span>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h2>Informations de l'invitation</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>Créateur</h3>
              <p>{invitation.user.firstName} {invitation.user.lastName}</p>
              <p className={styles.email}>{invitation.user.email}</p>
            </div>
            <div className={styles.infoCard}>
              <h3>Date de création</h3>
              <p>{new Date(invitation.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className={styles.infoCard}>
              <h3>Dernière modification</h3>
              <p>{new Date(invitation.updatedAt).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className={styles.infoCard}>
              <h3>Description</h3>
              <p>{invitation.description || 'Aucune description'}</p>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Statistiques</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Total invités</h3>
              <span className={styles.statNumber}>{invitation._count.guests}</span>
            </div>
            <div className={styles.statCard}>
              <h3>Invitations envoyées</h3>
              <span className={styles.statNumber}>{sentInvitations}</span>
            </div>
            <div className={styles.statCard}>
              <h3>Confirmations</h3>
              <span className={styles.statNumber}>{confirmedRSVPs}</span>
            </div>
            <div className={styles.statCard}>
              <h3>Déclinés</h3>
              <span className={styles.statNumber}>{declinedRSVPs}</span>
            </div>
            <div className={styles.statCard}>
              <h3>En attente</h3>
              <span className={styles.statNumber}>{pendingRSVPs}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Liste des invités</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Invitation envoyée</th>
                  <th>Statut RSVP</th>
                  <th>Date de réponse</th>
                </tr>
              </thead>
              <tbody>
                {invitation.guests.map((guest) => (
                  <tr key={guest.id}>
                    <td className={styles.nameCell}>
                      {guest.firstName} {guest.lastName}
                    </td>
                    <td className={styles.emailCell}>
                      {guest.email}
                    </td>
                    <td className={styles.sentCell}>
                      {guest.invitationSentAt ? (
                        <span className={styles.sent}>✓ Envoyée</span>
                      ) : (
                        <span className={styles.notSent}>Non envoyée</span>
                      )}
                    </td>
                    <td>
                      {guest.rsvp ? (
                        <span className={`${styles.rsvpStatus} ${getRSVPStatusColor(guest.rsvp.status)}`}>
                          {getRSVPStatusLabel(guest.rsvp.status)}
                        </span>
                      ) : (
                        <span className={`${styles.rsvpStatus} ${styles.rsvpDefault}`}>
                          Aucune réponse
                        </span>
                      )}
                    </td>
                    <td className={styles.dateCell}>
                      {guest.rsvp?.respondedAt ? 
                        new Date(guest.rsvp.respondedAt).toLocaleDateString('fr-FR') : 
                        '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className={styles.actionsSection}>
          <h3>Actions</h3>
          <div className={styles.actions}>
            <button 
              className={styles.actionButton}
              onClick={() => router.push(`/super-admin/invitations/${invitationId}/design`)}
            >
              Voir le design
            </button>
            <button 
              className={styles.actionButton}
              onClick={() => router.push(`/rsvp/${invitationId}`)}
            >
              Voir la page publique
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 