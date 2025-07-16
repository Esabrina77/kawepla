'use client';

import { useEffect, useState } from 'react';
import styles from './Tutorial.module.css';
import { TutorialStep } from '@/hooks/useTutorial';

interface TutorialBubbleProps {
  step: TutorialStep;
  position: { x: number; y: number };
  currentStepIndex: number;
  totalSteps: number;
  isVisible: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  showProgress?: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export const TutorialBubble: React.FC<TutorialBubbleProps> = ({
  step,
  position,
  currentStepIndex,
  totalSteps,
  isVisible,
  isFirstStep,
  isLastStep,
  showProgress = true,
  onNext,
  onPrev,
  onSkip,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <div
      className={`${styles.tutorialBubble} ${styles[step.position]} ${
        isVisible ? styles.visible : ''
      }`}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className={styles.bubbleContent}>
        <div className={styles.bubbleHeader}>
          <h3 className={styles.bubbleTitle}>{step.title}</h3>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fermer le tutoriel"
          >
            ×
          </button>
        </div>

        <p className={styles.bubbleDescription}>{step.description}</p>

        {showProgress && (
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {showProgress && (
          <div className={styles.progressText}>
            Étape {currentStepIndex + 1} sur {totalSteps}
          </div>
        )}
      </div>

      <div className={styles.bubbleActions}>
        {step.showSkipButton !== false && (
          <button
            className={`${styles.tutorialButton} ${styles.skipButton}`}
            onClick={onSkip}
          >
            Passer
          </button>
        )}

        {!isFirstStep && step.showBackButton !== false && (
          <button
            className={`${styles.tutorialButton} ${styles.backButton}`}
            onClick={onPrev}
          >
            {step.prevButtonText || 'Précédent'}
          </button>
        )}

        <button
          className={`${styles.tutorialButton} ${
            isLastStep ? styles.completeButton : styles.nextButton
          }`}
          onClick={onNext}
        >
          {isLastStep
            ? 'Terminer'
            : step.nextButtonText || 'Suivant'}
        </button>
      </div>
    </div>
  );
}; 