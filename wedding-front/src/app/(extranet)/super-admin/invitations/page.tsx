'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/apiClient';
import { useDesigns } from '@/hooks/useDesigns';
import { HeaderMobile } from '@/components/HeaderMobile';
import DesignPreview from '@/components/DesignPreview';
import {
  Eye,
  Trash2,
  Calendar,
  Users,
  FileText,
  AlertTriangle,
  Sparkles,
  Mail,
  User
} from 'lucide-react';
import styles from './invitations.module.css';

interface Invitation {
  id: string;
  eventTitle?: string;
  eventDate?: string | Date;
  eventType?: string;
  eventTime?: string;
  location?: string;
  customText?: string;
  moreInfo?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  designId?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  design?: {
    id: string;
    name: string;
    template: any;
    styles: any;
    variables: any;
    components?: any;
    version?: string;
  };
  _count: {
    guests: number;
    rsvps: number;
  };
}

export default function AdminInvitationsPage() {
  const router = useRouter();
  const { designs, loading: loadingDesigns } = useDesigns();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEventTypeLabel = (eventType?: string) => {
    if (!eventType) return 'Événement';
    const types: Record<string, string> = {
      'WEDDING': 'Mariage',
      'BIRTHDAY': 'Anniversaire',
      'BAPTISM': 'Baptême',
      'ANNIVERSARY': 'Anniversaire de mariage',
      'GRADUATION': 'Remise de diplôme',
      'BABY_SHOWER': 'Baby shower',
      'CORPORATE': 'Événement d\'entreprise',
      'OTHER': 'Autre'
    };
    return types[eventType] || eventType;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDesignName = (invitation: Invitation) => {
    // D'abord essayer avec le design inclus dans l'invitation (comme RSVP)
    if (invitation.design?.name) {
      return invitation.design.name;
    }
    // Sinon, chercher dans la liste des designs chargés (comme page client)
    if (invitation.designId) {
      const design = designs.find(d => d.id === invitation.designId);
      if (design?.name) {
        return design.name;
      }
    }
    return 'Design inconnu';
  };

  // removed getInvitationPreview function

  const handleDeleteInvitation = async (invitation: Invitation) => {
    const confirmed = confirm(
      `Êtes-vous sûr de vouloir supprimer l'invitation "${invitation.eventTitle}" ?\n\nCette action supprimera définitivement l'invitation et toutes ses données associées (invités, RSVP, photos, etc.). Cette action est irréversible.`
    );

    if (confirmed) {
      try {
        setDeletingId(invitation.id);
        await apiClient.delete(`/admin/invitations/${invitation.id}`);
        setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'invitation:', error);
        alert('Erreur lors de la suppression de l\'invitation.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading || loadingDesigns) {
    return (
      <div className={styles.invitationsPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement des invitations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.invitationsPage}>
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button onClick={fetchInvitations} className={styles.retryButton}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.invitationsPage}>
      <HeaderMobile title="Invitations" />

      <main className={styles.main}>

        {/* Stats Section */}
        <section className={styles.statsSection}>
          <h2 className={styles.sectionTitle}>Statistiques</h2>
          <div className={styles.statsGrid}>
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
        </section>

        {invitations.length === 0 ? (
          <div className={styles.emptyState}>
            <Mail size={80} />
            <h3>Aucune invitation trouvée</h3>
            <p>Aucune invitation n'a été créée par les utilisateurs pour le moment.</p>
          </div>
        ) : (
          <div className={styles.invitationsGrid}>
            {invitations.map((invitation) => (
              <div key={invitation.id} className={styles.invitationCard}>
                {/* Image Preview */}
                <div className={styles.invitationImageWrapper}>
                  {(invitation.design || (invitation.designId && designs.find(d => d.id === invitation.designId))) ? (
                    <div className={styles.invitationPreview} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                      <DesignPreview
                        design={(invitation.design || designs.find(d => d.id === invitation.designId)) as any}
                        width={400}
                        height={566}
                      />
                    </div>
                  ) : (
                    <div className={styles.invitationImage} style={{
                      background: 'linear-gradient(135deg, var(--luxury-champagne-gold), var(--luxury-rose-quartz))'
                    }} />
                  )}
                  <span className={`${styles.statusBadge} ${styles[invitation.status === 'PUBLISHED' ? 'published' : invitation.status === 'ARCHIVED' ? 'archived' : 'draft']}`}>
                    {invitation.status === 'PUBLISHED' ? 'Publiée' : invitation.status === 'ARCHIVED' ? 'Archivée' : 'Brouillon'}
                  </span>
                </div>

                {/* Content */}
                <div className={styles.invitationContent}>
                  <span className={styles.invitationType}>
                    {getEventTypeLabel(invitation.eventType)}
                  </span>
                  <h3 className={styles.invitationTitle}>
                    {invitation.eventTitle || 'Invitation sans titre'}
                  </h3>
                  <p className={styles.invitationDetail}>
                    Design : {getDesignName(invitation)}
                  </p>
                  {invitation.eventDate && (
                    <p className={styles.invitationDetail}>
                      {formatDate(invitation.eventDate as string)}
                    </p>
                  )}

                  {/* Creator Info */}
                  <div className={styles.creatorInfo}>
                    <User size={14} />
                    <span className={styles.creatorName}>
                      {invitation.user.firstName} {invitation.user.lastName}
                    </span>
                    <span className={styles.creatorRole}>
                      ({invitation.user.role})
                    </span>
                  </div>

                  {/* Stats */}
                  <div className={styles.invitationStats}>
                    <div className={styles.statItem}>
                      <Users size={14} />
                      <span>{invitation._count.guests} invités</span>
                    </div>
                    <div className={styles.statItem}>
                      <Mail size={14} />
                      <span>{invitation._count.rsvps} RSVP</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={styles.invitationActions}>
                    <button
                      className={`${styles.invitationActionButton} ${styles.view}`}
                      onClick={() => router.push(`/super-admin/invitations/${invitation.id}`)}
                    >
                      <Eye size={16} />
                      Voir
                    </button>
                    <button
                      className={`${styles.invitationActionButton} ${styles.delete}`}
                      onClick={() => handleDeleteInvitation(invitation)}
                      disabled={deletingId === invitation.id}
                    >
                      <Trash2 size={16} />
                      {deletingId === invitation.id ? 'Suppression...' : 'Supprimer'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
