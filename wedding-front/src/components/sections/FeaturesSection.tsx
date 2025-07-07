'use client';

import { Card } from '@/components/Card/Card';
import styles from '@/styles/site/home.module.css';
import Image from 'next/image';

export default function FeaturesSection() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>Tout ce dont vous avez besoin</h2>
          <p>Des outils puissants pour créer l'invitation parfaite</p>
        </div>
        <div className={styles.featuresGrid}>
          <Card className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Image src="/icons/design.svg" alt="Design" width={64} height={64} />
            </div>
            <h3>Design Personnalisé</h3>
            <p>Créez une invitation qui reflète votre style avec nos modèles élégants</p>
          </Card>
          <Card className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Image src="/icons/guests.svg" alt="Invités" width={64} height={64} />
            </div>
            <h3>Gestion des Invités</h3>
            <p>Gérez facilement votre liste d'invités et suivez les RSVP</p>
          </Card>
          <Card className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Image src="/icons/photos.svg" alt="Photos" width={64} height={64} />
            </div>
            <h3>Albums Photos</h3>
            <p>Partagez vos moments précieux avec vos invités</p>
          </Card>
        </div>
      </div>
    </section>
  );
} 