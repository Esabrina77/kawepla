'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import styles from '@/styles/site/auth.module.css';

export default function RegisterPage() {
  const { register, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'HOST' | 'PROVIDER'>('HOST');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
    };

    if (data.password !== data.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: userType,
      });

      if (!result.success) {
        setError(result.error || 'Erreur lors de l\'inscription');
      } else {
        // Rediriger vers la page de vérification d'email
        router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.auth}>
      <div className={`${styles.container} ${styles.registerContainer}`}>
        <div className={`${styles.authCard} ${styles.loginCard} ${styles.registerCard}`}>
          <div className={styles.header}>
            <h1>Création de compte</h1>
            <p>Rejoignez Kawepla et créez vos invitations d'événements numériques</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {error && (
              <div className={styles.error}>
                <p>{error}</p>
              </div>
            )}

            <div className={styles.registerLayout}>
              {/* Colonne gauche : Sélection du type d'utilisateur */}
              <div className={styles.registerLeftColumn}>
                <div className={styles.userTypeSelector}>
                  <h3>Je suis un :</h3>
                  <div className={styles.userTypeOptions}>
                    <label className={`${styles.userTypeOption} ${userType === 'HOST' ? styles.selected : ''}`}>
                      <input
                        type="radio"
                        name="userType"
                        value="HOST"
                        checked={userType === 'HOST'}
                        onChange={(e) => setUserType(e.target.value as 'HOST' | 'PROVIDER')}
                        disabled={loading}
                      />
                      <div className={styles.userTypeContent}>
                        <div className={styles.userTypeIcon}>💒</div>
                        <div className={styles.userTypeText}>
                          <strong>Organisateur</strong>
                          <span>Organiser mon événement</span>
                        </div>
                      </div>
                    </label>
                    
                    <label className={`${styles.userTypeOption} ${userType === 'PROVIDER' ? styles.selected : ''}`}>
                      <input
                        type="radio"
                        name="userType"
                        value="PROVIDER"
                        checked={userType === 'PROVIDER'}
                        onChange={(e) => setUserType(e.target.value as 'HOST' | 'PROVIDER')}
                        disabled={loading}
                      />
                      <div className={styles.userTypeContent}>
                        <div className={styles.userTypeIcon}>🎯</div>
                        <div className={styles.userTypeText}>
                          <strong>Prestataire</strong>
                          <span>Proposer mes services</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Colonne droite : Champs du formulaire */}
              <div className={styles.registerRightColumn}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="firstName">Prénom</label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className={styles.fullWidth}
                      placeholder="Votre prénom"
                      disabled={loading}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="lastName">Nom</label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className={styles.fullWidth}
                      placeholder="Votre nom"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={styles.fullWidth}
                    placeholder="votre@email.com"
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password">Mot de passe</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className={styles.fullWidth}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <p className={styles.passwordHint}>
                    Le mot de passe doit contenir au moins 8 caractères
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className={styles.fullWidth}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>

                <div className={styles.terms}>
                  <label>
                    <input type="checkbox" name="terms" required disabled={loading} />
                    <span>
                      J'accepte les{' '}
                      <Link href="/legal/terms">conditions d'utilisation</Link> et la{' '}
                      <Link href="/legal/privacy">politique de confidentialité</Link>
                    </span>
                  </label>
                </div>

                <button
                  type="submit" 
                  disabled={loading}
                  className={`${styles.submitButton} ${loading ? styles.loading : ''}`}
                >
                  {loading ? 'Inscription en cours...' : 'Créer mon compte'}
                </button>

                <div className={styles.footer}>
                  <p>
                    Déjà un compte ? <Link href="/auth/login">Se connecter</Link>
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 