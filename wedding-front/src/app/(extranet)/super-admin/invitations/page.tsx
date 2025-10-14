'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/apiClient';
import { 
  Eye, 
  Trash2, 
  Calendar, 
  Users, 
  UserCheck, 
  FileText,
  AlertTriangle,
  Crown,
  Sparkles
} from 'lucide-react';
import styles from './invitations.module.css';

interface Invitation {
  id: string;
  eventTitle?: string;       // NOUVELLE architecture (optionnel)
  eventDate?: string | Date; // NOUVELLE architecture (optionnel)
  eventType?: string;        // NOUVELLE architecture (optionnel)
  eventTime?: string;        // NOUVELLE architecture (optionnel)
  location?: string;         // NOUVELLE architecture (optionnel)
  customText?: string;       // NOUVELLE architecture (optionnel)
  moreInfo?: string;         // NOUVELLE architecture (optionnel)
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer toutes les invitations avec les détails des utilisateurs
      const data = await apiClient.get<Invitation[]>('/admin/invitations');
      console.log('🔍 Données reçues du backend:', data);
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

  const handleDeleteInvitation = async (invitation: Invitation) => {
    const confirmed = confirm(
      `Êtes-vous sûr de vouloir supprimer l'invitation "${invitation.eventTitle}" ?\n\nCette action supprimera définitivement l'invitation et toutes ses données associées (invités, RSVP, photos, etc.). Cette action est irréversible.`
    );
    
    if (confirmed) {
      try {
        setDeletingId(invitation.id);
        await apiClient.delete(`/admin/invitations/${invitation.id}`);
        
        // Retirer l'invitation de la liste
        setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'invitation:', error);
        alert('Erreur lors de la suppression de l\'invitation.');
      } finally {
        setDeletingId(null);
      }
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
        <div className={styles.headerBadge}>
          <Crown className={styles.badgeIcon} />
          Administration Supérieure
        </div>
        <h1 className={styles.headerTitle}>
          Gestion des <span className={styles.headerTitleAccent}>Invitations</span>
        </h1>
        <p className={styles.headerSubtitle}>
          Vue d'ensemble de toutes les invitations d'événements créées par les utilisateurs
        </p>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FileText className={styles.icon} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Total Invitations</h3>
            <span className={styles.statNumber}>{invitations.length}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Calendar className={styles.icon} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Publiées</h3>
            <span className={styles.statNumber}>
              {invitations.filter(inv => inv.status === 'PUBLISHED').length}
            </span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <AlertTriangle className={styles.icon} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Brouillons</h3>
            <span className={styles.statNumber}>
              {invitations.filter(inv => inv.status === 'DRAFT').length}
            </span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Sparkles className={styles.icon} />
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statTitle}>Archivées</h3>
            <span className={styles.statNumber}>
              {invitations.filter(inv => inv.status === 'ARCHIVED').length}
            </span>
          </div>
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
              <th>Invités</th>
              <th>RSVP</th>
              <th>Date de création</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((invitation) => (
              <tr key={invitation.id}>
                <td className={styles.titleCell}>
                  <strong>{invitation.eventTitle || (invitation as any).title || 'Invitation #' + invitation.id.slice(-8)}</strong>
                  <div className={styles.eventDate}>
                    {(() => {
                      const date = invitation.eventDate || (invitation as any).weddingDate || (invitation as any).eventDate;
                      return date ? new Date(date).toLocaleDateString('fr-FR') : 'Date non définie';
                    })()}
                  </div>
                </td>
                <td className={styles.typeCell}>
                  <span className={styles.eventType}>
                    {(() => {
                      const type = invitation.eventType || (invitation as any).type || (invitation as any).eventType;
                      return type || 'Non défini';
                    })()}
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
                  <div className={styles.actionButtons}>
                    <button 
                      className={styles.viewButton}
                      onClick={() => router.push(`/super-admin/invitations/${invitation.id}`)}
                      title="Voir les détails"
                    >
                      <Eye className={styles.buttonIcon} />
                      Voir
                    </button>
                    <button 
                      className={styles.deleteButton}
                      onClick={() => handleDeleteInvitation(invitation)}
                      disabled={deletingId === invitation.id}
                      title="Supprimer l'invitation"
                    >
                      <Trash2 className={styles.buttonIcon} />
                      {deletingId === invitation.id ? 'Suppression...' : 'Supprimer'}
                    </button>
                  </div>
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