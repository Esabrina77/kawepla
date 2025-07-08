'use client';

import { useState } from 'react';
import styles from './stats.module.css';
import Image from 'next/image';
import { useAdminStats } from '@/hooks/useAdminStats';

export default function StatsPage() {
  const { stats, loading, error, refetch } = useAdminStats();
  const [dateFilter, setDateFilter] = useState('30');

  if (loading) {
    return (
      <div className={styles.statsContainer}>
        <div className={styles.header}>
          <h1>
            <Image
              src="/icons/stats.svg"
              alt=""
              width={32}
              height={32}
            />
            Statistiques globales
          </h1>
        </div>
        <div className="text-center py-8">
          <p>Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.statsContainer}>
        <div className={styles.header}>
          <h1>
            <Image
              src="/icons/stats.svg"
              alt=""
              width={32}
              height={32}
            />
            Statistiques globales
          </h1>
        </div>
        <div className="text-center py-8 text-red-600">
          <p>{error}</p>
          <button 
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className={styles.statsContainer}>
      <div className={styles.header}>
        <h1>
          <Image
            src="/icons/stats.svg"
            alt=""
            width={32}
            height={32}
          />
          Statistiques globales
        </h1>
        <div className={styles.dateFilter}>
          <select 
            className="superAdminInput"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">90 derniers jours</option>
            <option value="365">12 derniers mois</option>
          </select>
          <button 
            onClick={refetch}
            className="ml-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Actualiser
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Image
              src="/icons/guests.svg"
              alt=""
              width={24}
              height={24}
            />
          </div>
          <div className={styles.statInfo}>
            <h3>Utilisateurs totaux</h3>
            <div className={styles.statValue}>
              <strong>{stats.users.total}</strong>
              <div className="text-sm text-gray-600">
                {stats.users.active} actifs, {stats.users.inactive} inactifs
              </div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Image
              src="/icons/rsvp.svg"
              alt=""
              width={24}
              height={24}
            />
          </div>
          <div className={styles.statInfo}>
            <h3>Taux de conversion RSVP</h3>
            <div className={styles.statValue}>
              <strong>{stats.activity.conversionRate}%</strong>
              <div className="text-sm text-gray-600">
                {stats.activity.totalRSVPs} réponses sur {stats.guests.total} invités
              </div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Image
              src="/icons/design.svg"
              alt=""
              width={24}
              height={24}
            />
          </div>
          <div className={styles.statInfo}>
            <h3>Invitations créées</h3>
            <div className={styles.statValue}>
              <strong>{stats.invitations.total}</strong>
              <div className="text-sm text-gray-600">
                {stats.invitations.thisMonth} ce mois-ci
              </div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Image
              src="/icons/money.svg"
              alt=""
              width={24}
              height={24}
            />
          </div>
          <div className={styles.statInfo}>
            <h3>Emails envoyés</h3>
            <div className={styles.statValue}>
              <strong>{stats.activity.emailsSent}</strong>
              <div className="text-sm text-gray-600">
                Invitations distribuées
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.detailsGrid}>
        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <h3>Répartition des utilisateurs</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.statItem}>
              <div className={styles.statItemHeader}>
                <span className={styles.statLabel}>Couples</span>
                <span className={`${styles.statBadge} ${styles.roleCouple}`}>
                  {stats.users.byRole.COUPLE}
                </span>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statItemHeader}>
                <span className={styles.statLabel}>Admins</span>
                <span className={`${styles.statBadge} ${styles.roleAdmin}`}>
                  {stats.users.byRole.ADMIN}
                </span>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statItemHeader}>
                <span className={styles.statLabel}>Invités</span>
                <span className={`${styles.statBadge} ${styles.roleGuest}`}>
                  {stats.users.byRole.GUEST}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <h3>État des invitations</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.statItem}>
              <div className={styles.statItemHeader}>
                <span className={styles.statLabel}>Brouillons</span>
                <span className={`${styles.statBadge} ${styles.statusDraft}`}>
                  {stats.invitations.draft}
                </span>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statItemHeader}>
                <span className={styles.statLabel}>Publiées</span>
                <span className={`${styles.statBadge} ${styles.statusPublished}`}>
                  {stats.invitations.published}
                </span>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statItemHeader}>
                <span className={styles.statLabel}>Archivées</span>
                <span className={`${styles.statBadge} ${styles.statusArchived}`}>
                  {stats.invitations.archived}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <h3>Réponses RSVP</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.statItem}>
              <div className={styles.statItemHeader}>
                <span className={styles.statLabel}>Confirmées</span>
                <span className={`${styles.statBadge} ${styles.rsvpConfirmed}`}>
                  {stats.guests.confirmed}
                </span>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statItemHeader}>
                <span className={styles.statLabel}>Déclinées</span>
                <span className={`${styles.statBadge} ${styles.rsvpDeclined}`}>
                  {stats.guests.declined}
                </span>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statItemHeader}>
                <span className={styles.statLabel}>En attente</span>
                <span className={`${styles.statBadge} ${styles.rsvpPending}`}>
                  {stats.guests.pending}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <h3>Activité récente</h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.statItem}>
              <div className={styles.statItemHeader}>
                <span className={styles.statLabel}>Nouveaux utilisateurs (30j)</span>
                <span className={`${styles.statBadge} ${styles.activityPositive}`}>
                  +{stats.users.recentRegistrations}
                </span>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statItemHeader}>
                <span className={styles.statLabel}>Invitations ce mois</span>
                <span className={`${styles.statBadge} ${styles.activityPositive}`}>
                  +{stats.invitations.thisMonth}
                </span>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statItemHeader}>
                <span className={styles.statLabel}>Taux de réponse</span>
                <span className={`${styles.statBadge} ${styles.activityNeutral}`}>
                  {stats.activity.conversionRate}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 