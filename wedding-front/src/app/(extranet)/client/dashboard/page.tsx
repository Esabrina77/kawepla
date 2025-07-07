'use client';

import { useState } from 'react';
import { Statistics } from '@/types';
import { Card } from '@/components/Card/Card';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const [statistics, setStatistics] = useState<Statistics>({
    totalGuests: 0,
    confirmed: 0,
    declined: 0,
    pending: 0,
    responseRate: 0,
    dietaryRestrictionsCount: 0
  });

  return (
    <div className={styles.dashboard}>
      <h1>Tableau de bord</h1>
      
      <section className={styles.statsGrid}>
        <Card>
          <h3>Invités</h3>
          <div className={styles.statValue}>{statistics.totalGuests}</div>
          <div className={styles.statLabel}>Total des invités</div>
        </Card>

        <Card>
          <h3>Réponses</h3>
          <div className={styles.statValue}>{statistics.confirmed}</div>
          <div className={styles.statLabel}>Présents confirmés</div>
        </Card>

        <Card>
          <h3>En attente</h3>
          <div className={styles.statValue}>{statistics.pending}</div>
          <div className={styles.statLabel}>Réponses en attente</div>
        </Card>

        <Card>
          <h3>Taux de réponse</h3>
          <div className={styles.statValue}>{statistics.responseRate}%</div>
          <div className={styles.statLabel}>des invités ont répondu</div>
        </Card>
      </section>

      <section className={styles.quickActions}>
        <h2>Actions rapides</h2>
        <div className={styles.actionGrid}>
          <Card>
            <h3>Invitation</h3>
            <p>Personnalisez votre invitation</p>
            <a href="/design" className={styles.actionLink}>Modifier le design</a>
          </Card>

          <Card>
            <h3>Invités</h3>
            <p>Gérez votre liste d'invités</p>
            <a href="/guests" className={styles.actionLink}>Voir la liste</a>
          </Card>

          <Card>
            <h3>Export</h3>
            <p>Téléchargez vos données</p>
            <button className={styles.exportButton}>
              Exporter en CSV
            </button>
          </Card>
        </div>
      </section>
    </div>
  );
} 