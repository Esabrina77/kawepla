'use client';

import styles from './dashboard.module.css';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useAuth } from '@/hooks/useAuth';
import { HeaderMobile } from '@/components/HeaderMobile';
import { FloatingThemeToggle } from '@/components/FloatingThemeToggle';
import {
  Users,
  TrendingUp,
  Activity,
  Crown,
  FileText,
  UserCheck,
  Calendar,
  Target
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const { stats, loading: statsLoading, error: statsError } = useAdminStats();
  const { users, loading: usersLoading } = useAdminUsers();
  const { user } = useAuth();

  if (statsLoading || usersLoading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.errorContainer}>
          <p>Erreur: {statsError}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Calculer les utilisateurs récents (derniers 7 jours)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentUsers = users.filter(user =>
    new Date(user.createdAt) > sevenDaysAgo
  );

  return (
    <div className={styles.dashboard}>
      {/* Header Sticky */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.userAvatar}>
            {user?.firstName?.[0] || 'A'}{user?.lastName?.[0] || ''}
          </div>
          <h2 className={styles.greeting}>
            Bonjour {user?.firstName || 'Admin'}
          </h2>
        </div>
        <div className={styles.themeToggleWrapper}>
          <FloatingThemeToggle variant="inline" size={20} />
        </div>
      </header>

      <main className={styles.main}>
        {/* Page Title */}
        <h1 className={styles.pageTitle}>Tableau de bord</h1>

        {/* Stats Section */}
        <section className={styles.statsSection}>
          <h2 className={styles.sectionTitle}>Statistiques</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Users style={{ width: '24px', height: '24px' }} />
              </div>
              <div className={styles.statContent}>
                <h3>Utilisateurs</h3>
                <div className={styles.statValue}>{stats.users.total}</div>
                <div className={styles.statChange}>
                  <TrendingUp style={{ width: '14px', height: '14px' }} />
                  +{recentUsers.length} cette semaine
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FileText style={{ width: '24px', height: '24px' }} />
              </div>
              <div className={styles.statContent}>
                <h3>Invitations publiées</h3>
                <div className={styles.statValue}>{stats.invitations.published}</div>
                <div className={styles.statChange}>
                  <Activity style={{ width: '14px', height: '14px' }} />
                  {stats.invitations.total} au total
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Target style={{ width: '24px', height: '24px' }} />
              </div>
              <div className={styles.statContent}>
                <h3>Taux de réponse</h3>
                <div className={styles.statValue}>{stats.activity.conversionRate}%</div>
                <div className={styles.statChange}>
                  <UserCheck style={{ width: '14px', height: '14px' }} />
                  {stats.activity.totalRSVPs} réponses
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Activity Section */}
        <section className={styles.activitySection}>
          <h2 className={styles.sectionTitle}>
            <Activity style={{ width: '20px', height: '20px' }} />
            Activité récente
          </h2>

          <div className={styles.activityGrid}>
          <div className={styles.activityCard}>
            <div className={styles.activityIcon}>
              <Users style={{ width: '20px', height: '20px' }} />
            </div>
            <div className={styles.activityContent}>
              <div className={styles.activityTitle}>Utilisateurs actifs</div>
              <div className={styles.activityValue}>
                {stats.users.active} / {stats.users.total}
              </div>
              <div className={styles.activityMeta}>
                Utilisateurs connectés récemment
              </div>
            </div>
          </div>

          <div className={styles.activityCard}>
            <div className={styles.activityIcon}>
              <UserCheck style={{ width: '20px', height: '20px' }} />
            </div>
            <div className={styles.activityContent}>
              <div className={styles.activityTitle}>Réponses RSVP</div>
              <div className={styles.activityValue}>
                {stats.guests.confirmed} confirmées
              </div>
              <div className={styles.activityMeta}>
                {stats.guests.declined} déclinées
              </div>
            </div>
          </div>

          <div className={styles.activityCard}>
            <div className={styles.activityIcon}>
              <FileText style={{ width: '20px', height: '20px' }} />
            </div>
            <div className={styles.activityContent}>
              <div className={styles.activityTitle}>Invitations ce mois</div>
              <div className={styles.activityValue}>
                {stats.invitations.thisMonth}
              </div>
              <div className={styles.activityMeta}>
                Nouvelles invitations créées
              </div>
            </div>
          </div>

          {recentUsers.length > 0 && (
            <div className={styles.activityCard}>
              <div className={styles.activityIcon}>
                <Users style={{ width: '20px', height: '20px' }} />
              </div>
              <div className={styles.activityContent}>
                <div className={styles.activityTitle}>Nouveaux utilisateurs</div>
                <div className={styles.activityValue}>
                  {recentUsers.length}
                </div>
                <div className={styles.activityMeta}>
                  Inscription{recentUsers.length > 1 ? 's' : ''} cette semaine
                </div>
              </div>
            </div>
          )}
          </div>
        </section>

        {/* Detailed Stats */}
        <section className={styles.detailedStats}>
          <div className={styles.statsCard}>
          <h3 className={styles.cardTitle}>
            <Crown style={{ width: '18px', height: '18px' }} />
            Répartition des rôles
          </h3>
          <div className={styles.statsList}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>
                <div className={`${styles.statIndicator} ${styles.roleorganisateur}`}></div>
                organisateurs
              </span>
              <span className={styles.statCount}>{stats.users.byRole.organisateur}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>
                <div className={`${styles.statIndicator} ${styles.roleAdmin}`}></div>
                Admins
              </span>
              <span className={styles.statCount}>{stats.users.byRole.ADMIN}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>
                <div className={`${styles.statIndicator} ${styles.roleGuest}`}></div>
                Invités
              </span>
              <span className={styles.statCount}>{stats.users.byRole.GUEST}</span>
            </div>
          </div>
        </div>

        <div className={styles.statsCard}>
          <h3 className={styles.cardTitle}>
            <Calendar style={{ width: '18px', height: '18px' }} />
            État des invitations
          </h3>
          <div className={styles.statsList}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>
                <div className={`${styles.statIndicator} ${styles.invitationDraft}`}></div>
                Brouillons
              </span>
              <span className={styles.statCount}>{stats.invitations.draft}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>
                <div className={`${styles.statIndicator} ${styles.invitationPublished}`}></div>
                Publiées
              </span>
              <span className={styles.statCount}>{stats.invitations.published}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>
                <div className={`${styles.statIndicator} ${styles.invitationArchived}`}></div>
                Archivées
              </span>
              <span className={styles.statCount}>{stats.invitations.archived}</span>
            </div>
          </div>
          </div>
        </section>
      </main>
    </div>
  );
} 