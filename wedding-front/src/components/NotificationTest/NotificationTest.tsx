'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Volume2, VolumeX } from 'lucide-react';
import styles from './NotificationTest.module.css';

export const NotificationTest = () => {
  const { 
    isSupported, 
    permission, 
    requestPermission, 
    notifyRSVPConfirmed, 
    notifyRSVPDeclined,
    notifyNewGuest,
    notifyNewMessage,
    playNotificationSound 
  } = useNotifications();
  
  const [isRequesting, setIsRequesting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      await requestPermission();
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const testNotifications = () => {
    // Test RSVP confirmé
    notifyRSVPConfirmed('Marie Dupont', 'événement de Sophie & Thomas');
    
    // Test RSVP refusé après 2 secondes
    setTimeout(() => {
      notifyRSVPDeclined('Jean Martin', 'événement de Sophie & Thomas');
    }, 2000);
    
    // Test nouvel invité après 4 secondes
    setTimeout(() => {
      notifyNewGuest('Pierre Durand', 'événement de Sophie & Thomas');
    }, 4000);
    
    // Test nouveau message après 6 secondes
    setTimeout(() => {
      notifyNewMessage('Marie Dupont', 'Merci pour l\'invitation ! Je serai ravie de venir.');
    }, 6000);
  };

  const testSound = () => {
    if (soundEnabled) {
      playNotificationSound();
    }
  };

  if (!isSupported) {
    return (
      <div className={styles.container}>
        <div className={styles.warning}>
          <Bell className={styles.warningIcon} />
          <span>Les notifications ne sont pas supportées sur votre navigateur</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Test des Notifications</h3>
      
      <div className={styles.status}>
        <span className={styles.statusLabel}>Statut :</span>
        <span className={`${styles.statusValue} ${styles[permission]}`}>
          {permission === 'granted' ? 'Activées' : 
           permission === 'denied' ? 'Refusées' : 'Non demandées'}
        </span>
      </div>

      <div className={styles.controls}>
        {permission !== 'granted' && (
          <button
            onClick={handleRequestPermission}
            disabled={isRequesting}
            className={styles.permissionButton}
          >
            {isRequesting ? 'Demande...' : 'Activer les notifications'}
          </button>
        )}

        {permission === 'granted' && (
          <>
            <button
              onClick={testNotifications}
              className={styles.testButton}
            >
              <Bell className={styles.buttonIcon} />
              Tester toutes les notifications
            </button>

            <button
              onClick={testSound}
              className={styles.soundButton}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className={styles.buttonIcon} />
                  Tester le son
                </>
              ) : (
                <>
                  <VolumeX className={styles.buttonIcon} />
                  Son désactivé
                </>
              )}
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={styles.toggleSoundButton}
            >
              {soundEnabled ? 'Désactiver le son' : 'Activer le son'}
            </button>
          </>
        )}
      </div>

      <div className={styles.info}>
        <p>Ce composant permet de tester le système de notifications :</p>
        <ul>
          <li>🎉 RSVP confirmé</li>
          <li>😔 RSVP refusé</li>
          <li>👥 Nouvel invité</li>
          <li>💬 Nouveau message</li>
        </ul>
      </div>
    </div>
  );
};
