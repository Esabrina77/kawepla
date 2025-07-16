'use client';

import { useState, useEffect, useCallback } from 'react';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  showSkipButton?: boolean;
  showBackButton?: boolean;
  action?: () => void;
  nextButtonText?: string;
  prevButtonText?: string;
}

export interface TutorialConfig {
  id: string;
  title: string;
  steps: TutorialStep[];
  autoStart?: boolean;
  showProgress?: boolean;
  allowSkip?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
}

const TUTORIAL_STORAGE_KEY = 'kawepla_tutorial_seen';

export const useTutorial = (config: TutorialConfig) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [bubblePosition, setBubblePosition] = useState({ x: 0, y: 0 });

  // Désactiver le tutoriel sur mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const currentStep = config.steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === config.steps.length - 1;

  // Vérifier si le tutoriel a déjà été vu
  const hasSeen = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const seen = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    return seen ? JSON.parse(seen).includes(config.id) : false;
  }, [config.id]);

  // Marquer le tutoriel comme vu
  const markAsSeen = useCallback(() => {
    if (typeof window === 'undefined') return;
    const seen = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    const seenTutorials = seen ? JSON.parse(seen) : [];
    if (!seenTutorials.includes(config.id)) {
      seenTutorials.push(config.id);
      localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(seenTutorials));
    }
  }, [config.id]);

  // Calculer la position de la bulle
  const calculateBubblePosition = useCallback((element: HTMLElement, position: string) => {
    const rect = element.getBoundingClientRect();
    const bubbleWidth = 320;
    const bubbleHeight = 200;
    const offset = 20;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = rect.left + (rect.width / 2) - (bubbleWidth / 2);
        y = rect.top - bubbleHeight - offset;
        break;
      case 'bottom':
        x = rect.left + (rect.width / 2) - (bubbleWidth / 2);
        y = rect.bottom + offset;
        break;
      case 'left':
        x = rect.left - bubbleWidth - offset;
        y = rect.top + (rect.height / 2) - (bubbleHeight / 2);
        break;
      case 'right':
        x = rect.right + offset;
        y = rect.top + (rect.height / 2) - (bubbleHeight / 2);
        break;
    }

    // Ajuster si la bulle sort de l'écran
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (x < 10) x = 10;
    if (x + bubbleWidth > viewportWidth - 10) x = viewportWidth - bubbleWidth - 10;
    if (y < 10) y = 10;
    if (y + bubbleHeight > viewportHeight - 10) y = viewportHeight - bubbleHeight - 10;

    return { x, y };
  }, []);

  // Vérifier si un élément est vraiment visible et interactif
  const isElementVisible = useCallback((element: HTMLElement) => {
    if (!element || element.offsetParent === null) return false;
    
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return (
      rect.width > 0 && 
      rect.height > 0 && 
      style.visibility !== 'hidden' && 
      style.display !== 'none' &&
      style.opacity !== '0'
    );
  }, []);

  // Mettre à jour la position de l'élément cible
  const updateTargetElement = useCallback(() => {
    if (!currentStep) return;

    // Essayer de trouver l'élément avec plusieurs sélecteurs
    const selectors = currentStep.targetSelector.split(',').map(s => s.trim());
    let element: HTMLElement | null = null;
    let foundSelector = '';
    
    // Filtrer les sélecteurs mobiles puisque le tutoriel est désactivé sur mobile
    const desktopSelectors = selectors.filter(s => !s.includes('mobile-'));
    
    for (const selector of desktopSelectors) {
      const foundElement = document.querySelector(selector) as HTMLElement;
      if (foundElement && isElementVisible(foundElement)) {
        element = foundElement;
        foundSelector = selector;
        break;
      }
    }

    // Si l'élément n'est pas trouvé, ne pas passer automatiquement à l'étape suivante
    if (!element) {
      console.warn(`Élément non trouvé pour l'étape ${currentStep.id}:`, currentStep.targetSelector);
      // Arrêter le tutoriel si l'élément n'est pas trouvé
      setIsActive(false);
      setIsVisible(false);
      return;
    }

    // Traitement de l'élément trouvé
    if (targetElement) {
      targetElement.classList.remove('tutorial-highlighted');
    }
    
    setTargetElement(element);
    const position = calculateBubblePosition(element, currentStep.position);
    setBubblePosition(position);
    element.classList.add('tutorial-highlighted');
    
    console.log(`Élément trouvé pour ${currentStep.id}:`, foundSelector, element);
  }, [currentStep, calculateBubblePosition, targetElement, isElementVisible]);

  // Démarrer le tutoriel
  const startTutorial = useCallback(() => {
    setIsActive(true);
    setCurrentStepIndex(0);
    setIsVisible(true);
    // Bloquer le scroll pendant le tutoriel
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }, []);

  // Arrêter le tutoriel
  const stopTutorial = useCallback(() => {
    // Retirer la classe highlighted de l'élément actuel
    if (targetElement) {
      targetElement.classList.remove('tutorial-highlighted');
    }
    
    setIsActive(false);
    setIsVisible(false);
    setTargetElement(null);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'auto';
    }
  }, [targetElement]);

  // Terminer le tutoriel
  const completeTutorial = useCallback(() => {
    markAsSeen();
    stopTutorial();
    config.onComplete?.();
  }, [markAsSeen, stopTutorial, config]);

  // Passer le tutoriel
  const skipTutorial = useCallback(() => {
    markAsSeen();
    stopTutorial();
    config.onSkip?.();
  }, [markAsSeen, stopTutorial, config]);

  // Étape suivante
  const nextStep = useCallback(() => {
    if (currentStep?.action) {
      currentStep.action();
    }

    if (isLastStep) {
      completeTutorial();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentStep, isLastStep, completeTutorial]);

  // Étape précédente
  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [isFirstStep]);

  // Redémarrer le tutoriel (pour les paramètres)
  const restartTutorial = useCallback(() => {
    if (typeof window === 'undefined') return;
    const seen = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (seen) {
      const seenTutorials = JSON.parse(seen);
      const updatedSeen = seenTutorials.filter((id: string) => id !== config.id);
      localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(updatedSeen));
    }
    startTutorial();
  }, [config.id, startTutorial]);

  // Effet pour démarrer automatiquement le tutoriel
  useEffect(() => {
    if (config.autoStart && !hasSeen()) {
      // Délai pour laisser le temps à la page de se charger
      const timer = setTimeout(() => {
        startTutorial();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [config.autoStart, hasSeen, startTutorial]);

  // Effet de nettoyage pour s'assurer que le scroll est restauré
  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'auto';
      }
    };
  }, []);

  // Effet pour mettre à jour l'élément cible
  useEffect(() => {
    if (isActive && currentStep) {
      const timer = setTimeout(() => {
        updateTargetElement();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isActive, currentStep, updateTargetElement]);

  // Effet pour gérer les redimensionnements et le scroll
  useEffect(() => {
    if (!isActive || !targetElement) return;

    const handleResize = () => {
      updateTargetElement();
    };

    // Mettre à jour la position de la bulle lors du scroll avec throttling
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (targetElement) {
            const position = calculateBubblePosition(targetElement, currentStep?.position || 'bottom');
            setBubblePosition(position);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    
    // Écouter aussi le scroll sur les conteneurs parents scrollables
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
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      if (scrollContainer && scrollContainer !== document.body) {
        scrollContainer.removeEventListener('scroll', handleScroll, true);
      }
    };
  }, [isActive, targetElement, updateTargetElement, calculateBubblePosition, currentStep]);

  // Effet pour gérer l'échappement
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && config.allowSkip) {
        skipTutorial();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, config.allowSkip, skipTutorial]);

  // Si on est sur mobile, retourner un objet inactif APRÈS tous les hooks
  if (isMobile) {
    return {
      isActive: false,
      isVisible: false,
      currentStep: null,
      currentStepIndex: 0,
      totalSteps: 0,
      isFirstStep: true,
      isLastStep: true,
      targetElement: null,
      bubblePosition: { x: 0, y: 0 },
      startTutorial: () => {},
      stopTutorial: () => {},
      completeTutorial: () => {},
      skipTutorial: () => {},
      nextStep: () => {},
      prevStep: () => {},
      restartTutorial: () => {},
      hasSeen: () => true,
      progress: 0,
    };
  }

  return {
    isActive,
    isVisible,
    currentStep,
    currentStepIndex,
    totalSteps: config.steps.length,
    isFirstStep,
    isLastStep,
    targetElement,
    bubblePosition,
    startTutorial,
    stopTutorial,
    completeTutorial,
    skipTutorial,
    nextStep,
    prevStep,
    restartTutorial,
    hasSeen,
    progress: ((currentStepIndex + 1) / config.steps.length) * 100,
  };
}; 