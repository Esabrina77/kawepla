'use client';

import { useState, useEffect } from 'react';
import { providersApi, ProviderStats } from '@/lib/api/providers';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Star,
  Calendar,
  Euro,
  Activity
} from 'lucide-react';
import styles from './dashboard.module.css';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await providersApi.getStats();
      setStats(response.stats);
    } catch (err) {
      console.error('Erreur chargement stats:', err);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Chargement du dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>❌ Erreur</h2>
        <p>{error}</p>
        <button onClick={loadStats}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Header */}
      <div className={styles.headerSection}>
        <div className={styles.badge}>
          <Activity style={{ width: '16px', height: '16px' }} />
          Dashboard Admin
        </div>
        
        <h1 className={styles.title}>
          Tableau de bord <span className={styles.titleAccent}>Administration</span>
        </h1>
        
        <p className={styles.subtitle}>
          Vue d'ensemble de l'activité de la plateforme
        </p>
      </div>

      {/* Statistiques principales */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Users size={24} />
            </div>
            <div className={styles.statContent}>
              <h3>{stats.totalProviders}</h3>
              <p>Total Providers</p>
              <div className={styles.statTrend}>
                <TrendingUp size={14} />
                <span>+12% ce mois</span>
              </div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <CheckCircle size={24} />
            </div>
            <div className={styles.statContent}>
              <h3>{stats.approvedProviders}</h3>
              <p>Providers Approuvés</p>
              <div className={styles.statTrend}>
                <TrendingUp size={14} />
                <span>+8% ce mois</span>
              </div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Clock size={24} />
            </div>
            <div className={styles.statContent}>
              <h3>{stats.pendingProviders}</h3>
              <p>En Attente</p>
              <div className={styles.statTrend}>
                <AlertTriangle size={14} />
                <span>À traiter</span>
              </div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Star size={24} />
            </div>
            <div className={styles.statContent}>
              <h3>{stats.averageRating.toFixed(1)}</h3>
              <p>Note Moyenne</p>
              <div className={styles.statTrend}>
                <TrendingUp size={14} />
                <span>+0.2 ce mois</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className={styles.quickActions}>
        <h2>Actions Rapides</h2>
        <div className={styles.actionGrid}>
          <a href="/super-admin/providers" className={styles.actionCard}>
            <Users size={24} />
            <h3>Gérer les Providers</h3>
            <p>Approuver, suspendre ou rejeter les providers</p>
          </a>
          
          <a href="/super-admin/providers?status=PENDING" className={styles.actionCard}>
            <Clock size={24} />
            <h3>Providers en Attente</h3>
            <p>{stats?.pendingProviders || 0} providers à traiter</p>
          </a>
          
          <a href="/super-admin/stats" className={styles.actionCard}>
            <TrendingUp size={24} />
            <h3>Statistiques Détaillées</h3>
            <p>Analytics et rapports complets</p>
          </a>
          
          <a href="/super-admin/settings" className={styles.actionCard}>
            <AlertTriangle size={24} />
            <h3>Paramètres Système</h3>
            <p>Configuration de la plateforme</p>
          </a>
        </div>
      </div>

      {/* Activité récente */}
      <div className={styles.recentActivity}>
        <h2>Activité Récente</h2>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>
              <Users size={16} />
            </div>
            <div className={styles.activityContent}>
              <p><strong>Nouveau provider</strong> "Studio Marie Dubois" s'est inscrit</p>
              <span className={styles.activityTime}>Il y a 2 heures</span>
            </div>
          </div>
          
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>
              <CheckCircle size={16} />
            </div>
            <div className={styles.activityContent}>
              <p><strong>Provider approuvé</strong> "Traiteur Jean Martin"</p>
              <span className={styles.activityTime}>Il y a 4 heures</span>
            </div>
          </div>
          
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>
              <Star size={16} />
            </div>
            <div className={styles.activityContent}>
              <p><strong>Nouvelle note</strong> 5 étoiles pour "DJ Pierre Events"</p>
              <span className={styles.activityTime}>Il y a 6 heures</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
