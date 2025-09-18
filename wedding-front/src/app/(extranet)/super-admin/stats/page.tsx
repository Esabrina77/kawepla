'use client';

import { useState } from 'react';
import styles from './stats.module.css';
import { useAdminStats } from '@/hooks/useAdminStats';
import { 
  BarChart3, 
  Users, 
  Target, 
  FileText, 
  Mail, 
  TrendingUp, 
  Calendar, 
  RefreshCw,
  Heart,
  Shield,
  User,
  CheckCircle,
  Clock,
  Archive,
  AlertCircle,
  DollarSign
} from 'lucide-react';

export default function StatsPage() {
  const { stats, loading, error, refetch } = useAdminStats();
  const [dateFilter, setDateFilter] = useState('30');

  if (loading) {
    return (
      <div className={styles.statsContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.statsContainer}>
        <div className={styles.errorContainer}>
          <AlertCircle style={{ width: '24px', height: '24px' }} />
          <p>Erreur: {error}</p>
          <button onClick={refetch} className={styles.retryButton}>
            <RefreshCw style={{ width: '16px', height: '16px' }} />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className={styles.statsContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.badge}>
          <BarChart3 style={{ width: '16px', height: '16px' }} />
          Statistiques
        </div>
        
        <h1 className={styles.title}>
          Vue <span className={styles.titleAccent}>analytique</span>
        </h1>
        
        <p className={styles.subtitle}>
          Analysez les performances et l'activité de votre plateforme Kawepla
        </p>

        <div className={styles.filtersContainer}>
          <div className={styles.filterContainer}>
            <Calendar className={styles.filterIcon} />
            <select 
              className={styles.filterSelect}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">90 derniers jours</option>
              <option value="365">12 derniers mois</option>
            </select>
          </div>
          
          <button onClick={refetch} className={styles.refreshButton}>
            <RefreshCw style={{ width: '16px', height: '16px' }} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users style={{ width: '24px', height: '24px' }} />
          </div>
          <div className={styles.statContent}>
            <h3>Utilisateurs totaux</h3>
            <div className={styles.statValue}>{stats.users.total}</div>
            <div className={styles.statChange}>
              <TrendingUp style={{ width: '14px', height: '14px' }} />
              {stats.users.active} actifs, {stats.users.inactive} inactifs
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Target style={{ width: '24px', height: '24px' }} />
          </div>
          <div className={styles.statContent}>
            <h3>Taux de conversion RSVP</h3>
            <div className={styles.statValue}>{stats.activity.conversionRate}%</div>
            <div className={styles.statChange}>
              <CheckCircle style={{ width: '14px', height: '14px' }} />
              {stats.activity.totalRSVPs} réponses sur {stats.guests.total} invités
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FileText style={{ width: '24px', height: '24px' }} />
          </div>
          <div className={styles.statContent}>
            <h3>Invitations créées</h3>
            <div className={styles.statValue}>{stats.invitations.total}</div>
            <div className={styles.statChange}>
              <TrendingUp style={{ width: '14px', height: '14px' }} />
              {stats.invitations.thisMonth} ce mois-ci
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Mail style={{ width: '24px', height: '24px' }} />
          </div>
          <div className={styles.statContent}>
            <h3>Emails envoyés</h3>
            <div className={styles.statValue}>{stats.activity.emailsSent}</div>
            <div className={styles.statChange}>
              <Mail style={{ width: '14px', height: '14px' }} />
              Invitations distribuées
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className={styles.detailedStats}>
        <div className={styles.statsCard}>
          <h3 className={styles.cardTitle}>
            <Users style={{ width: '18px', height: '18px' }} />
            Répartition des utilisateurs
          </h3>
          <div className={styles.statsList}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>
                <Heart style={{ width: '14px', height: '14px' }} />
                organisateurs
              </span>
              <span className={styles.statCount}>{stats.users.byRole.organisateur}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>
                <Shield style={{ width: '14px', height: '14px' }} />
                Admins
              </span>
              <span className={styles.statCount}>{stats.users.byRole.ADMIN}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>
                <User style={{ width: '14px', height: '14px' }} />
                Invités
              </span>
              <span className={styles.statCount}>{stats.users.byRole.GUEST}</span>
            </div>
          </div>
        </div>

        <div className={styles.statsCard}>
          <h3 className={styles.cardTitle}>
            <FileText style={{ width: '18px', height: '18px' }} />
            État des invitations
          </h3>
          <div className={styles.statsList}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>
                <Clock style={{ width: '14px', height: '14px' }} />
                Brouillons
              </span>
              <span className={styles.statCount}>{stats.invitations.draft}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>
                <CheckCircle style={{ width: '14px', height: '14px' }} />
                Publiées
              </span>
              <span className={styles.statCount}>{stats.invitations.published}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>
                <Archive style={{ width: '14px', height: '14px' }} />
                Archivées
              </span>
              <span className={styles.statCount}>{stats.invitations.archived}</span>
            </div>
          </div>
        </div>

        <div className={styles.statsCard}>
          <h3 className={styles.cardTitle}>
            <Target style={{ width: '18px', height: '18px' }} />
            Réponses RSVP
          </h3>
          <div className={styles.statsList}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>
                <CheckCircle style={{ width: '14px', height: '14px' }} />
                Confirmées
              </span>
              <span className={styles.statCount}>{stats.guests.confirmed}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>
                <AlertCircle style={{ width: '14px', height: '14px' }} />
                Déclinées
              </span>
              <span className={styles.statCount}>{stats.guests.declined}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>
                <Clock style={{ width: '14px', height: '14px' }} />
                En attente
              </span>
              <span className={styles.statCount}>{stats.guests.pending}</span>
            </div>
          </div>
        </div>

        <div className={styles.statsCard}>
          <h3 className={styles.cardTitle}>
            <TrendingUp style={{ width: '18px', height: '18px' }} />
            Activité récente
          </h3>
          <div className={styles.statsList}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>
                <Users style={{ width: '14px', height: '14px' }} />
                Nouveaux utilisateurs (30j)
              </span>
              <span className={styles.statCount}>+{stats.users.recentRegistrations}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>
                <FileText style={{ width: '14px', height: '14px' }} />
                Invitations ce mois
              </span>
              <span className={styles.statCount}>+{stats.invitations.thisMonth}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>
                <Target style={{ width: '14px', height: '14px' }} />
                Taux de réponse
              </span>
              <span className={styles.statCount}>{stats.activity.conversionRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 