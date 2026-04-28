'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import styles from './MobileOptimizationNotice.module.css';

const MobileOptimizationNotice: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Déterminer le rôle en fonction de l'URL pour appliquer les bonnes couleurs
  const getRole = () => {
    if (pathname?.startsWith('/provider')) return 'provider';
    if (pathname?.startsWith('/super-admin')) return 'admin';
    return 'host'; // Par défaut client/host
  };

  const role = getRole();

  useEffect(() => {
    // Check if dismissed in localStorage
    const isDismissed = localStorage.getItem('mobile_notice_dismissed');
    
    // Check if mobile (simple screen width check)
    const isMobile = window.innerWidth < 1024;

    if (isMobile && !isDismissed) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = (dontShowAgain: boolean) => {
    setIsVisible(false);
    if (dontShowAgain) {
      localStorage.setItem('mobile_notice_dismissed', 'true');
    }
  };

  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={`${styles.container} ${styles[role]}`}>
        <button 
          className={styles.closeButton} 
          onClick={() => handleDismiss(false)}
          title="Fermer"
        >
          <X size={20} />
        </button>

        <div className={styles.iconWrapper}>
          <Smartphone className={styles.phoneIcon} size={24} />
          <div className={styles.arrow}>→</div>
          <Monitor className={styles.desktopIcon} size={32} />
        </div>

        <h3 className={styles.title}>Expérience optimisée</h3>
        <p className={styles.description}>
          Pour une utilisation optimale de vos outils de planification, nous vous recommandons d'utiliser un écran plus grand (tablette ou ordinateur).
        </p>
        
        <div className={styles.actions}>
          <button 
            className={styles.primaryButton} 
            onClick={() => handleDismiss(false)}
          >
            Continuer sur mobile
          </button>
          <button 
            className={styles.secondaryButton} 
            onClick={() => handleDismiss(true)}
          >
            Ne plus afficher ce message
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileOptimizationNotice;
