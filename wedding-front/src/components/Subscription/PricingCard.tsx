import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { SubscriptionPlan } from '@/lib/api/stripe';
import styles from './PricingCard.module.css';

interface PricingCardProps {
  plan: SubscriptionPlan;
  isPopular?: boolean;
  onSelect: (planId: string) => void;
  loading?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  isPopular = false,
  onSelect,
  loading = false
}) => {
  return (
    <Card className={`${styles.pricingCard} ${isPopular ? styles.popular : ''}`}>
      {isPopular && (
        <div className={styles.popularBadge}>
          Le plus populaire
        </div>
      )}
      
      <CardHeader>
        <CardTitle className={styles.planName}>{plan.name}</CardTitle>
        <div className={styles.price}>
          <span className={styles.amount}>{plan.price}€</span>
          <span className={styles.period}>/unique</span>
        </div>
        <p className={styles.description}>{plan.description}</p>
      </CardHeader>
      
      <CardContent>
        <ul className={styles.features}>
          {plan.features.map((feature, index) => (
            <li key={index} className={styles.feature}>
              <Check className={styles.checkIcon} size={16} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        <div className={styles.limits}>
          <div className={styles.limit}>
            <span>Invitations: {plan.limits.invitations === 999999 ? '∞' : plan.limits.invitations}</span>
          </div>
          <div className={styles.limit}>
            <span>Invités: {plan.limits.guests === 999999 ? '∞' : plan.limits.guests}</span>
          </div>
          <div className={styles.limit}>
            <span>Photos: {plan.limits.photos === 999999 ? '∞' : plan.limits.photos}</span>
          </div>
        </div>
        
        <Button
          onClick={() => onSelect(plan.id)}
          disabled={loading}
          className={styles.selectButton}
          variant={plan.id === 'FREE' ? 'outline' : 'default'}
        >
          {loading ? 'Chargement...' : 
           plan.id === 'FREE' ? 'Commencer gratuitement' : `Choisir ${plan.name}`}
        </Button>
      </CardContent>
    </Card>
  );
}; 