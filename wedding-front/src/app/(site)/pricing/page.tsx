import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card/Card';
import { Button } from '@/components/Button/Button';
import styles from '@/styles/site/pricing.module.css';
import Link from 'next/link';

const plans = [
  {
    id: 'FREE',
    name: 'Découverte',
    price: 0,
    period: 'Gratuit',
    description: 'Parfait pour tester la plateforme',
    features: [
      '1 invitation personnalisable',
      'Jusqu\'à 10 invités',
      'RSVP basique',
      '1 design standard',
      'Support communautaire'
    ],
    limitations: [
      'Pas d\'albums photos',
      'Pas de messagerie',
      'Fonctionnalités limitées'
    ],
    limits: {
      invitations: 1,
      guests: 10,
      photos: 0,
      designs: 1
    },
    cta: 'Commencer gratuitement',
    popular: false
  },
  {
    id: 'ESSENTIAL',
    name: 'Essentiel',
    price: 39,
    period: 'Paiement unique',
    description: 'Idéal pour les petits mariages intimes',
    features: [
      '2 invitations personnalisables',
      'Jusqu\'à 75 invités',
      'RSVP avec préférences alimentaires',
      '5 designs premium',
      'Album photos (50 photos max)',
      'Messagerie intégrée',
      'Support email'
    ],
    limitations: [
      'Analytics basiques',
      'Modération photos manuelle'
    ],
    limits: {
      invitations: 2,
      guests: 75,
      photos: 50,
      designs: 5
    },
    cta: 'Choisir Essentiel',
    popular: false
  },
  {
    id: 'ELEGANT',
    name: 'Élégant',
    price: 69,
    period: 'Paiement unique',
    description: 'Le plus populaire - parfait pour la plupart des mariages',
    features: [
      '3 invitations personnalisables',
      'Jusqu\'à 150 invités',
      'RSVP complet + messages',
      '10 designs premium',
      'Album photos (150 photos max)',
      'QR codes personnalisés',
      'Liens partageables',
      'Support prioritaire'
    ],
    limitations: [],
    limits: {
      invitations: 3,
      guests: 150,
      photos: 150,
      designs: 10
    },
    cta: 'Choisir Élégant',
    popular: true
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: 99,
    period: 'Paiement unique',
    description: 'Pour les grands mariages et événements complexes',
    features: [
      '5 invitations personnalisables',
      'Jusqu\'à 300 invités',
      'Toutes les fonctionnalités RSVP',
      '20 designs premium',
      'Album photos (500 photos max)',
      'Analytics détaillées',
      'Modération automatique',
      'Support VIP'
    ],
    limitations: [],
    limits: {
      invitations: 5,
      guests: 300,
      photos: 500,
      designs: 20
    },
    cta: 'Choisir Premium',
    popular: false
  },
  {
    id: 'LUXE',
    name: 'Luxe',
    price: 149,
    period: 'Paiement unique',
    description: 'L\'expérience ultime pour les mariages d\'exception',
    features: [
      '10 invitations personnalisables',
      'Jusqu\'à 500 invités',
      'Album photos (1000 photos max)',
      '50 designs + personnalisations',
      'Accès bêta aux nouvelles fonctionnalités',
    ],
    limitations: [],
    limits: {
      invitations: 10,
      guests: 500,
      photos: 1000,
      designs: 50
    },
    cta: 'Choisir Luxe',
    popular: false
  }
];

const additionalServices = [
  {
    id: 'GUESTS_30',
    name: 'Pack 30 invités supplémentaires',
    price: 15,
    description: 'Ajoutez 30 invités supplémentaires à votre forfait actuel',
    icon: '👥'
  },
  {
    id: 'GUESTS_50',
    name: 'Pack 50 invités supplémentaires',
    price: 25,
    description: 'Ajoutez 50 invités supplémentaires à votre forfait actuel',
    icon: '👥'
  },
  {
    id: 'PHOTOS_50',
    name: '50 photos supplémentaires',
    price: 15,
    description: 'Augmentez votre limite de photos de 50 unités',
    icon: '📸'
  },
  {
    id: 'DESIGN_PREMIUM',
    name: 'Design premium supplémentaire',
    price: 20,
    description: 'Accédez à un design premium exclusif',
    icon: '🎨'
  }
];

export default function PricingPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Tarifs Transparents</h1>
        <p className={styles.subtitle}>
          Choisissez le forfait qui correspond parfaitement à votre mariage
        </p>
        <div className={styles.badge}>
          <span className={styles.badgeText}>Paiement unique • Pas d'abonnement</span>
        </div>
      </header>

      <main className={styles.main}>
        {/* Plans principaux */}
        <section className={styles.plansSection}>
          <div className={styles.plansGrid}>
            {plans.map((plan) => (
              <Card key={plan.id} className={`${styles.planCard} ${plan.popular ? styles.popular : ''}`}>
                {plan.popular && (
                  <div className={styles.popularBadge}>
                    <span>Le plus populaire</span>
                  </div>
                )}
                
                <CardHeader className={styles.planHeader}>
                  <CardTitle className={styles.planName}>{plan.name}</CardTitle>
                  <div className={styles.planPrice}>
                    <span className={styles.price}>{plan.price}€</span>
                    <span className={styles.period}>{plan.period}</span>
                  </div>
                  <p className={styles.planDescription}>{plan.description}</p>
                </CardHeader>

                <CardContent className={styles.planContent}>
                  <div className={styles.limits}>
                    <h4>Limites incluses :</h4>
                    <ul className={styles.limitsList}>
                      <li>{plan.limits.invitations} invitation{plan.limits.invitations > 1 ? 's' : ''}</li>
                      <li>{plan.limits.guests} invité{plan.limits.guests > 1 ? 's' : ''}</li>
                      <li>{plan.limits.photos} photo{plan.limits.photos > 1 ? 's' : ''}</li>
                      <li>{plan.limits.designs} design{plan.limits.designs > 1 ? 's' : ''}</li>
                    </ul>
                  </div>

                  <div className={styles.features}>
                    <h4>Fonctionnalités :</h4>
                    <ul className={styles.featuresList}>
                      {plan.features.map((feature, index) => (
                        <li key={index} className={styles.featureItem}>
                          <span className={styles.checkmark}>✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div className={styles.limitations}>
                      <h4>Limitations :</h4>
                      <ul className={styles.limitationsList}>
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className={styles.limitationItem}>
                            <span className={styles.crossmark}>✗</span>
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className={styles.planAction}>
                    <Link href={plan.id === 'FREE' ? '/register' : `/pricing/checkout/${plan.id}`}>
                      <Button className={`${styles.ctaButton} ${plan.popular ? styles.popularButton : ''}`}>
                        {plan.cta}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Services supplémentaires */}
        <section className={styles.additionalServicesSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Services Supplémentaires</h2>
            <p className={styles.sectionSubtitle}>
              Besoin de plus ? Ajoutez ces services à votre forfait
            </p>
          </div>

          <div className={styles.servicesGrid}>
            {additionalServices.map((service) => (
              <Card key={service.id} className={styles.serviceCard}>
                <CardHeader className={styles.serviceHeader}>
                  <div className={styles.serviceIcon}>{service.icon}</div>
                  <CardTitle className={styles.serviceName}>{service.name}</CardTitle>
                  <div className={styles.servicePrice}>+{service.price}€</div>
                </CardHeader>
                <CardContent className={styles.serviceContent}>
                  <p className={styles.serviceDescription}>{service.description}</p>
                  <Button className={styles.serviceButton} variant="outline">
                    Ajouter au panier
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Questions Fréquentes</h2>
          </div>

          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Puis-je changer de forfait après l'achat ?</h3>
              <p className={styles.faqAnswer}>
                Oui, vous pouvez passer à un forfait supérieur à tout moment. 
                La différence de prix vous sera facturée.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Que se passe-t-il si je dépasse les limites ?</h3>
              <p className={styles.faqAnswer}>
                Vous pouvez acheter des services supplémentaires ou passer à un forfait supérieur.
                Votre compte ne sera pas suspendu.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Y a-t-il une période d'essai ?</h3>
              <p className={styles.faqAnswer}>
                Le forfait Découverte est gratuit et vous permet de tester toutes les fonctionnalités de base.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Les données sont-elles sauvegardées ?</h3>
              <p className={styles.faqAnswer}>
                Oui, toutes vos données sont automatiquement sauvegardées et sécurisées.
                Vous conservez l'accès même après votre mariage.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Prêt à commencer ?</h2>
            <p className={styles.ctaDescription}>
              Commencez gratuitement et passez à un forfait payant quand vous êtes prêt
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/register">
                <Button className={styles.primaryButton}>
                  Commencer gratuitement
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className={styles.secondaryButton}>
                  Nous contacter
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 