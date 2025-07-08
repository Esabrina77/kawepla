'use client';

import { useState } from 'react';
import { Statistics } from '@/types';
import { Card } from '@/components/Card/Card';
import { SubscriptionLimits } from '@/components/SubscriptionLimits/SubscriptionLimits';
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
      
      {/* Affichage des limites d'abonnement */}
      <SubscriptionLimits />
      
    </div>
  );
} 