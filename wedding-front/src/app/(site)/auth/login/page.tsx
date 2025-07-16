'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import styles from '@/styles/site/auth.module.css';

export default function LoginPage() {
  const { login, error: authError, loading: authLoading } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string>('');
  const [emailNotVerified, setEmailNotVerified] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    setEmailNotVerified('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      setFormError('Veuillez remplir tous les champs');
      return;
    }

    try {
      await login(email, password);
    } catch (err: any) {
      // Vérifier si l'erreur est liée à la vérification d'email
      if (err.message && err.message.includes('vérifier votre email')) {
        setEmailNotVerified(email);
      } else {
        console.error('Erreur de connexion:', err);
      }
    }
  };

  const handleResendVerification = () => {
    if (emailNotVerified) {
      router.push(`/auth/verify-email?email=${encodeURIComponent(emailNotVerified)}`);
    }
  };

  const displayError = formError || authError;

  return (
    <div className={styles.auth}>
      <div className={styles.container}>
        <div className={styles.authCard}>
          <div className={styles.header}>
            <h1>Connexion à votre espace</h1>
            <p>Gérez vos invitations de mariage en toute simplicité</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {displayError && (
              <div className={styles.error}>
                <p>{displayError}</p>
              </div>
            )}

            {emailNotVerified && (
              <div className={styles.error}>
                <p>Votre email n'est pas encore vérifié.</p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className={styles.resendButton}
                  style={{ marginTop: '10px' }}
                >
                  Vérifier mon email
                </button>
              </div>
            )}

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
                disabled={authLoading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="fullWidth"
                placeholder="••••••••"
                disabled={authLoading}
              />
              <Link href="/auth/forgot-password" className={styles.forgotPassword}>
                Mot de passe oublié ?
              </Link>
            </div>

            <div className={styles.rememberMe}>
              <label>
                <input type="checkbox" name="remember" disabled={authLoading} />
                <span>Se souvenir de moi</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className={`${styles.submitButton} ${authLoading ? styles.loading : ''}`}
            >
              {authLoading ? 'Connexion...' : 'Se connecter'}
            </button>

            <div className={styles.footer}>
              <p>
                Pas encore de compte ? <Link href="/auth/register">S'inscrire</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 