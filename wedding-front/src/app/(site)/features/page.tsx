import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card/Card';
import { Button } from '@/components/Button/Button';
import styles from '@/styles/site/features.module.css';
import Image from 'next/image';
import Link from 'next/link';

const currentFeatures = [
  {
    title: 'Invitations Personnalisées',
    description: 'Créez jusqu\'à 2 invitations avec tous les détails de votre mariage.',
    icon: '/icons/design.svg',
    details: [
      'Formulaire complet de création',
      'Designs élégants disponibles',
      'Prévisualisation en temps réel',
      'Statuts brouillon/publié'
    ],
    status: 'available'
  },
  {
    title: 'Gestion des Invités',
    description: 'Gérez jusqu\'à 5 invités par invitation avec import en masse.',
    icon: '/icons/guests.svg',
    details: [
      'Ajout manuel et import CSV/JSON',
      'Validation complète des données',
      'Badges VIP et accompagnants',
      'Recherche et filtrage avancés'
    ],
    status: 'available'
  },
  {
    title: 'RSVP Sécurisé',
    description: 'Système de réponse en ligne avec tokens uniques.',
    icon: '/icons/rsvp.svg',
    details: [
      'Formulaire public sécurisé',
      'Gestion des restrictions alimentaires',
      'Suivi des accompagnants',
      'Page de remerciement personnalisée'
    ],
    status: 'available'
  },
  {
    title: 'Envoi d\'Emails',
    description: 'Envoyez vos invitations par email avec suivi des statuts.',
    icon: '/icons/planning.svg',
    details: [
      'Envoi individuel ou en masse',
      'Système de rappels automatiques',
      'Suivi des envois et ouvertures',
      'Templates personnalisés'
    ],
    status: 'available'
  },
  {
    title: 'Statistiques en Temps Réel',
    description: 'Suivez les réponses et statistiques de vos invitations.',
    icon: '/icons/stats.svg',
    details: [
      'Dashboard complet',
      'Compteurs confirmés/refusés',
      'Taux de réponse',
      'Export des données CSV'
    ],
    status: 'available'
  },
  {
    title: 'Application PWA',
    description: 'Installez l\'app sur votre téléphone comme une app native.',
    icon: '/icons/money.svg',
    details: [
      'Installation mobile/desktop',
      'Fonctionnement hors ligne',
      'Interface responsive',
      'Performance optimisée'
    ],
    status: 'available'
  }
];

const futureFeatures = [
  {
    title: 'Invitations Illimitées',
    description: 'Plus de limites sur le nombre d\'invitations et d\'invités.',
    icon: '/icons/design.svg',
    details: [
      'Invitations sans limite',
      'Invités illimités',
      'Gestion multi-événements',
      'Historique complet'
    ],
    status: 'coming-soon'
  },
  {
    title: 'Designs Premium',
    description: 'Thèmes avancés avec animations et personnalisation poussée.',
    icon: '/icons/design.svg',
    details: [
      'Thèmes animés',
      'Personnalisation avancée',
      'Couleurs personnalisées',
      'Polices premium'
    ],
    status: 'coming-soon'
  },
  {
    title: 'Album Photos',
    description: 'Partagez vos plus beaux moments avec vos invités.',
    icon: '/icons/photos.svg',
    details: [
      'Galerie responsive',
      'Upload facile',
      'Partage sécurisé',
      'Commentaires des invités'
    ],
    status: 'coming-soon'
  },
  {
    title: 'Vidéos d\'Invitation',
    description: 'Créez des invitations vidéo personnalisées.',
    icon: '/icons/photos.svg',
    details: [
      'Templates vidéo',
      'Montage simplifié',
      'Musique personnalisée',
      'Partage optimisé'
    ],
    status: 'coming-soon'
  },
  {
    title: 'Notifications SMS',
    description: 'Envoyez des rappels par SMS à vos invités.',
    icon: '/icons/planning.svg',
    details: [
      'SMS automatiques',
      'Rappels programmés',
      'Confirmation par SMS',
      'Suivi des livraisons'
    ],
    status: 'coming-soon'
  },
  {
    title: 'Multi-langues',
    description: 'Support international avec traductions automatiques.',
    icon: '/icons/guests.svg',
    details: [
      'Interface multilingue',
      'Invitations traduites',
      'Détection automatique',
      'Support RTL'
    ],
    status: 'coming-soon'
  },
  {
    title: 'Intégrations Avancées',
    description: 'Connectez votre mariage aux services populaires.',
    icon: '/icons/planning.svg',
    details: [
      'Google Calendar',
      'Réseaux sociaux',
      'Services de livraison',
      'Plateformes de paiement'
    ],
    status: 'coming-soon'
  },
  {
    title: 'Analytics Premium',
    description: 'Analyses poussées avec géolocalisation et insights.',
    icon: '/icons/stats.svg',
    details: [
      'Heatmaps géographiques',
      'Insights comportementaux',
      'Rapports personnalisés',
      'Prédictions IA'
    ],
    status: 'coming-soon'
  }
];

export default function FeaturesPage() {
  return (
    <div className={styles.features}>
      <section className={styles.header}>
        <div className="container">
          <h1>Fonctionnalités</h1>
          <p>Découvrez ce qui est disponible maintenant et ce qui arrive bientôt</p>
          <div className={styles.versionBadge}>
            <span>🚀 Version 1.0 - Bêta Gratuite</span>
          </div>
        </div>
      </section>

      {/* Fonctionnalités actuelles */}
      <section className={styles.currentFeatures}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>✅ Disponible maintenant</h2>
            <p>Toutes ces fonctionnalités sont gratuites en version V1</p>
          </div>
          <div className={styles.grid}>
            {currentFeatures.map((feature) => (
              <Card key={feature.title} variant="elevated" className={`${styles.featureCard} ${styles.available}`}>
                <CardHeader>
                  <div className={styles.iconWrapper}>
                    <Image
                      src={feature.icon}
                      alt={feature.title}
                      width={32}
                      height={32}
                    />
                    <span className={styles.statusBadge}>Disponible</span>
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <p className={styles.description}>{feature.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className={styles.detailsList}>
                    {feature.details.map((detail) => (
                      <li key={detail}>
                        <svg
                          className={styles.checkIcon}
                          width="20"
                          height="20"
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
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnalités futures */}
      <section className={styles.futureFeatures}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>🚧 Prochainement disponibles</h2>
            <p>Ces fonctionnalités seront disponibles dans les prochaines versions</p>
          </div>
          <div className={styles.grid}>
            {futureFeatures.map((feature) => (
              <Card key={feature.title} variant="default" className={`${styles.featureCard} ${styles.comingSoon}`}>
                <CardHeader>
                  <div className={styles.iconWrapper}>
                    <Image
                      src={feature.icon}
                      alt={feature.title}
                      width={32}
                      height={32}
                    />
                    <span className={styles.statusBadge}>Bientôt</span>
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <p className={styles.description}>{feature.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className={styles.detailsList}>
                    {feature.details.map((detail) => (
                      <li key={detail}>
                        <svg
                          className={styles.checkIcon}
                          width="20"
                          height="20"
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
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Limites actuelles */}
      <section className={styles.limitations}>
        <div className="container">
          <Card variant="elevated" className={styles.limitationsCard}>
            <CardHeader>
              <CardTitle>📋 Limites de la version V1 (Gratuite)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.limitationsList}>
                <div className={styles.limitation}>
                  <span className={styles.limitNumber}>2</span>
                  <div>
                    <h4>Invitations maximum</h4>
                    <p>Vous pouvez créer jusqu'à 2 invitations différentes</p>
                  </div>
                </div>
                <div className={styles.limitation}>
                  <span className={styles.limitNumber}>5</span>
                  <div>
                    <h4>Invités par invitation</h4>
                    <p>Chaque invitation peut contenir jusqu'à 5 invités</p>
                  </div>
                </div>
                <div className={styles.limitation}>
                  <span className={styles.limitNumber}>10</span>
                  <div>
                    <h4>Invités total</h4>
                    <p>Maximum 10 invités au total sur votre compte</p>
                  </div>
                </div>
              </div>
              <div className={styles.upgradeInfo}>
                <p>Ces limites seront levées dans les versions payantes futures</p>
                <Link href="/pricing">
                  <Button variant="primary">
                    Voir la roadmap
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to action */}
      <section className={styles.cta}>
        <div className="container">
          <h2>Prêt à commencer ?</h2>
          <p>Créez votre première invitation gratuitement dès maintenant</p>
          <div className={styles.ctaButtons}>
            <Link href="/auth/register">
              <Button variant="primary" size="large">
                Commencer gratuitement
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="large">
                Voir les tarifs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 