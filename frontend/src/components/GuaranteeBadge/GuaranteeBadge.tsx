import React from 'react';
import { ShieldCheck, Clock, CreditCard, Zap } from 'lucide-react';
import styles from './GuaranteeBadge.module.css';

interface GuaranteeBadgeProps {
  type: 'no-card' | 'support' | 'instant';
  className?: string;
}

export const GuaranteeBadge: React.FC<GuaranteeBadgeProps> = ({
  type,
  className = ''
}) => {
  const guarantees = {
    'no-card': {
      icon: <CreditCard className="w-5 h-5" />,
      title: 'Aucune carte requise',
      description: 'Testez gratuitement'
    },
    'support': {
      icon: <Clock className="w-5 h-5" />,
      title: 'Support 7j/7',
      description: 'Réponse sous 24h'
    },
    'instant': {
      icon: <Zap className="w-5 h-5" />,
      title: 'Accès instantané',
      description: 'Commencez immédiatement'
    }
  };

  const guarantee = guarantees[type];

  return (
    <div className={`${styles.guaranteeBadge} ${className}`}>
      <div className={styles.guaranteeIcon}>
        {guarantee.icon}
      </div>
      <div className={styles.guaranteeContent}>
        <div className={styles.guaranteeTitle}>
          {guarantee.title}
        </div>
        <div className={styles.guaranteeDescription}>
          {guarantee.description}
        </div>
      </div>
    </div>
  );
};
