'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { HeaderMobile } from '@/components/HeaderMobile';
import { User, Mail, Phone } from 'lucide-react';
import styles from './profile.module.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // TODO: Implémenter la mise à jour du profil via l'API
      // await apiClient.put('/users/profile', {
      //   firstName: formData.firstName,
      //   lastName: formData.lastName,
      //   phone: formData.phone,
      // });
      console.log('Mise à jour du profil:', formData);
      // Simuler un délai
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      alert('Erreur lors de la mise à jour du profil');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    const first = formData.firstName?.[0] || 'U';
    const last = formData.lastName?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };

  return (
    <div className={styles.profilePage}>
      <HeaderMobile title="Profil Utilisateur" />
      
      <main className={styles.main}>
        {/* Profile Header */}
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            {getInitials()}
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>
              {formData.firstName} {formData.lastName}
            </h1>
            <p className={styles.profileEmail}>{formData.email}</p>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className={styles.profileForm}>
          {/* First Name Field */}
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="firstname">
              Prénom
            </label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={20} />
              <input
                className={styles.input}
                id="firstname"
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Last Name Field */}
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="lastname">
              Nom
            </label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={20} />
              <input
                className={styles.input}
                id="lastname"
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={20} />
              <input
                className={`${styles.input} ${styles.inputDisabled}`}
                id="email"
                type="email"
                value={formData.email}
                disabled
              />
            </div>
            <p className={styles.helpText}>L'email ne peut pas être modifié</p>
          </div>

          {/* Phone Field */}
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="phone">
              Téléphone
            </label>
            <div className={styles.inputWrapper}>
              <Phone className={styles.inputIcon} size={20} />
              <input
                className={styles.input}
                id="phone"
                type="tel"
                placeholder="+33 6 12 34 56 78"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className={styles.saveButtonContainer}>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isSaving}
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

