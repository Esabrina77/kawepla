'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Statistics } from '@/types';
import { Card } from '@/components/Card/Card';
import { SubscriptionLimits } from '@/components/SubscriptionLimits/SubscriptionLimits';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const [statistics, setStatistics] = useState<Statistics>({
    totalGuests: 0,
    confirmed: 0,
    declined: 0,
    pending: 0,
    responseRate: 0,
    dietaryRestrictionsCount: 0
  });

  const quickActions = [
    {
      title: 'Créer une invitation',
      description: 'Commencez par créer votre première invitation',
      icon: '💌',
      path: '/client/invitations',
      color: 'primary'
    },
    {
      title: 'Ajouter des invités',
      description: 'Importez ou ajoutez vos invités',
      icon: '👥',
      path: '/client/guests',
      color: 'secondary'
    },
    {
      title: 'Choisir un design',
      description: 'Personnalisez le design de votre invitation',
      icon: '🎨',
      path: '/client/design',
      color: 'tertiary'
    }
  ];

  return (
    <div className={styles.dashboard}>
      <h1>Tableau de bord</h1>
      
      {/* Affichage des limites d'abonnement */}
      <SubscriptionLimits />

      {/* Actions rapides */}
      <section className={styles.quickActions}>
        <h2>Actions rapides</h2>
        <div className={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.path}
              className={`${styles.actionCard} ${styles[action.color]}`}
            >
              <div className={styles.actionIcon}>
                {action.icon}
              </div>
              <div className={styles.actionContent}>
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
              <div className={styles.actionArrow}>
                →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Statistiques rapides
      <section className={styles.statsSection}>
        <h2>Aperçu rapide</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{statistics.totalGuests}</div>
              <div className={styles.statLabel}>Invités total</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{statistics.confirmed}</div>
              <div className={styles.statLabel}>Confirmés</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⏳</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{statistics.pending}</div>
              <div className={styles.statLabel}>En attente</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📈</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{statistics.responseRate}%</div>
              <div className={styles.statLabel}>Taux de réponse</div>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
} 