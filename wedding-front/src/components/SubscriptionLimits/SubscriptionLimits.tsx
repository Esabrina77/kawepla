'use client';

import { useAuth } from '@/hooks/useAuth';
import { useInvitations } from '@/hooks/useInvitations';
import { useGuests } from '@/hooks/useGuests';
import styles from './SubscriptionLimits.module.css';
import Link from 'next/link';

interface SubscriptionLimitsProps {
  invitationId?: string; // Pour afficher les invités d'une invitation spécifique
  showUpgradeButton?: boolean;
}

const BASIC_LIMITS = {
  MAX_INVITATIONS: 2,
  MAX_GUESTS_PER_INVITATION: 5
};

export function SubscriptionLimits({ 
  invitationId,
  showUpgradeButton = true 
}: SubscriptionLimitsProps) {
  const { user } = useAuth();
  const { invitations } = useInvitations();
  
  // Utiliser le hook conditionnellement
  const guestHookResult = useGuests(invitationId || '');
  const statistics = invitationId ? guestHookResult.statistics : null;

  // Seuls les utilisateurs BASIC voient les limites
  if (!user || user.subscriptionTier !== 'BASIC') {
    return null;
  }

  const currentInvitations = invitations?.length || 0;
  const currentGuests = invitationId && statistics ? (statistics.total || 0) : 0;

  const invitationProgress = (currentInvitations / BASIC_LIMITS.MAX_INVITATIONS) * 100;
  const guestProgress = invitationId ? (currentGuests / BASIC_LIMITS.MAX_GUESTS_PER_INVITATION) * 100 : 0;

  return (
    <div className={styles.limitsContainer}>
      <div className={styles.limitsHeader}>
        <h3>Abonnement Gratuit</h3>
        <span className={styles.badge}>BASIC</span>
      </div>

      <div className={styles.limitsContent}>
        {/* Limite d'invitations */}
        <div className={styles.limitItem}>
          <div className={styles.limitLabel}>
            <span>Invitations créées</span>
            <span className={styles.limitCount}>
              {currentInvitations} / {BASIC_LIMITS.MAX_INVITATIONS}
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
                ? 'Limite atteinte ! Vous ne pouvez plus créer d\'invitations.'
                : 'Vous approchez de la limite d\'invitations.'
              }
            </p>
          )}
        </div>

        {/* Limite d'invités - affichée seulement si on a un invitationId */}
        {invitationId && (
          <div className={styles.limitItem}>
            <div className={styles.limitLabel}>
              <span>Invités pour cette invitation</span>
              <span className={styles.limitCount}>
                {currentGuests} / {BASIC_LIMITS.MAX_GUESTS_PER_INVITATION}
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
                  ? 'Limite atteinte ! Vous ne pouvez plus ajouter d\'invités à cette invitation.'
                  : 'Vous approchez de la limite d\'invités pour cette invitation.'
                }
              </p>
            )}
          </div>
        )}
      </div>

      {showUpgradeButton && (
        <div className={styles.upgradeSection}>
          <p className={styles.upgradeText}>
            Besoin de plus d'invitations ou d'invités ?
          </p>
          <button className={styles.upgradeButton} disabled>
            Passer au Premium (Bientôt disponible)
          </button>
        </div>
      )}
    </div>
  );
}

// Fonction utilitaire pour vérifier si on peut créer des invitations
export function canCreateInvitation(user: any, invitations: any[]) {
  if (!user || user.subscriptionTier !== 'BASIC') {
    return true; // Les utilisateurs premium n'ont pas de limite
  }
  
  const currentInvitations = invitations?.length || 0;
  return currentInvitations < BASIC_LIMITS.MAX_INVITATIONS;
} 