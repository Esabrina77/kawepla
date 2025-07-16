'use client';

import { useState, useEffect } from 'react';
import { dashboardTutorialConfig, invitationsTutorialConfig } from './tutorialConfig';
import { TutorialGuide } from './TutorialGuide';
import styles from './Tutorial.module.css';

export const TutorialDemo: React.FC = () => {
  const [activeTutorial, setActiveTutorial] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const startDashboardTutorial = () => {
    setActiveTutorial('dashboard');
  };

  const startInvitationsTutorial = () => {
    setActiveTutorial('invitations');
  };

  const resetTutorials = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kawepla_tutorial_seen');
      window.location.reload();
    }
  };

  const onTutorialComplete = () => {
    setActiveTutorial(null);
  };

  if (!mounted) return null;

  return (
    <>
      {activeTutorial === 'dashboard' && (
        <TutorialGuide 
          config={{
            ...dashboardTutorialConfig,
            autoStart: true,
            onComplete: onTutorialComplete,
            onSkip: onTutorialComplete
          }}
        >
          <div />
        </TutorialGuide>
      )}
      
      {activeTutorial === 'invitations' && (
        <TutorialGuide 
          config={{
            ...invitationsTutorialConfig,
            autoStart: true,
            onComplete: onTutorialComplete,
            onSkip: onTutorialComplete
          }}
        >
          <div />
        </TutorialGuide>
      )}
      
      <div style={{ 
        padding: '20px', 
        background: '#f8f9fa', 
        borderRadius: '8px', 
        margin: '20px 0',
        border: '1px solid #e9ecef' 
      }}>
        <h3 style={{ marginBottom: '16px', color: '#495057' }}>
          🎯 Tutoriels disponibles
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={startDashboardTutorial}
            className={styles.startTutorialButton}
            disabled={activeTutorial !== null}
          >
            📊 Tutoriel Dashboard
          </button>
          
          <button
            onClick={startInvitationsTutorial}
            className={styles.startTutorialButton}
            disabled={activeTutorial !== null}
          >
            💌 Tutoriel Invitations
          </button>
          
          <button
            onClick={resetTutorials}
            style={{
              padding: '8px 16px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🔄 Réinitialiser tous les tutoriels
          </button>
        </div>
        
        <p style={{ 
          fontSize: '12px', 
          color: '#6c757d', 
          marginTop: '12px',
          marginBottom: '0'
        }}>
          Le tutoriel principal se lance automatiquement lors de la première visite.
        </p>
      </div>
    </>
  );
}; 