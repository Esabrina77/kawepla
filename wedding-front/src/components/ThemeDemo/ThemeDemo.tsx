'use client';

import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import styles from './ThemeDemo.module.css';

export const ThemeDemo: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <div className={styles.demoContainer}>
      <div className={styles.card}>
        <h2 className={styles.title}>Démonstration du Mode Sombre</h2>
        <p className={styles.description}>
          Utilisez l'icône flottante pour basculer entre les modes clair et sombre.
        </p>
        
        <div className={styles.info}>
          <p><strong>Mode actuel :</strong> {isDark ? 'Sombre' : 'Clair'}</p>
          <p><strong>Thème :</strong> {theme}</p>
        </div>

        <div className={styles.buttons}>
          <button 
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={toggleTheme}
          >
            Basculer le thème
          </button>
        </div>

        <div className={styles.features}>
          <h3>Fonctionnalités :</h3>
          <ul>
            <li>✅ Icône flottante déplaçable</li>
            <li>✅ Sauvegarde automatique de la position</li>
            <li>✅ Sauvegarde du thème dans localStorage</li>
            <li>✅ Détection automatique des préférences système</li>
            <li>✅ Transitions fluides</li>
            <li>✅ Design responsive</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
