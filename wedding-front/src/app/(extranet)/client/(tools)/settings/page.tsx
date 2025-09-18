'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import styles from './settings.module.css';
import { User, Settings, Bell, Mail, User as UserIcon } from 'lucide-react';

export default function SettingsPage() {
  const { user, token } = useAuth();
  const { permission, isSubscribed, subscribeToPushNotifications, unsubscribeFromPushNotifications } = useNotifications();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: '' // Placeholder, needs to be added to User model if applicable
      });
    }
  }, [user]);

  useEffect(() => {
    setNotificationsEnabled(isSubscribed && permission === 'granted');
  }, [isSubscribed, permission]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationToggle = async () => {
    if (!notificationsEnabled) {
      const success = await subscribeToPushNotifications();
      if (success) {
        setNotificationsEnabled(true);
        setMessage('Notifications activées avec succès');
      } else {
        setMessage('Erreur lors de l\'activation des notifications');
      }
    } else {
      const success = await unsubscribeFromPushNotifications();
      if (success) {
        setNotificationsEnabled(false);
        setMessage('Notifications désactivées avec succès');
      } else {
        setMessage('Erreur lors de la désactivation des notifications');
      }
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implémenter la mise à jour du profil
      setMessage('Profil mis à jour avec succès');
    } catch (error) {
      setMessage('Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (!user) {
    return (
      <div className={styles.settingsContainer}>
        <div className={styles.loading}>Chargement...</div>
      </div>
    );
  }

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.header}>
        <div className={styles.badge}>
          <Settings size={16} />
          Paramètres
        </div>
        <h1 className={styles.title}>
          Gestion de votre <span className={styles.titleAccent}>compte</span>
        </h1>
        <p className={styles.subtitle}>
          Personnalisez vos informations et préférences pour une expérience optimale
        </p>
      </div>

      {message && (
        <div className={`${styles.message} ${message.includes('succès') ? styles.success : styles.error}`}>
          {message}
        </div>
      )}

      <div className={styles.settingsGrid}>
        <section className={styles.settingsSection}>
          <h2>
            <UserIcon size={20} />
            Profil
          </h2>
          <div className={styles.settingsCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatarPlaceholder}>
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <div className={styles.profileInfo}>
                <h3>{user.firstName} {user.lastName}</h3>
                <p>{user.email}</p>
              </div>
            </div>

            <div className={styles.settingItem}>
              <label>
                <UserIcon size={16} />
                Prénom
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.settingItem}>
              <label>
                <UserIcon size={16} />
                Nom
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.settingItem}>
              <label>
                <Mail size={16} />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled
              />
              <small>L'email ne peut pas être modifié</small>
            </div>

            <div className={styles.settingItem}>
              <label>Téléphone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
          </div>
        </section>

        <section className={styles.settingsSection}>
          <h2>
            <Bell size={20} />
            Notifications
          </h2>
          <div className={styles.settingsCard}>
            <div className={styles.settingItem}>
              <label>Notifications push</label>
              <div className={styles.toggle}>
                <input
                  type="checkbox"
                  id="notifications"
                  checked={notificationsEnabled}
                  onChange={handleNotificationToggle}
                />
                <label htmlFor="notifications">
                  {notificationsEnabled ? 'Activées' : 'Désactivées'}
                </label>
              </div>
              <small>
                Recevez des notifications pour les RSVP, nouveaux invités et messages
              </small>
            </div>

            <div className={styles.notificationStatus}>
              <p>
                <strong>Statut :</strong> {permission === 'granted' ? 'Autorisé' : permission === 'denied' ? 'Refusé' : 'Non défini'}
              </p>
              {permission === 'denied' && (
                <p className={styles.warning}>
                  Les notifications sont bloquées par le navigateur.
                  Veuillez les autoriser dans les paramètres de votre navigateur.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className={styles.settingsSection}>
          <h2>Sécurité</h2>
          <div className={styles.settingsCard}>
            <div className={styles.settingItem}>
              <label>Mot de passe</label>
              <button className="secondaryButton">Changer le mot de passe</button>
            </div>
            <div className={styles.settingItem}>
              <label>Double authentification</label>
              <div className={styles.toggle}>
                <input type="checkbox" id="2fa" disabled />
                <label htmlFor="2fa">Bientôt disponible</label>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className={styles.actions}>
        <button disabled={isLoading}>
          Annuler
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </div>
  );
} 
