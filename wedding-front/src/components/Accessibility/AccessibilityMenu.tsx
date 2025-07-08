'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './Accessibility.module.css';

interface AccessibilityMenuProps {
  isMobile?: boolean;
}

export const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({ isMobile = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: 'normal',
    contrast: 'normal',
    font: 'normal'
  });
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Gérer le montage côté client
  useEffect(() => {
    setMounted(true);
    
    // Charger les préférences depuis localStorage
    const savedSettings = {
      fontSize: localStorage.getItem('accessibility-font-size') || 'normal',
      contrast: localStorage.getItem('accessibility-contrast') || 'normal',
      font: localStorage.getItem('accessibility-font') || 'normal'
    };
    
    setSettings(savedSettings);
    
    // Appliquer les paramètres au DOM
    applySettings(savedSettings);
  }, []);

  const applySettings = (newSettings: typeof settings) => {
    if (typeof window === 'undefined') return;
    
    const html = document.documentElement;
    
    // Appliquer la taille de police
    html.setAttribute('data-font-size', newSettings.fontSize);
    
    // Appliquer le contraste
    html.setAttribute('data-contrast', newSettings.contrast);
    
    // Appliquer la police
    html.setAttribute('data-font', newSettings.font);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSettingChange = (setting: keyof typeof settings, value: string) => {
    const newSettings = { ...settings, [setting]: value };
    setSettings(newSettings);
    
    // Sauvegarder dans localStorage
    localStorage.setItem(`accessibility-${setting.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    
    // Appliquer immédiatement
    applySettings(newSettings);
  };

  // Fermer le menu si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Gérer la touche Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  // Ne pas rendre le composant tant qu'il n'est pas monté côté client
  if (!mounted) {
    return (
      <div className={`${styles.accessibilityContainer} ${isMobile ? styles.mobileContainer : ''}`}>
        <button
          className={`${styles.accessibilityButton} ${isMobile ? styles.mobileButton : ''}`}
          aria-label="Options d'accessibilité"
          aria-expanded={false}
          title="Options d'accessibilité"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={styles.accessibilityIcon}
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <path d="M2 12h20" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.accessibilityContainer} ${isMobile ? styles.mobileContainer : ''}`} ref={menuRef}>
      <button
        onClick={toggleMenu}
        className={`${styles.accessibilityButton} ${isMobile ? styles.mobileButton : ''}`}
        aria-label="Ouvrir les options d'accessibilité"
        aria-expanded={isMenuOpen}
        title="Options d'accessibilité"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={styles.accessibilityIcon}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          <path d="M2 12h20" />
        </svg>
      </button>

      {isMenuOpen && (
        <div className={`${styles.accessibilityPopup} ${isMobile ? styles.mobilePopup : ''}`}>
          <div className={styles.popupHeader}>
            <h3>Options d'accessibilité</h3>
            <button
              onClick={closeMenu}
              className={styles.closeButton}
              aria-label="Fermer le menu d'accessibilité"
            >
              ×
            </button>
          </div>

          <div className={styles.popupContent}>
            <div className={styles.settingGroup}>
              <label className={styles.settingLabel}>
                Taille du texte
              </label>
              <div className={styles.settingOptions}>
                <button
                  onClick={() => handleSettingChange('fontSize', 'normal')}
                  className={`${styles.settingOption} ${settings.fontSize === 'normal' ? styles.active : ''}`}
                >
                  Normal
                </button>
                <button
                  onClick={() => handleSettingChange('fontSize', 'large')}
                  className={`${styles.settingOption} ${settings.fontSize === 'large' ? styles.active : ''}`}
                >
                  Grand
                </button>
              </div>
            </div>

            <div className={styles.settingGroup}>
              <label className={styles.settingLabel}>
                Contraste
              </label>
              <div className={styles.settingOptions}>
                <button
                  onClick={() => handleSettingChange('contrast', 'normal')}
                  className={`${styles.settingOption} ${settings.contrast === 'normal' ? styles.active : ''}`}
                >
                  Normal
                </button>
                <button
                  onClick={() => handleSettingChange('contrast', 'high')}
                  className={`${styles.settingOption} ${settings.contrast === 'high' ? styles.active : ''}`}
                >
                  Élevé
                </button>
              </div>
            </div>

            <div className={styles.settingGroup}>
              <label className={styles.settingLabel}>
                Police
              </label>
              <div className={styles.settingOptions}>
                <button
                  onClick={() => handleSettingChange('font', 'normal')}
                  className={`${styles.settingOption} ${settings.font === 'normal' ? styles.active : ''}`}
                >
                  Standard
                </button>
                <button
                  onClick={() => handleSettingChange('font', 'verdana')}
                  className={`${styles.settingOption} ${settings.font === 'verdana' ? styles.active : ''}`}
                >
                  Verdana
                </button>
                <button
                  onClick={() => handleSettingChange('font', 'dyslexic')}
                  className={`${styles.settingOption} ${settings.font === 'dyslexic' ? styles.active : ''}`}
                >
                  Dyslexique
                </button>
              </div>
            </div>

            <div className={styles.settingInfo}>
              <p>Ces paramètres sont sauvegardés dans votre navigateur et s'appliquent à toutes les pages du site.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 