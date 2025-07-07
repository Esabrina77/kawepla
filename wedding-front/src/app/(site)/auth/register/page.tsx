'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import styles from '@/styles/site/auth.module.css';
import Image from 'next/image';

export default function RegisterPage() {
  const { register } = useAuth();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

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
      await register(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.auth}>
      <div className={styles.container}>
        <div className={styles.authCard}>
          <div className={styles.header}>
            <h1>Créez votre compte</h1>
            <p>Commencez à créer vos invitations de mariage</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {error && (
              <div className={styles.error}>
                <p>{error}</p>
              </div>
            )}

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName">Prénom</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="fullWidth"
                  placeholder="Votre prénom"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="lastName">Nom</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="fullWidth"
                  placeholder="Votre nom"
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
                className="fullWidth"
                placeholder="votre@email.com"
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
                className="fullWidth"
                placeholder="••••••••"
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
                className="fullWidth"
                placeholder="••••••••"
              />
            </div>

            <div className={styles.terms}>
              <label>
                <input type="checkbox" name="terms" required />
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

            <div className={styles.divider}>
              <span>ou</span>
            </div>

            <button type="button" className={styles.googleButton}>
             <Image src="/icons/google.svg" alt="Google" width={20} height={20} />
                Continuer avec Google
            </button>

            <div className={styles.footer}>
              <p>
                Déjà un compte ? <Link href="/auth/login">Se connecter</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 