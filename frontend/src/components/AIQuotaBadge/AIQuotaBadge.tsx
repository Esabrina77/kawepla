'use client';

import { Sparkles, AlertTriangle } from 'lucide-react';
import { useServicePurchaseLimits } from '@/hooks/useSubscriptionLimits';
import styles from './AIQuotaBadge.module.css';
import Link from 'next/link';

interface AIQuotaBadgeProps {
  variant?: 'default' | 'compact' | 'inline';
  showUpgradeLink?: boolean;
  displayMode?: 'remaining' | 'usage'; // 'remaining' = quota restant, 'usage' = utilisation
}

export function AIQuotaBadge({ variant = 'default', showUpgradeLink = true, displayMode = 'remaining' }: AIQuotaBadgeProps) {
  const { remaining, limits, usage, loading } = useServicePurchaseLimits();

  if (loading) {
    return (
      <div className={`${styles.badge} ${styles[variant]}`}>
        <Sparkles size={14} />
        <span>Chargement...</span>
      </div>
    );
  }

  const aiRemaining = remaining?.aiRequests ?? 0;
  const aiUsage = usage?.aiRequests ?? 0;
  const aiLimit = limits?.aiRequests ?? 0;
  
  // Si displayMode est 'usage', on affiche l'utilisation, sinon le quota restant
  const displayValue = displayMode === 'usage' ? aiUsage : aiRemaining;
  const isLow = displayMode === 'remaining' && aiRemaining <= 5 && aiRemaining > 0;
  const isEmpty = displayMode === 'remaining' && aiRemaining === 0;
  const isFull = displayMode === 'usage' && aiUsage >= aiLimit;

  const badgeClass = `${styles.badge} ${styles[variant]} ${
    isEmpty || isFull ? styles.empty : isLow ? styles.low : ''
  }`;

  if (variant === 'inline') {
    return (
      <span className={badgeClass}>
        <Sparkles size={12} />
        <span>{displayValue}/{aiLimit}</span>
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={badgeClass}>
        <Sparkles size={14} />
        <span>{displayValue}/{aiLimit}</span>
        {(isEmpty || isFull) && showUpgradeLink && (
          <Link href="/client/billing" className={styles.upgradeLink}>
            Upgrader
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={badgeClass}>
      <div className={styles.icon}>
        {(isEmpty || isFull) ? <AlertTriangle size={16} /> : <Sparkles size={16} />}
      </div>
      <div className={styles.content}>
        <div className={styles.label}>
          {displayMode === 'usage' 
            ? (isFull ? 'Quota épuisé' : 'Requêtes IA utilisées')
            : (isEmpty ? 'Aucune requête restante' : 'Requêtes IA restantes')
          }
        </div>
        <div className={styles.count}>
          <span className={styles.current}>{displayValue}</span>
          <span className={styles.separator}>/</span>
          <span className={styles.total}>{aiLimit}</span>
        </div>
        {isLow && !isEmpty && (
          <div className={styles.warning}>
            Bientôt épuisé
          </div>
        )}
      </div>
      {(isEmpty || isFull) && showUpgradeLink && (
        <Link href="/client/billing" className={styles.upgradeButton}>
          Upgrader
        </Link>
      )}
    </div>
  );
}

