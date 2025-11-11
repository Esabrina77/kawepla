'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useInvitations } from '@/hooks/useInvitations';
import { useGuests } from '@/hooks/useGuests';
import { useAuth } from '@/hooks/useAuth';
import { stripeApi } from '@/lib/api/stripe';
import { 
  Users, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Link as LinkIcon,
  Plus,
  MessageSquare,
  ChevronDown,
  Bell,
  UserPlus,
  ListChecks
} from 'lucide-react';
import { FloatingThemeToggle } from '@/components/FloatingThemeToggle';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { invitations, loading: loadingInvitations } = useInvitations();
  const [selectedInvitationId, setSelectedInvitationId] = useState<string>('');
  const [limits, setLimits] = useState<{ usage: any; limits: any } | null>(null);

  // Vérification d'authentification
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
  }, [router]);

  // Charger les limites
  useEffect(() => {
    const loadLimits = async () => {
      try {
        const limitsData = await stripeApi.getUserLimitsAndUsage();
        setLimits(limitsData);
      } catch (error) {
        console.error('Erreur chargement limites:', error);
      }
    };
    if (user) {
      loadLimits();
    }
  }, [user]);

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
      description: 'Commencer un nouvel événement',
      icon: Plus,
      path: '/client/invitations'
    },
    {
      title: 'Ajouter des invités',
      description: 'Élargir votre liste d\'invités',
      icon: UserPlus,
      path: '/client/guests'
    },
    {
      title: 'Voir mes réponses',
      description: 'Consulter les statuts RSVP',
      icon: ListChecks,
      path: '/client/messages'
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

  // Calculer les pourcentages pour les barres de progression
  const invitationsPercent = limits ? Math.min(100, (limits.usage?.invitations || 0) / (limits.limits?.invitations || 1) * 100) : 0;
  const guestsPercent = limits ? Math.min(100, (limits.usage?.guests || 0) / (limits.limits?.guests || 1) * 100) : 0;
  const photosPercent = limits ? Math.min(100, (limits.usage?.photos || 0) / (limits.limits?.photos || 1) * 100) : 0;

  return (
    <div className={styles.dashboard}>
      {/* Header Sticky */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.userAvatar}>
            {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
          </div>
          <h2 className={styles.greeting}>
            Bonjour {user?.firstName || 'Utilisateur'}
          </h2>
        </div>
        <div className={styles.themeToggleWrapper}>
          <FloatingThemeToggle variant="inline" size={20} />
        </div>
      </header>

      <main className={styles.main}>
        {/* Page Title */}
        <h1 className={styles.pageTitle}>Tableau de bord</h1>

        {/* Limites d'abonnement - Section inline */}
        {limits && (
          <section className={styles.limitsSection}>
            <div className={styles.limitRow}>
              <div className={styles.limitHeader}>
                <p className={styles.limitLabel}>Invitations</p>
                <p className={styles.limitValue}>
                  {limits.usage?.invitations || 0} / {limits.limits?.invitations || 0}
                </p>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${invitationsPercent}%` }}
                />
              </div>
            </div>
            <div className={styles.limitRow}>
              <div className={styles.limitHeader}>
                <p className={styles.limitLabel}>Invités</p>
                <p className={styles.limitValue}>
                  {limits.usage?.guests || 0} / {limits.limits?.guests || 0}
                </p>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${guestsPercent}%` }}
                />
              </div>
            </div>
            <div className={styles.limitRow}>
              <div className={styles.limitHeader}>
                <p className={styles.limitLabel}>Photos</p>
                <p className={styles.limitValue}>
                  {limits.usage?.photos || 0} / {limits.limits?.photos || 0}
        </p>
      </div>
              <div className={styles.progressBar}>
                <div 
                  className={`${styles.progressFill} ${styles.secondary}`}
                  style={{ width: `${photosPercent}%` }}
                />
              </div>
            </div>
          </section>
        )}

      {/* Sélecteur d'événement */}
      {invitations.length > 0 && (
        <div className={styles.eventSelector}>
                <select
                  value={selectedInvitationId}
                  onChange={(e) => setSelectedInvitationId(e.target.value)}
            className={styles.eventSelect}
                >
                  {invitations.map(invitation => (
                    <option key={invitation.id} value={invitation.id}>
                      {invitation.eventTitle}
                      {invitation.eventDate && ` - ${new Date(invitation.eventDate).toLocaleDateString('fr-FR')}`}
                    </option>
                  ))}
                </select>
          <ChevronDown className={styles.selectIcon} size={20} />
              </div>
            )}
            
      {/* Section Statistiques */}
      {selectedInvitation && selectedInvitationId && (
        <section className={styles.statsSection}>
          <h2 className={styles.sectionTitle}>Statistiques de l'événement</h2>
          
          <div className={styles.statsGrid}>
            {/* Total invités */}
            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <Users size={20} />
              </div>
                <div className={styles.statValue}>{guests.length}</div>
                <div className={styles.statLabel}>Total invités</div>
            </div>
            
            {/* Via email */}
            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <Mail size={20} />
              </div>
                <div className={styles.statValue}>{guestsWithEmails.length}</div>
              <div className={styles.statLabel}>Via email</div>
            </div>
            
            {/* Via lien */}
            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <LinkIcon size={20} />
              </div>
                <div className={styles.statValue}>{guestsViaLink.length}</div>
                <div className={styles.statLabel}>Via lien</div>
            </div>
            
            {/* Confirmés */}
            <div className={styles.statCard}>
              <div className={`${styles.statIconWrapper} ${styles.success}`}>
                <CheckCircle size={20} />
              </div>
                <div className={styles.statValue}>{confirmedGuests.length}</div>
                <div className={styles.statLabel}>Confirmés</div>
            </div>
            
            {/* Refusés */}
            <div className={styles.statCard}>
              <div className={`${styles.statIconWrapper} ${styles.error}`}>
                <XCircle size={20} />
              </div>
                <div className={styles.statValue}>{declinedGuests.length}</div>
                <div className={styles.statLabel}>Refusés</div>
            </div>
            
            {/* En attente */}
            <div className={styles.statCard}>
              <div className={`${styles.statIconWrapper} ${styles.warning}`}>
                <Clock size={20} />
              </div>
                <div className={styles.statValue}>{pendingGuests.length}</div>
                <div className={styles.statLabel}>En attente</div>
            </div>
          </div>
        </section>
      )}

      {/* Actions rapides */}
      <section className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Actions rapides</h2>
        <div className={styles.actionsGrid}>
          {quickActions.map((action, index) => {
              const IconComponent = action.icon;
            
            return (
              <Link
                key={index}
                href={action.path}
                  className={styles.actionCard}
              >
                  <div className={styles.actionLeft}>
                    <div className={styles.actionIconWrapper}>
                      <IconComponent size={24} />
                </div>
                <div className={styles.actionContent}>
                      <div className={styles.actionTitle}>{action.title}</div>
                      <div className={styles.actionDescription}>{action.description}</div>
                    </div>
                </div>
                <div className={styles.actionArrow}>
                    <ChevronDown size={20} style={{ transform: 'rotate(-90deg)' }} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
      </main>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 