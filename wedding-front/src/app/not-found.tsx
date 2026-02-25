'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import styles from './not-found.module.css';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    setMounted(true);
  }, []);

  return (
    <div className={styles.page} style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.3s ease' }}>
      {/* Decorative glowing orbs */}
      <div className={styles.orbTop} aria-hidden="true" />
      <div className={styles.orbBottom} aria-hidden="true" />

      {/* Floating particles */}
      <div className={styles.particles} aria-hidden="true">
        <span className={styles.particle} style={{ top: '12%', left: '8%', animationDelay: '0s' }} />
        <span className={styles.particle} style={{ top: '25%', right: '12%', animationDelay: '1.5s' }} />
        <span className={styles.particle} style={{ top: '60%', left: '15%', animationDelay: '3s' }} />
        <span className={styles.particle} style={{ top: '75%', right: '20%', animationDelay: '0.8s' }} />
        <span className={styles.particle} style={{ top: '40%', left: '5%', animationDelay: '2.2s' }} />
        <span className={styles.particle} style={{ top: '85%', left: '40%', animationDelay: '4s' }} />
        <span className={`${styles.particle} ${styles.particleLg}`} style={{ top: '18%', right: '25%', animationDelay: '1s' }} />
        <span className={`${styles.particle} ${styles.particleLg}`} style={{ top: '70%', left: '30%', animationDelay: '2.5s' }} />
      </div>

      {/* Animated rings */}
      <div className={styles.ring} aria-hidden="true" />
      <div className={styles.ringSmall} aria-hidden="true" />

      <div className={styles.content}>
        {/* 404 number */}
        <div className={styles.number}>
          <span className={styles.numberText}>404</span>
          <span className={styles.numberGlow} aria-hidden="true">404</span>
        </div>

        {/* Text */}
        <h1 className={styles.title}>Page introuvable</h1>
        <p className={styles.subtitle}>
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            onClick={() => window.history.back()}
            className={styles.btnSecondary}
          >
            <ArrowLeft size={18} />
            <span>Retour</span>
          </button>
          <Link href="/" className={styles.btnPrimary}>
            <Home size={18} />
            <span>Accueil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}