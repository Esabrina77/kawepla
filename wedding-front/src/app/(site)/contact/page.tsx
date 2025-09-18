'use client';

import React from 'react';
import { 
  Mail, 
  MessageSquare,
  Heart
} from 'lucide-react';
import styles from './contact.module.css';

export default function ContactPage() {

  return (
    <div className={styles.contactPage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Contactez-nous
            </h1>
            <p className={styles.heroDescription}>
              Une question sur Kawepla ? Nous sommes là pour vous aider.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className={styles.mainSection}>
        <div className={styles.container}>
          <div className={styles.contactCard}>
            <div className={styles.contactHeader}>
              <MessageSquare className="w-8 h-8" />
              <h2>Nous contacter</h2>
            </div>

            <div className={styles.contactMethod}>
              <div className={styles.contactIcon}>
                <Mail className="w-6 h-6" />
              </div>
              <div className={styles.contactContent}>
                <h3>Email</h3>
                <a href="mailto:kawepla.kaporelo@gmail.com" className={styles.contactLink}>
                  kawepla.kaporelo@gmail.com
                </a>
                <p>Nous vous répondons sous 24h</p>
              </div>
            </div>

            <div className={styles.quickStart}>
              <Heart className="w-6 h-6" />
              <div>
                <h3>Prêt à commencer ?</h3>
                <p>Créez votre première invitation gratuitement</p>
                <a href="/auth/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  Commencer maintenant
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
