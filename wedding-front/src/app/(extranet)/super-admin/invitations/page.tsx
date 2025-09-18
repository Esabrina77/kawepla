'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/apiClient';
import styles from './invitations.module.css';

interface Invitation {
  id: string;
  eventTitle: string;        // NOUVELLE architecture
  eventDate: string;         // NOUVELLE architecture
  eventType: string;         // NOUVELLE architecture
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;            // NOUVEAU: rôle de l'utilisateur
  };
  _count: {
    guests: number;
    rsvps: number;
  };
}

export default function AdminInvitationsPage() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer toutes les invitations avec les détails des utilisateurs
      const data = await apiClient.get<Invitation[]>('/admin/invitations');
      setInvitations(data);
    } catch (err) {
      console.error('Erreur lors du chargement des invitations:', err);
      setError('Erreur lors du chargement des invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Chargement des invitations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
        <button onClick={fetchInvitations} className={styles.retryButton}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Gestion des Invitations</h1>
        <p>Vue d'ensemble de toutes les invitations d'événements créées par les utilisateurs</p>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h3>Total Invitations</h3>
          <span className={styles.statNumber}>{invitations.length}</span>
        </div>
        <div className={styles.statCard}>
          <h3>Publiées</h3>
          <span className={styles.statNumber}>
            {invitations.filter(inv => inv.status === 'PUBLISHED').length}
          </span>
        </div>
        <div className={styles.statCard}>
          <h3>Brouillons</h3>
          <span className={styles.statNumber}>
            {invitations.filter(inv => inv.status === 'DRAFT').length}
          </span>
        </div>
        <div className={styles.statCard}>
          <h3>Archivées</h3>
          <span className={styles.statNumber}>
            {invitations.filter(inv => inv.status === 'ARCHIVED').length}
          </span>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Événement</th>
              <th>Type</th>
              <th>Créateur</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Invitations</th>
              <th>RSVP</th>
              <th>Date de création</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((invitation) => (
              <tr key={invitation.id}>
                <td className={styles.titleCell}>
                  <strong>{invitation.eventTitle}</strong>
                  <div className={styles.eventDate}>
                    {new Date(invitation.eventDate).toLocaleDateString('fr-FR')}
                  </div>
                </td>
                <td className={styles.typeCell}>
                  <span className={styles.eventType}>
                    {invitation.eventType}
                  </span>
                </td>
                <td className={styles.userCell}>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>
                      {invitation.user.firstName} {invitation.user.lastName}
                    </span>
                    <span className={styles.userEmail}>
                      {invitation.user.email}
                    </span>
                  </div>
                </td>
                <td className={styles.roleCell}>
                  <span className={styles.userRole}>
                    {invitation.user.role}
                  </span>
                </td>
                <td>
                  <span className={`${styles.status} ${getStatusColor(invitation.status)}`}>
                    {getStatusLabel(invitation.status)}
                  </span>
                </td>
                <td className={styles.countCell}>
                  {invitation._count.guests}
                </td>
                <td className={styles.countCell}>
                  {invitation._count.rsvps}
                </td>
                <td className={styles.dateCell}>
                  {new Date(invitation.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className={styles.actionsCell}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => router.push(`/super-admin/invitations/${invitation.id}`)}
                  >
                    Voir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {invitations.length === 0 && (
        <div className={styles.emptyState}>
          <p>Aucune invitation trouvée</p>
        </div>
      )}
    </div>
  );
} 