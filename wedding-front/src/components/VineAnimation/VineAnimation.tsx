'use client';

import React from 'react';
import styles from '@/styles/site/home.module.css';

export const VineAnimation = () => {
  return (
    <div className={styles.vineContainer}>
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 1920 1080" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={styles.floatingVine}
      >
        {/* Première liane - Haut vers droite */}
        <path
          className={`${styles.vine} ${styles.vine1}`}
          d="M-100 150 C200 180, 600 280, 1000 180 C1400 80, 1800 250, 2100 150"
          stroke="white"
          strokeWidth="2"
          fill="none"
        />

        {/* Deuxième liane - Milieu droit vers gauche */}
        <path
          className={`${styles.vine} ${styles.vine2}`}
          d="M2020 450 C1700 380, 1300 520, 900 420 C500 520, 200 380, -100 450"
          stroke="white"
          strokeWidth="2"
          fill="none"
        />

        {/* Troisième liane - Milieu bas gauche vers droite */}
        <path
          className={`${styles.vine} ${styles.vine3}`}
          d="M-50 680 C300 580, 700 720, 1100 620 C1500 720, 1800 580, 2100 680"
          stroke="white"
          strokeWidth="2"
          fill="none"
        />

        {/* Quatrième liane - Bas droit vers gauche */}
        <path
          className={`${styles.vine} ${styles.vine4}`}
          d="M1970 850 C1600 950, 1200 750, 800 850 C400 750, 100 950, -100 850"
          stroke="white"
          strokeWidth="2"
          fill="none"
        />

        {/* Points décoratifs ajustés */}
        <circle cx="1000" cy="180" r="3" fill="white" className={styles.floatingVine} />
        <circle cx="900" cy="420" r="3" fill="white" className={styles.floatingVine} />
        <circle cx="1100" cy="620" r="3" fill="white" className={styles.floatingVine} />
        <circle cx="800" cy="850" r="3" fill="white" className={styles.floatingVine} />
        <circle cx="600" cy="300" r="3" fill="white" className={styles.floatingVine} />
        <circle cx="1400" cy="500" r="3" fill="white" className={styles.floatingVine} />
        <circle cx="400" cy="700" r="3" fill="white" className={styles.floatingVine} />
        <circle cx="1600" cy="750" r="3" fill="white" className={styles.floatingVine} />
        <circle cx="200" cy="400" r="3" fill="white" className={styles.floatingVine} />
        <circle cx="1800" cy="350" r="3" fill="white" className={styles.floatingVine} />
      </svg>
    </div>
  );
}; 