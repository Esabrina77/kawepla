import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card/Card';
import { Button } from '@/components/Button/Button';
import styles from '@/styles/site/features.module.css';
import Image from 'next/image';
import Link from 'next/link';

const currentFeatures = [
  {
    title: 'Invitations Numériques Personnalisées',
    description: 'Créez des invitations élégantes avec nos designs prédéfinis et personnalisez-les selon vos goûts.',
    icon: '/icons/design.svg',
    details: [
      'Designs prédéfinis de haute qualité',
      'Personnalisation des textes et informations',
      'Prévisualisation en temps réel',
      'Format adaptatif (mobile, desktop)',
      'Gestion des statuts (brouillon, publié, archivé)'
    ],
    status: 'available'
  },
  {
    title: 'Gestion Complète des Invités',
    description: 'Gérez facilement votre liste d\'invités avec import/export et catégorisation.',
    icon: '/icons/guests.svg',
    details: [
      'Import CSV/JSON/TXT en un clic',
      'Gestion des accompagnants (+1)',
      'Catégorisation VIP',
      'Restrictions alimentaires',
      'Upload de photos de profil'
    ],
    status: 'available'
  },
  {
    title: 'Système RSVP Sécurisé',
    description: 'Collectez les réponses de vos invités avec des liens personnalisés et sécurisés.',
    icon: '/icons/rsvp.svg',
    details: [
      'Liens RSVP uniques par invité',
      'Liens partageables pour groupes',
      'Gestion des réponses (confirmé, décliné, en attente)',
      'Suivi en temps réel des réponses',
      'Interface mobile optimisée'
    ],
    status: 'available'
  },
  {
    title: 'Albums Photos Collaboratifs',
    description: 'Créez des albums photos où vos invités peuvent partager leurs souvenirs.',
    icon: '/icons/photos.svg',
    details: [
      'Création d\'albums multiples',
      'Upload de photos par les invités',
      'Modération des photos',
      'Partage sécurisé avec liens',
      'Téléchargement des albums'
    ],
    status: 'available'
  },
  {
    title: 'Messagerie Intégrée',
    description: 'Communiquez directement avec vos invités via le système de messagerie.',
    icon: '/icons/discussions.svg',
    details: [
      'Conversations privées',
      'Messages en temps réel',
      'Notifications automatiques',
      'Historique des conversations',
      'Interface intuitive'
    ],
    status: 'available'
  },
  {
    title: 'Système d\'Abonnements',
    description: 'Choisissez le forfait qui correspond à vos besoins avec des limites claires.',
    icon: '/icons/planning.svg',
    details: [
      'Forfaits adaptés à tous les budgets',
      'Limites claires par forfait',
      'Paiement sécurisé via Stripe',
      'Changement de forfait facile',
      'Support client dédié'
    ],
    status: 'available'
  }
];

const upcomingFeatures = [
  {
    title: 'Analytics Avancées',
    description: 'Obtenez des insights détaillés sur vos invitations et réponses.',
    icon: '/icons/stats.svg',
    details: [
      'Tableaux de bord en temps réel',
      'Taux de réponse par catégorie',
      'Exportation des rapports',
      'Statistiques de participation',
      'Analyse des tendances'
    ],
    status: 'coming_soon'
  },
  {
    title: 'Intégrations Tierces',
    description: 'Connectez vos outils favoris pour une expérience complète.',
    icon: '/icons/planning.svg',
    details: [
      'Synchronisation Google Calendar',
      'Partage sur réseaux sociaux',
      'Intégration avec services de paiement',
      'Notifications SMS',
      'Synchronisation contacts'
    ],
    status: 'coming_soon'
  },
  {
    title: 'Événements Multiples',
    description: 'Gérez plusieurs événements liés à votre mariage.',
    icon: '/icons/guests.svg',
    details: [
      'Gestion fiançailles/mariage/réception',
      'Invités partagés entre événements',
      'Calendrier unifié',
      'Budgets séparés',
      'Planification coordonnée'
    ],
    status: 'coming_soon'
  }
];

export default function FeaturesPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Fonctionnalités</h1>
        <p className={styles.subtitle}>
          Découvrez tous les outils à votre disposition pour créer le mariage parfait
        </p>
      </header>

      <main className={styles.main}>
        {/* Fonctionnalités actuelles */}
        <section className={styles.featuresSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Fonctionnalités Disponibles</h2>
            <p className={styles.sectionSubtitle}>
              Toutes ces fonctionnalités sont actuellement disponibles et prêtes à l'emploi
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {currentFeatures.map((feature, index) => (
              <Card key={index} className={styles.featureCard}>
                <CardHeader className={styles.cardHeader}>
                  <div className={styles.iconContainer}>
                    <Image 
                      src={feature.icon} 
                      alt={feature.title}
                      width={40}
                      height={40}
                      className={styles.featureIcon}
                    />
                  </div>
                  <CardTitle className={styles.cardTitle}>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className={styles.cardContent}>
                  <p className={styles.description}>{feature.description}</p>
                  <ul className={styles.detailsList}>
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className={styles.detailItem}>
                        <span className={styles.checkmark}>✓</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                  <div className={styles.statusBadge}>
                    <span className={styles.statusAvailable}>Disponible</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Fonctionnalités à venir */}
        <section className={styles.upcomingSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Fonctionnalités à Venir</h2>
            <p className={styles.sectionSubtitle}>
              Ces fonctionnalités sont en cours de développement et seront bientôt disponibles
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {upcomingFeatures.map((feature, index) => (
              <Card key={index} className={`${styles.featureCard} ${styles.upcomingCard}`}>
                <CardHeader className={styles.cardHeader}>
                  <div className={styles.iconContainer}>
                    <Image 
                      src={feature.icon} 
                      alt={feature.title}
                      width={40}
                      height={40}
                      className={styles.featureIcon}
                    />
                  </div>
                  <CardTitle className={styles.cardTitle}>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className={styles.cardContent}>
                  <p className={styles.description}>{feature.description}</p>
                  <ul className={styles.detailsList}>
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className={styles.detailItem}>
                        <span className={styles.comingSoonMark}>⏳</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                  <div className={styles.statusBadge}>
                    <span className={styles.statusComingSoon}>Bientôt disponible</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Prêt à commencer ?</h2>
            <p className={styles.ctaDescription}>
              Créez votre première invitation en quelques minutes avec toutes ces fonctionnalités
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/register">
                <Button className={styles.primaryButton}>
                  Commencer gratuitement
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className={styles.secondaryButton}>
                  Voir les tarifs
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 