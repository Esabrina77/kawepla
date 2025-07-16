'use client';

import { useEffect, useState } from 'react';
import { TutorialGuide } from './TutorialGuide';
import { TutorialConfig } from '@/hooks/useTutorial';

interface ConditionalTutorialProps {
  config: TutorialConfig;
  condition?: () => boolean;
  delay?: number;
}

export const ConditionalTutorial: React.FC<ConditionalTutorialProps> = ({ 
  config, 
  condition = () => true, 
  delay = 1000 
}) => {
  const [shouldShowTutorial, setShouldShowTutorial] = useState(false);

  useEffect(() => {
    const checkCondition = () => {
      if (condition()) {
        setShouldShowTutorial(true);
      } else {
        console.log(`Tutoriel ${config.id} non affiché car condition non remplie`);
      }
    };

    // Attendre que la page soit chargée avant de vérifier
    const timer = setTimeout(checkCondition, delay);
    
    return () => clearTimeout(timer);
  }, [condition, config.id, delay]);

  if (!shouldShowTutorial) {
    return null;
  }

  return <TutorialGuide config={config} />;
}; 