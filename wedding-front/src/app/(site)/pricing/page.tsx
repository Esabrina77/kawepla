import { Button } from '@/components/Button/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card/Card';
import styles from '@/styles/site/pricing.module.css';
import Link from 'next/link';

const plans = [
  {
    name: 'Basique',
    price: '49€',
    description: 'Pour les couples qui souhaitent une solution simple et efficace',
    features: [
      '1 design simple',
      'Invitations personnalisées',
      'RSVP',
      'Liste des invités',
      'Export CSV',
      'Gestion restrictions alimentaires',
    ]
  },
  {
    name: 'Standard',
    price: '99€',
    description: 'Pour une expérience plus complète avec plus de fonctionnalités',
    features: [
      'Toutes les fonctionnalités de Basique',
      'Plusieurs designs',
      'Album photo',
      'QR Code de partage',
      'Programme détaillé',
      'Statistiques simples'
    ],
    popular: true
  },
  {
    name: 'Premium',
    price: '239€',
    description: 'Pour une expérience luxueuse sans compromis',
    features: [
      'Toutes les fonctionnalités de Standard',
      'Thèmes premium avec animations',
      'Notifications email/SMS',
      'Mini-vidéo d\'invitation',
      'Galerie photo post-mariage',
      'Option multi-langues',
      'Heatmap géographique',
      'Intégration Google Calendar',
      'Badge VIP invités',
      'Espace liste de mariage/cadeaux'
    ]
  }
];

export default function PricingPage() {
  return (
    <div className={styles.pricing}>
      <section className={styles.header}>
        <div className="container">
          <h1>Des offres adaptées à vos besoins</h1>
          <p>Choisissez le forfait qui correspond le mieux à vos attentes</p>
        </div>
      </section>

      <section className={styles.plans}>
        <div className="container">
          <div className={styles.planGrid}>
            {plans.map((plan) => (
              <Card
                key={plan.name}
                variant={plan.popular ? 'elevated' : 'default'}
                className={`${styles.planCard} ${plan.popular ? styles.popular : ''}`}
              >
                {plan.popular && (
                  <div className={styles.popularBadge}>Plus populaire</div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className={styles.price}>
                    <span className={styles.amount}>{plan.price}</span>
                    <span className={styles.period}>/mariage</span>
                  </div>
                  <p className={styles.description}>{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className={styles.features}>
                    {plan.features.map((feature) => (
                      <li key={feature}>
                        <svg
                          className={styles.checkIcon}
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M20 6L9 17L4 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    size="large"
                    fullWidth
                  >
                    <Link href="/auth/register">
                      Choisir {plan.name}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.guarantee}>
        <div className="container">
          <h2>Garantie satisfait ou remboursé</h2>
          <p>
            Essayez notre service pendant 30 jours. Si vous n'êtes pas satisfait,
            nous vous remboursons intégralement.
          </p>
        </div>
      </section>
    </div>
  );
} 