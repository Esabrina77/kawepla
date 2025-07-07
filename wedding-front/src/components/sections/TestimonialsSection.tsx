'use client';

import { Card } from '@/components/Card/Card';
import styles from '@/styles/site/home.module.css';
import Image from 'next/image';

export default function TestimonialsSection() {
  return (
    <section className={styles.testimonials}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>Ce que disent nos clients</h2>
          <p>Découvrez les expériences de couples heureux</p>
        </div>
        <div className={styles.testimonialsGrid}>
          <Card className={styles.testimonialCard}>
            <div className={styles.testimonialHeader}>
              <div className={styles.testimonialImage}>
                <Image src="/testimonials/couple1.jpg" alt="Marie & Jean" width={60} height={60} />
              </div>
              <div className={styles.testimonialInfo}>
                <h4>Marie & Jean</h4>
                <p>Juin 2023</p>
              </div>
            </div>
            <p className={styles.testimonialContent}>
              "Un service exceptionnel qui a rendu notre planification de mariage tellement plus facile !"
            </p>
          </Card>
          <Card className={styles.testimonialCard}>
            <div className={styles.testimonialHeader}>
              <div className={styles.testimonialImage}>
                <Image src="/testimonials/couple2.jpg" alt="Sophie & Thomas" width={60} height={60} />
              </div>
              <div className={styles.testimonialInfo}>
                <h4>Sophie & Thomas</h4>
                <p>Mai 2023</p>
              </div>
            </div>
            <p className={styles.testimonialContent}>
              "Des designs magnifiques et une interface très intuitive. Hautement recommandé !"
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
} 