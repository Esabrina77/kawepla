'use client';

import { createPortal } from 'react-dom';
import { TutorialOverlay } from './TutorialOverlay';
import { TutorialBubble } from './TutorialBubble';
import { useTutorial, TutorialConfig } from '@/hooks/useTutorial';
import { useEffect, useState } from 'react';

interface TutorialGuideProps {
  config: TutorialConfig;
  children?: React.ReactNode;
}

export const TutorialGuide: React.FC<TutorialGuideProps> = ({ config, children }) => {
  const [mounted, setMounted] = useState(false);
  const tutorial = useTutorial(config);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{children}</>;

  return (
    <>
      {children}
      {tutorial.isActive && 
        createPortal(
          <>
            <TutorialOverlay
              isVisible={tutorial.isVisible}
              targetElement={tutorial.targetElement}
              onOverlayClick={tutorial.skipTutorial}
              allowClickThrough={false}
            />
            {tutorial.currentStep && (
              <TutorialBubble
                step={tutorial.currentStep}
                position={tutorial.bubblePosition}
                currentStepIndex={tutorial.currentStepIndex}
                totalSteps={tutorial.totalSteps}
                isVisible={tutorial.isVisible}
                isFirstStep={tutorial.isFirstStep}
                isLastStep={tutorial.isLastStep}
                showProgress={config.showProgress}
                onNext={tutorial.nextStep}
                onPrev={tutorial.prevStep}
                onSkip={tutorial.skipTutorial}
                onClose={tutorial.skipTutorial}
              />
            )}
          </>,
          document.body
        )
      }
    </>
  );
};

// Composant utilitaire pour démarrer le tutoriel
interface TutorialTriggerProps {
  tutorialRef: ReturnType<typeof useTutorial>;
  buttonText?: string;
  showIcon?: boolean;
  className?: string;
}

export const TutorialTrigger: React.FC<TutorialTriggerProps> = ({
  tutorialRef,
  buttonText = "Démarrer le tutoriel",
  showIcon = true,
  className = "",
}) => {
  return (
    <button
      onClick={tutorialRef.startTutorial}
      className={`${className} tutorialTrigger`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {showIcon && <span>🎯</span>}
      {buttonText}
    </button>
  );
}; 