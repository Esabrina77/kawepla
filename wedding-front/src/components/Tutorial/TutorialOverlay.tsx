'use client';

import { useEffect, useState } from 'react';
import styles from './Tutorial.module.css';

interface TutorialOverlayProps {
  isVisible: boolean;
  targetElement: HTMLElement | null;
  onOverlayClick?: () => void;
  allowClickThrough?: boolean;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  isVisible,
  targetElement,
  onOverlayClick,
  allowClickThrough = false,
}) => {
  const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!targetElement || !isVisible) return;

    const updateSpotlight = () => {
      const rect = targetElement.getBoundingClientRect();
      const padding = 8;
      
      setSpotlightStyle({
        left: rect.left - padding,
        top: rect.top - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });
    };

    updateSpotlight();

    // Mettre à jour la position si l'élément se déplace
    const observer = new ResizeObserver(updateSpotlight);
    observer.observe(targetElement);

    // Mettre à jour lors du défilement avec throttling pour de meilleures performances
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateSpotlight();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Écouter le scroll sur tous les conteneurs possibles
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', updateSpotlight);
    
    // Écouter aussi le scroll sur le conteneur parent si c'est un élément scrollable
    let scrollContainer = targetElement.parentElement;
    while (scrollContainer && scrollContainer !== document.body) {
      const computedStyle = window.getComputedStyle(scrollContainer);
      if (computedStyle.overflow === 'auto' || computedStyle.overflow === 'scroll' || 
          computedStyle.overflowY === 'auto' || computedStyle.overflowY === 'scroll') {
        scrollContainer.addEventListener('scroll', handleScroll, true);
        break;
      }
      scrollContainer = scrollContainer.parentElement;
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', updateSpotlight);
      if (scrollContainer && scrollContainer !== document.body) {
        scrollContainer.removeEventListener('scroll', handleScroll, true);
      }
    };
  }, [targetElement, isVisible]);

  if (!mounted) return null;

  return (
    <div
      className={`${styles.tutorialOverlay} ${!isVisible ? styles.hidden : ''}`}
      onClick={allowClickThrough ? undefined : onOverlayClick}
      style={{ pointerEvents: allowClickThrough ? 'none' : 'auto' }}
    >
      {targetElement && (
        <div
          className={`${styles.spotlight} ${styles.pulse}`}
          style={spotlightStyle}
        />
      )}
    </div>
  );
}; 