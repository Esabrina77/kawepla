import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card/Card';
import styles from '@/styles/site/features.module.css';
import Image from 'next/image';

const features = [
  {
    title: 'Designs Élégants',
    description: 'Une collection de designs modernes et personnalisables pour votre invitation de mariage.',
    icon: '/icons/design.svg',
    details: [
      'Thèmes variés et élégants',
      'Personnalisation complète',
      'Animations subtiles',
      'Responsive design'
    ]
  },
  {
    title: 'Gestion des Invités',
    description: 'Gérez facilement votre liste d\'invités et suivez les réponses en temps réel.',
    icon: '/icons/guests.svg',
    details: [
      'Import/export de listes',
      'Groupes d\'invités',
      'Statuts de présence',
      'Notes personnalisées'
    ]
  },
  {
    title: 'RSVP en Ligne',
    description: 'Système de réponse en ligne simple et efficace pour vos invités.',
    icon: '/icons/rsvp.svg',
    details: [
      'Formulaire personnalisé',
      'Notifications en temps réel',
      'Suivi des réponses',
      'Rappels automatiques'
    ]
  },
  {
    title: 'Album Photos',
    description: 'Partagez vos plus beaux moments avec vos invités.',
    icon: '/icons/photos.svg',
    details: [
      'Galerie responsive',
      'Upload facile',
      'Partage sécurisé',
      'Commentaires'
    ]
  },
  {
    title: 'Planning Interactif',
    description: 'Organisez le déroulement de votre journée de manière interactive.',
    icon: '/icons/planning.svg',
    details: [
      'Timeline visuelle',
      'Horaires détaillés',
      'Localisation GPS',
      'Synchronisation calendrier'
    ]
  },
  {
    title: 'Statistiques & Analyses',
    description: 'Suivez les statistiques de vos invitations et des réponses.',
    icon: '/icons/stats.svg',
    details: [
      'Tableaux de bord',
      'Graphiques détaillés',
      'Export des données',
      'Notifications personnalisées'
    ]
  }
];

export default function FeaturesPage() {
  return (
    <div className={styles.features}>
      <section className={styles.header}>
        <div className="container">
          <h1>Fonctionnalités</h1>
          <p>Découvrez tous les outils à votre disposition pour créer des invitations uniques</p>
        </div>
      </section>

      <section className={styles.featuresList}>
        <div className="container">
          <div className={styles.grid}>
            {features.map((feature) => (
              <Card key={feature.title} variant="elevated" className={styles.featureCard}>
                <CardHeader>
                  <div className={styles.iconWrapper}>
                    <Image
                      src={feature.icon}
                      alt={feature.title}
                      width={32}
                      height={32}
                    />
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
    </div>
  );
} 