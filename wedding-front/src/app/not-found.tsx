'use client';

import Link from 'next/link';
import { Button } from '@/components/Button/Button';
import { VineAnimation } from '@/components/VineAnimation/VineAnimation';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <VineAnimation />
      
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>
        
        <h1 className={styles.title}>Page introuvable</h1>
        
        <p className={styles.message}>
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className={styles.suggestions}>
          <h3>Que souhaitez-vous faire ?</h3>
          <div className={styles.linkGrid}>
            <Link href="/" className={styles.linkCard}>
              <div className={styles.linkIcon}>🏠</div>
              <div>
                <h4>Retour à l'accueil</h4>
                <p>Découvrez nos services</p>
              </div>
            </Link>
            
            <Link href="/auth/login" className={styles.linkCard}>
              <div className={styles.linkIcon}>🔐</div>
              <div>
                <h4>Se connecter</h4>
                <p>Accéder à votre compte</p>
              </div>
            </Link>
            
            <Link href="/features" className={styles.linkCard}>
              <div className={styles.linkIcon}>✨</div>
              <div>
                <h4>Nos fonctionnalités</h4>
                <p>Découvrez ce que nous offrons</p>
              </div>
            </Link>
            
            <Link href="/contact" className={styles.linkCard}>
              <div className={styles.linkIcon}>📞</div>
              <div>
                <h4>Nous contacter</h4>
                <p>Besoin d'aide ?</p>
              </div>
            </Link>
          </div>
        </div>
        
        <div className={styles.actions}>
          <Button 
            onClick={() => window.history.back()} 
            variant="outline"
          >
            ← Retour
          </Button>
          <Link href="/">
            <Button variant="primary">
              🏠 Accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 