'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import styles from './SubscriptionLimits.module.css';
import Link from 'next/link';
import { AlertCircle, TrendingUp } from 'lucide-react';

interface SubscriptionLimitsProps {
  invitationId?: string;
  showUpgradeButton?: boolean;
}

interface UserLimits {
  tier: string;
  limits: {
    invitations: number;
    guests: number;
    photos: number;
    designs: number;
  };
  usage: {
    invitations: number;
    guests: number;
    photos: number;
    designs: number;
  };
  remaining: {
    invitations: number;
    guests: number;
    photos: number;
    designs: number;
  };
}

export function SubscriptionLimits({
  invitationId,
  showUpgradeButton = true
}: SubscriptionLimitsProps) {
  const { user } = useAuth();
  const [userLimits, setUserLimits] = useState<UserLimits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserLimits();
  }, []);

  const loadUserLimits = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/subscriptions/limits', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const limits = await response.json() as UserLimits;
      setUserLimits(limits);
    } catch (error) {
      console.error('Erreur lors du chargement des limites:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return null;
  }

  if (!userLimits) {
    return null;
  }

  // Afficher seulement si l'utilisateur approche des limites
  const shouldShowWarning = () => {
    const { usage, limits } = userLimits;
    
    // Vérifier si proche des limites (80% ou plus)
    const invitationPercentage = limits.invitations === 999999 ? 0 : (usage.invitations / limits.invitations) * 100;
    const guestPercentage = limits.guests === 999999 ? 0 : (usage.guests / limits.guests) * 100;
    const photoPercentage = limits.photos === 999999 ? 0 : (usage.photos / limits.photos) * 100;
    
    return invitationPercentage >= 80 || guestPercentage >= 80 || photoPercentage >= 80;
  };

  if (!shouldShowWarning()) {
    return null;
  }

  const formatNumber = (num: number) => {
    return num === 999999 ? '∞' : num.toLocaleString();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <AlertCircle className={styles.icon} />
        <h3>Limites d'abonnement</h3>
      </div>
      
      <div className={styles.content}>
        <p className={styles.description}>
          Vous approchez des limites de votre forfait {userLimits.tier}.
        </p>
        
        <div className={styles.limits}>
          <div className={styles.limitItem}>
            <span className={styles.label}>Invitations:</span>
            <span className={styles.value}>
              {userLimits.usage.invitations} / {formatNumber(userLimits.limits.invitations)}
            </span>
          </div>
          
          <div className={styles.limitItem}>
            <span className={styles.label}>Invités:</span>
            <span className={styles.value}>
              {userLimits.usage.guests} / {formatNumber(userLimits.limits.guests)}
            </span>
          </div>
          
          <div className={styles.limitItem}>
            <span className={styles.label}>Photos:</span>
            <span className={styles.value}>
              {userLimits.usage.photos} / {formatNumber(userLimits.limits.photos)}
            </span>
          </div>
        </div>
        
        {showUpgradeButton && (
          <div className={styles.actions}>
            <Link href="/client/billing" className={styles.upgradeButton}>
              <TrendingUp className={styles.upgradeIcon} />
              Améliorer mon forfait
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

