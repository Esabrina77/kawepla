'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useInvitations } from '@/hooks/useInvitations';
import { useGuests } from '@/hooks/useGuests';
import { LimitsIndicator } from '@/components/LimitsIndicator/LimitsIndicator';
import { 
  Users, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BarChart3,
  TrendingUp,
  CalendarRange,
  Link as LinkIcon,
  Plus,
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const { invitations, loading: loadingInvitations } = useInvitations();
  const [selectedInvitationId, setSelectedInvitationId] = useState<string>('');

  // Vérification d'authentification
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
  }, [router]);

  // Trouver l'invitation sélectionnée ou la première disponible
  const selectedInvitation = invitations.find(inv => inv.id === selectedInvitationId) || invitations[0];

  // Sélectionner automatiquement la première invitation au chargement
  useEffect(() => {
    if (invitations.length > 0 && !selectedInvitationId) {
      const publishedInvitation = invitations.find(inv => inv.status === 'PUBLISHED');
      const defaultInvitation = publishedInvitation || invitations[0];
      setSelectedInvitationId(defaultInvitation.id);
    }
  }, [invitations, selectedInvitationId]);

  // Hook pour récupérer les données des invités
  const { guests, statistics, fetchGuests } = useGuests(selectedInvitationId);

  // Charger les invités quand l'invitation est sélectionnée
  useEffect(() => {
    if (selectedInvitationId) {
      fetchGuests();
    }
  }, [selectedInvitationId, fetchGuests]);

  // Calculer les statistiques
  const guestsWithEmails = guests.filter((g: any) => g.invitationType === 'PERSONAL');
  const guestsViaLink = guests.filter((g: any) => g.invitationType === 'SHAREABLE');
  const confirmedGuests = guests.filter((g: any) => g.rsvp?.status === 'CONFIRMED');
  const declinedGuests = guests.filter((g: any) => g.rsvp?.status === 'DECLINED');
  const pendingGuests = guests.filter((g: any) => !g.rsvp || g.rsvp?.status === 'PENDING');
  const invitedGuests = guests.filter((g: any) => g.invitationSentAt);

  const quickActions = [
    {
      title: 'Créer une invitation',
      description: 'Commencez par créer votre première invitation',
      icon: 'Plus',
      path: '/client/invitations',
      color: 'primary'
    },
    {
      title: 'Ajouter des invités',
      description: 'Importez ou ajoutez vos invités',
      icon: 'Users',
      path: '/client/guests',
      color: 'secondary'
    },
    {
      title: 'Voir mes réponses',
      description: 'Consultez les réponses de vos invités',
      icon: 'MessageSquare',
      path: '/client/messages',
      color: 'tertiary'
    }
  ];

  if (loadingInvitations) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '50vh',
        color: 'var(--luxury-pearl-gray)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--luxury-pearl-gray)',
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>Chargement des invitations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.badge}>
          <BarChart3 style={{ width: '16px', height: '16px' }} />
          Tableau de bord
        </div>
        
        <h1 className={styles.title}>
          Bienvenue sur votre <span className={styles.titleAccent}>tableau de bord</span>
        </h1>
        
        <p className={styles.subtitle}>
          Gérez vos invitations et suivez vos statistiques en temps réel
        </p>
      </div>

      {/* Affichage des limites d'abonnement */}
              <LimitsIndicator />

      {/* Section Statistiques */}
      {selectedInvitation && selectedInvitationId && (
        <section className={styles.statsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <BarChart3 style={{ width: '20px', height: '20px' }} />
              Statistiques de l'invitation
            </h2>
            
            {/* Sélecteur d'invitation si plusieurs invitations */}
            {invitations.length > 1 && (
              <div className={styles.invitationSelector}>
                <select
                  value={selectedInvitationId}
                  onChange={(e) => setSelectedInvitationId(e.target.value)}
                  className={styles.invitationSelect}
                >
                  {invitations.map(invitation => (
                    <option key={invitation.id} value={invitation.id}>
                      {invitation.eventTitle}
                      {invitation.eventDate && ` - ${new Date(invitation.eventDate).toLocaleDateString('fr-FR')}`}
                      {invitation.status === 'PUBLISHED' ? ' ✅' : ' 📝'}
                    </option>
                  ))}
                </select>
                <ChevronDown style={{ width: '16px', height: '16px' }} className={styles.selectIcon} />
              </div>
            )}
            
            <p className={styles.sectionSubtitle}>
              {selectedInvitation.eventTitle} - {selectedInvitation.eventDate ? new Date(selectedInvitation.eventDate).toLocaleDateString('fr-FR') : 'Date non définie'}
            </p>
          </div>
          
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.total}`}>
              <div className={styles.statIcon}>
                <Users style={{ width: '20px', height: '20px' }} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{guests.length}</div>
                <div className={styles.statLabel}>Total invités</div>
              </div>
            </div>
            
            <div className={`${styles.statCard} ${styles.email}`}>
              <div className={styles.statIcon}>
                <Mail style={{ width: '20px', height: '20px' }} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{guestsWithEmails.length}</div>
                <div className={styles.statLabel}>Via mail</div>
              </div>
            </div>
            
            <div className={`${styles.statCard} ${styles.link}`}>
              <div className={styles.statIcon}>
                <LinkIcon style={{ width: '20px', height: '20px' }} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{guestsViaLink.length}</div>
                <div className={styles.statLabel}>Via lien</div>
              </div>
            </div>
            
            <div className={`${styles.statCard} ${styles.confirmed}`}>
              <div className={styles.statIcon}>
                <CheckCircle style={{ width: '20px', height: '20px' }} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{confirmedGuests.length}</div>
                <div className={styles.statLabel}>Confirmés</div>
              </div>
            </div>
            
            <div className={`${styles.statCard} ${styles.declined}`}>
              <div className={styles.statIcon}>
                <XCircle style={{ width: '20px', height: '20px' }} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{declinedGuests.length}</div>
                <div className={styles.statLabel}>Refusés</div>
              </div>
            </div>
            
            <div className={`${styles.statCard} ${styles.pending}`}>
              <div className={styles.statIcon}>
                <Clock style={{ width: '20px', height: '20px' }} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{pendingGuests.length}</div>
                <div className={styles.statLabel}>En attente</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Actions rapides */}
      <section className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Actions rapides</h2>
        <div className={styles.actionsGrid}>
          {quickActions.map((action, index) => {
            const IconComponent = action.icon === 'Plus' ? Plus : 
                                 action.icon === 'Users' ? Users : 
                                 action.icon === 'MessageSquare' ? MessageSquare : null;
            
            return (
              <Link
                key={index}
                href={action.path}
                className={`${styles.actionCard} ${styles[action.color]}`}
              >
                <div className={styles.actionIcon}>
                  {IconComponent && <IconComponent style={{ width: '20px', height: '20px' }} />}
                </div>
                <div className={styles.actionContent}>
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
                <div className={styles.actionArrow}>
                  →
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 