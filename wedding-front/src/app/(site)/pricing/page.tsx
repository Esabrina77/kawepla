import { Button } from '@/components/Button/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card/Card';
import styles from '@/styles/site/pricing.module.css';
import Link from 'next/link';

const currentPlan = {
  name: 'Gratuit V1',
  price: '0€',
  description: 'Version bêta gratuite avec fonctionnalités de base',
  features: [
    '2 invitations maximum',
    '5 invités par invitation (10 total)',
    'Design simple',
    'RSVP de base',
    'Gestion des invités',
    'Restrictions alimentaires',
    'Export des données'
  ],
  available: true
};

const futurePlans = [
  {
    name: 'Basique',
    price: '49€',
    description: 'Pour les couples qui souhaitent une solution simple et efficace',
    features: [
      'Invitations illimitées',
      'Invités illimités',
      'Designs multiples',
      'RSVP avancé',
      'Album photo',
      'QR Code de partage',
      'Statistiques détaillées'
    ],
    comingSoon: true
  },
  {
    name: 'Standard',
    price: '99€',
    description: 'Pour une expérience plus complète avec plus de fonctionnalités',
    features: [
      'Toutes les fonctionnalités de Basique',
      'Thèmes premium',
      'Notifications email/SMS',
      'Programme détaillé',
      'Mini-vidéo d\'invitation',
      'Galerie photo post-mariage',
      'Support prioritaire'
    ],
    popular: true,
    comingSoon: true
  },
  {
    name: 'Premium',
    price: '239€',
    description: 'Pour une expérience luxueuse sans compromis',
    features: [
      'Toutes les fonctionnalités de Standard',
      'Thèmes premium avec animations',
      'Option multi-langues',
      'Heatmap géographique',
      'Intégration Google Calendar',
      'Badge VIP invités',
      'Espace liste de mariage/cadeaux',
      'Support dédié 24/7'
    ],
    comingSoon: true
  }
];

export default function PricingPage() {
  return (
    <div className={styles.pricing}>
      <section className={styles.header}>
        <div className="container">
          <h1>Tarifs - Version 1.0 (Bêta)</h1>
          <p>Nous sommes actuellement en phase de développement V1. Profitez gratuitement de nos fonctionnalités de base !</p>
          <div className={styles.betaBadge}>
            <span>🚀 Version Bêta</span>
          </div>
        </div>
      </section>

      {/* Plan actuel gratuit */}
      <section className={styles.currentPlan}>
        <div className="container">
          <h2>Actuellement disponible</h2>
          <div className={styles.singlePlan}>
            <Card variant="elevated" className={`${styles.planCard} ${styles.current}`}>
              <div className={styles.currentBadge}>Disponible maintenant</div>
              <CardHeader>
                <CardTitle>{currentPlan.name}</CardTitle>
                <div className={styles.price}>
                  <span className={styles.amount}>{currentPlan.price}</span>
                  <span className={styles.period}>/toujours</span>
                </div>
                <p className={styles.description}>{currentPlan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className={styles.features}>
                  {currentPlan.features.map((feature) => (
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
                <Button variant="primary" size="large" fullWidth>
                  <Link href="/auth/register">
                    Commencer gratuitement
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Plans futurs */}
      <section className={styles.futurePlans}>
        <div className="container">
          <h2>Prochainement disponibles</h2>
          <p className={styles.comingSoonText}>
            Ces plans seront disponibles dans les prochaines versions. Inscrivez-vous dès maintenant pour être notifié !
          </p>
          <div className={styles.planGrid}>
            {futurePlans.map((plan) => (
              <Card
                key={plan.name}
                variant={plan.popular ? 'elevated' : 'default'}
                className={`${styles.planCard} ${plan.popular ? styles.popular : ''} ${styles.comingSoon}`}
              >
                {plan.popular && (
                  <div className={styles.popularBadge}>Plus populaire</div>
                )}
                <div className={styles.comingSoonBadge}>Bientôt disponible</div>
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
                  <Button variant="outline" size="large" fullWidth disabled>
                    Bientôt disponible
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.roadmap}>
        <div className="container">
          <h2>🗺️ Feuille de route</h2>
          <div className={styles.roadmapContent}>
            <div className={styles.phase}>
              <div className={styles.phaseHeader}>
                <span className={styles.phaseNumber}>V1</span>
                <h3>Phase actuelle - Bêta gratuite</h3>
                <span className={styles.phaseStatus}>✅ Disponible</span>
              </div>
              <ul>
                <li>✅ Création d'invitations de base</li>
                <li>✅ Gestion des invités (limité à 10 total)</li>
                <li>✅ RSVP simple</li>
                <li>✅ Export des données</li>
              </ul>
            </div>
            
            <div className={styles.phase}>
              <div className={styles.phaseHeader}>
                <span className={styles.phaseNumber}>V2</span>
                <h3>Prochaine phase - Plans payants</h3>
                <span className={styles.phaseStatus}>🚧 En développement</span>
              </div>
              <ul>
                <li>🔄 Invitations et invités illimités</li>
                <li>🔄 Designs multiples</li>
                <li>🔄 Album photo</li>
                <li>🔄 Notifications automatiques</li>
              </ul>
            </div>
            
            <div className={styles.phase}>
              <div className={styles.phaseHeader}>
                <span className={styles.phaseNumber}>V3</span>
                <h3>Fonctionnalités avancées</h3>
                <span className={styles.phaseStatus}>📋 Planifié</span>
              </div>
              <ul>
                <li>📋 Vidéos d'invitation</li>
                <li>📋 Multi-langues</li>
                <li>📋 Intégrations tierces</li>
                <li>📋 Analytics avancés</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.betaInfo}>
        <div className="container">
          <h2>Pourquoi commencer maintenant ?</h2>
          <div className={styles.betaAdvantages}>
            <div className={styles.advantage}>
              <span className={styles.advantageIcon}>💰</span>
              <h3>Gratuit à vie</h3>
              <p>Les utilisateurs bêta conservent l'accès gratuit aux fonctionnalités de base</p>
            </div>
            <div className={styles.advantage}>
              <span className={styles.advantageIcon}>🎯</span>
              <h3>Influence le développement</h3>
              <p>Vos retours nous aident à améliorer le produit</p>
            </div>
            <div className={styles.advantage}>
              <span className={styles.advantageIcon}>⚡</span>
              <h3>Accès prioritaire</h3>
              <p>Soyez les premiers à tester les nouvelles fonctionnalités</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 