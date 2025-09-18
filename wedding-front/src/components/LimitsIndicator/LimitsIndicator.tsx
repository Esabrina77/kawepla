'use client';

import React, { useState } from 'react';
import { Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { useBillingLimits } from '@/hooks/useBillingLimits';
import { useInvitations } from '@/hooks/useInvitations';
import { useGuests } from '@/hooks/useGuests';
import Link from 'next/link';
import styles from './LimitsIndicator.module.css';

interface LimitsIndicatorProps {
  invitationId?: string; // Pour afficher les invités d'une invitation spécifique
  showUpgradeButton?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const LimitsIndicator: React.FC<LimitsIndicatorProps> = ({
  invitationId,
  showUpgradeButton = true,
  position = 'bottom'
}) => {
  const { limitsData, loading } = useBillingLimits();
  const { invitations } = useInvitations();
  const guestHookResult = useGuests(invitationId || '');
  const statistics = invitationId ? guestHookResult.statistics : null;
  const [showTooltip, setShowTooltip] = useState(false);

  if (!limitsData || loading) {
    return null;
  }

  const currentInvitations = invitations?.length || 0;
  const currentGuests = invitationId && statistics 
    ? (statistics.totalGuests || 0) 
    : (limitsData?.usage?.guests || 0);

  const invitationProgress = limitsData.limits.invitations > 0 
    ? (currentInvitations / limitsData.limits.invitations) * 100 
    : 0;
  const guestProgress = invitationId && limitsData.limits.guests > 0 
    ? (currentGuests / limitsData.limits.guests) * 100 
    : 0;

  // Déterminer l'icône et la couleur selon l'état des limites
  const getIndicatorState = () => {
    if (invitationProgress >= 100 || guestProgress >= 100) {
      return { icon: AlertTriangle, color: 'var(--alert-error)', className: styles.critical };
    } else if (invitationProgress >= 80 || guestProgress >= 80) {
      return { icon: AlertTriangle, color: 'var(--alert-warning)', className: styles.warning };
    } else {
      return { icon: CheckCircle, color: 'var(--alert-success)', className: styles.normal };
    }
  };

  const { icon: Icon, color, className } = getIndicatorState();

  const handleClick = () => {
    setShowTooltip(!showTooltip);
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className={styles.limitsIndicatorContainer}>
      <button
        className={`${styles.limitsIndicator} ${className}`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="Voir les limites d'utilisation"
        title="Cliquez pour voir vos limites d'utilisation"
      >
        <Icon size={16} style={{ color }} />
        <span className={styles.limitsCount}>
          {invitationId 
            ? `${currentGuests}/${limitsData.limits.guests}` // Afficher les invités si on est sur une invitation
            : `${currentInvitations}/${limitsData.limits.invitations}` // Sinon afficher les invitations
          }
        </span>
      </button>

      {showTooltip && (
        <div className={`${styles.tooltip} ${styles[position]}`}>
          <div className={styles.tooltipHeader}>
            <h4>Limites d'utilisation</h4>
            <button 
              onClick={() => setShowTooltip(false)}
              className={styles.closeTooltip}
            >
              ×
            </button>
          </div>
          
          <div className={styles.tooltipContent}>
            {/* Invitations */}
            <div className={styles.limitItem}>
              <div className={styles.limitHeader}>
                <span className={styles.limitLabel}>Invitations</span>
                <span className={styles.limitCount}>
                  {currentInvitations} / {limitsData.limits.invitations}
                </span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={`${styles.progressFill} ${invitationProgress >= 100 ? styles.progressFull : ''}`}
                  style={{ width: `${Math.min(invitationProgress, 100)}%` }}
                />
              </div>
              {invitationProgress >= 80 && (
                <p className={styles.warningText}>
                  {invitationProgress >= 100 
                    ? 'Limite atteinte !'
                    : 'Limite presque atteinte'
                  }
                </p>
              )}
            </div>

            {/* Invités - affiché seulement si on a un invitationId */}
            {invitationId && (
              <div className={styles.limitItem}>
                <div className={styles.limitHeader}>
                  <span className={styles.limitLabel}>Invités</span>
                  <span className={styles.limitCount}>
                    {currentGuests} / {limitsData.limits.guests}
                  </span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={`${styles.progressFill} ${guestProgress >= 100 ? styles.progressFull : ''}`}
                    style={{ width: `${Math.min(guestProgress, 100)}%` }}
                  />
                </div>
                {guestProgress >= 80 && (
                  <p className={styles.warningText}>
                    {guestProgress >= 100 
                      ? 'Limite atteinte !'
                      : 'Limite presque atteinte'
                    }
                  </p>
                )}
              </div>
            )}
          </div>

          {showUpgradeButton && (
            <div className={styles.tooltipFooter}>
              <Link href="/client/billing" className={styles.upgradeLink}>
                Acheter des packs
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
