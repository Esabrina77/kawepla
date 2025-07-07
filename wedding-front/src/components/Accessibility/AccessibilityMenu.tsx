import { useState, useEffect, useRef } from 'react';
import styles from './Accessibility.module.css';

type AccessibilityOptions = {
  font: 'featherscript' | 'dyslexic';
  contrast: 'normal' | 'high';
};

export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AccessibilityOptions>({
    font: 'featherscript',
    contrast: 'normal',
  });
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  const updateOption = (key: keyof AccessibilityOptions, value: string) => {
    setOptions(prev => ({ ...prev, [key]: value as any }));
    
    // Appliquer les changements
    if (key === 'font') {
      document.documentElement.setAttribute('data-font', value);
    } else if (key === 'contrast') {
      document.documentElement.setAttribute('data-contrast', value);
    }
  };

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.accessibilityContainer} ref={menuRef}>
      <button 
        onClick={toggleMenu}
        className={styles.accessibilityButton}
        aria-label="Options d'accessibilité"
        title="Ouvrir les options d'accessibilité"
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className={styles.accessibilityIcon}
        >
          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-18a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
        <span className={styles.accessibilityButtonText}>Accessibilité</span>
      </button>

      {isOpen && (
        <>
          <div className={styles.overlay} onClick={() => setIsOpen(false)} />
          <div className={styles.accessibilityPopup}>
            <div className={styles.popupHeader}>
              <h2>Options d'accessibilité</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className={styles.closeButton}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
          <div className={styles.accessibilitySection}>
            <h3>Police de caractères</h3>
            <select 
              value={options.font}
              onChange={(e) => updateOption('font', e.target.value)}
              aria-label="Choisir la police de caractères"
            >
                <option value="featherscript">Police standard</option>
                <option value="dyslexic">OpenDyslexic</option>
            </select>
          </div>

          <div className={styles.accessibilitySection}>
            <h3>Contraste</h3>
            <select 
              value={options.contrast}
              onChange={(e) => updateOption('contrast', e.target.value)}
              aria-label="Choisir le niveau de contraste"
            >
                <option value="normal">Contraste normal</option>
                <option value="high">Contraste élevé</option>
            </select>
          </div>
        </div>
        </>
      )}
    </div>
  );
} 