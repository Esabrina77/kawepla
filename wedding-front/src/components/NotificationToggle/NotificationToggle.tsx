'use client';
import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import styles from './NotificationToggle.module.css';

export const NotificationToggle = () => {
  const { isSupported, permission, isSubscribed, requestPermission, subscribeToPushNotifications, unsubscribeFromPushNotifications } = useNotifications();
  const { token } = useAuth();
  const [isRequesting, setIsRequesting] = useState(false);
  const [status, setStatus] = useState<string>('');

  // Abonnement automatique quand l'utilisateur se connecte
  useEffect(() => {
    if (token && permission === 'granted' && !isSubscribed) {
      handleAutoSubscribe();
    }
  }, [token, permission, isSubscribed]);

  const handleAutoSubscribe = async () => {
    if (!token) return;
    
    setStatus('Abonnement automatique...');
    const success = await subscribeToPushNotifications();
    
    if (success) {
      setStatus('Notifications activées automatiquement !');
      setTimeout(() => setStatus(''), 3000);
    } else {
      setStatus('Échec de l\'abonnement automatique');
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const handleToggleNotifications = async () => {
    if (!isSupported) return;

    setIsRequesting(true);
    setStatus('');

    try {
      if (permission === 'default') {
        // Demander la permission
        const granted = await requestPermission();
        if (granted) {
          // S'abonner automatiquement
          const subscribed = await subscribeToPushNotifications();
          if (subscribed) {
            setStatus('Notifications activées !');
          } else {
            setStatus('Erreur lors de l\'abonnement');
          }
        } else {
          setStatus('Permission refusée');
        }
      } else if (permission === 'granted' && isSubscribed) {
        // Se désabonner
        const unsubscribed = await unsubscribeFromPushNotifications();
        if (unsubscribed) {
          setStatus('Notifications désactivées');
        } else {
          setStatus('Erreur lors du désabonnement');
        }
      } else if (permission === 'granted' && !isSubscribed) {
        // S'abonner
        const subscribed = await subscribeToPushNotifications();
        if (subscribed) {
          setStatus('Notifications activées !');
        } else {
          setStatus('Erreur lors de l\'abonnement');
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors du toggle des notifications:', error);
      setStatus('Erreur inattendue');
    } finally {
      setIsRequesting(false);
      setTimeout(() => setStatus(''), 3000);
    }
  };

  if (!isSupported) {
    return (
      <div className={styles.notificationToggle}>
        <div className={styles.warning}>
          ⚠️ Les notifications ne sont pas supportées sur votre navigateur
        </div>
      </div>
    );
  }

  const isEnabled = permission === 'granted' && isSubscribed;
  const isDefault = permission === 'default';
  const isDenied = permission === 'denied';

  return (
    <div className={styles.notificationToggle}>
      <button 
        onClick={handleToggleNotifications}
        disabled={isRequesting || isDenied}
        className={`${styles.toggleButton} ${isEnabled ? styles.enabled : styles.disabled}`}
      >
        {isEnabled ? (
          <Bell className={styles.icon} />
        ) : (
          <BellOff className={styles.icon} />
        )}
        <span className={styles.label}>
          {isRequesting ? 'Activation...' : 
           isEnabled ? 'Notifications ON' : 
           isDefault ? 'Activer notifications' : 
           isDenied ? 'Notifications bloquées' : 
           'Notifications OFF'}
        </span>
      </button>
      
      {status && (
        <div className={`${styles.status} ${status.includes('Erreur') ? styles.error : styles.success}`}>
          {status}
        </div>
      )}
      
      {isDefault && (
        <div className={styles.helpText}>
          Activez les notifications pour être informé des nouvelles réponses RSVP, même quand le navigateur est fermé
        </div>
      )}
      
      {isDenied && (
        <div className={styles.helpText}>
          Les notifications ont été bloquées. Autorisez-les dans les paramètres de votre navigateur.
        </div>
      )}
      
      {isEnabled && (
        <div className={styles.helpText}>
          ✅ Vous recevrez des notifications même avec le navigateur fermé
        </div>
      )}
    </div>
  );
};
