'use client';

import styles from './dashboard.module.css';
import Image from 'next/image';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useAdminUsers } from '@/hooks/useAdminUsers';

export default function SuperAdminDashboard() {
  const { stats, loading: statsLoading, error: statsError } = useAdminStats();
  const { users, loading: usersLoading } = useAdminUsers();

  if (statsLoading || usersLoading) {
    return (
      <div className={styles.dashboardContainer}>
        <h1>
          <Image
            src="/icons/stats.svg"
            alt=""
            width={32}
            height={32}
          />
          Tableau de bord
        </h1>
        <div className="text-center py-8">
          <p>Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className={styles.dashboardContainer}>
        <h1>
          <Image
            src="/icons/stats.svg"
            alt=""
            width={32}
            height={32}
          />
          Tableau de bord
        </h1>
        <div className="text-center py-8 text-red-600">
          <p>{statsError}</p>
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
    <div className={styles.dashboardContainer}>
      <h1>
        <Image
          src="/icons/stats.svg"
          alt=""
          width={32}
          height={32}
        />
        Tableau de bord
      </h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Utilisateurs</h3>
          <div className={styles.statValue}>{stats.users.total}</div>
          <div className={styles.statChange}>
            <Image
              src="/icons/stats.svg"
              alt=""
              width={16}
              height={16}
            />
            +{recentUsers.length} cette semaine
          </div>
        </div>

        <div className={styles.statCard}>
          <h3>Invitations publiées</h3>
          <div className={styles.statValue}>{stats.invitations.published}</div>
          <div className={styles.statChange}>
            <Image
              src="/icons/stats.svg"
              alt=""
              width={16}
              height={16}
            />
            {stats.invitations.total} au total
          </div>
        </div>

        <div className={styles.statCard}>
          <h3>Emails envoyés</h3>
          <div className={styles.statValue}>{stats.activity.emailsSent}</div>
          <div className={styles.statChange}>
            <Image
              src="/icons/stats.svg"
              alt=""
              width={16}
              height={16}
            />
            Invitations distribuées
          </div>
        </div>

        <div className={styles.statCard}>
          <h3>Taux de réponse</h3>
          <div className={styles.statValue}>{stats.activity.conversionRate}%</div>
          <div className={styles.statChange}>
            <Image
              src="/icons/stats.svg"
              alt=""
              width={16}
              height={16}
            />
            {stats.activity.totalRSVPs} réponses
          </div>
        </div>
      </div>

      <div className={styles.recentActivity}>
        <h2>Activité récente</h2>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>
              <Image
                src="/icons/guests.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={styles.activityContent}>
              <div className={styles.activityTitle}>Utilisateurs actifs</div>
              <div className={styles.activityMeta}>
                {stats.users.active} utilisateurs actifs sur {stats.users.total}
              </div>
            </div>
          </div>

          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>
              <Image
                src="/icons/rsvp.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={styles.activityContent}>
              <div className={styles.activityTitle}>Réponses RSVP</div>
              <div className={styles.activityMeta}>
                {stats.guests.confirmed} confirmées, {stats.guests.declined} déclinées
              </div>
            </div>
          </div>

          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>
              <Image
                src="/icons/design.svg"
                alt=""
                width={20}
                height={20}
              />
            </div>
            <div className={styles.activityContent}>
              <div className={styles.activityTitle}>Invitations ce mois</div>
              <div className={styles.activityMeta}>
                {stats.invitations.thisMonth} nouvelles invitations créées
              </div>
            </div>
          </div>

          {recentUsers.length > 0 && (
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>
                <Image
                  src="/icons/guests.svg"
                  alt=""
                  width={20}
                  height={20}
                />
              </div>
              <div className={styles.activityContent}>
                <div className={styles.activityTitle}>Nouveaux utilisateurs</div>
                <div className={styles.activityMeta}>
                  {recentUsers.length} inscription{recentUsers.length > 1 ? 's' : ''} cette semaine
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.detailedStats}>
        <div className={styles.rolesSection}>
          <h3>Répartition des rôles</h3>
          <div className={styles.roleList}>
            <div className={styles.roleItem}>
              <span className={styles.roleLabel}>
                <div className={`${styles.roleIndicator} ${styles.roleCouple}`}></div>
                Couples
              </span>
              <span className={styles.roleCount}>{stats.users.byRole.COUPLE}</span>
            </div>
            <div className={styles.roleItem}>
              <span className={styles.roleLabel}>
                <div className={`${styles.roleIndicator} ${styles.roleAdmin}`}></div>
                Admins
              </span>
              <span className={styles.roleCount}>{stats.users.byRole.ADMIN}</span>
            </div>
            <div className={styles.roleItem}>
              <span className={styles.roleLabel}>
                <div className={`${styles.roleIndicator} ${styles.roleGuest}`}></div>
                Invités
              </span>
              <span className={styles.roleCount}>{stats.users.byRole.GUEST}</span>
            </div>
          </div>
        </div>

        <div className={styles.invitationsSection}>
          <h3>État des invitations</h3>
          <div className={styles.invitationList}>
            <div className={styles.invitationItem}>
              <span className={styles.invitationLabel}>
                <div className={`${styles.invitationIndicator} ${styles.invitationDraft}`}></div>
                Brouillons
              </span>
              <span className={styles.invitationCount}>{stats.invitations.draft}</span>
            </div>
            <div className={styles.invitationItem}>
              <span className={styles.invitationLabel}>
                <div className={`${styles.invitationIndicator} ${styles.invitationPublished}`}></div>
                Publiées
              </span>
              <span className={styles.invitationCount}>{stats.invitations.published}</span>
            </div>
            <div className={styles.invitationItem}>
              <span className={styles.invitationLabel}>
                <div className={`${styles.invitationIndicator} ${styles.invitationArchived}`}></div>
                Archivées
              </span>
              <span className={styles.invitationCount}>{stats.invitations.archived}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 