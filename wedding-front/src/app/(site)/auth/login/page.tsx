'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import styles from '@/styles/site/auth.module.css';

export default function LoginPage() {
  const { login, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string>('');
  const [emailNotVerified, setEmailNotVerified] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    setEmailNotVerified('');
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      setFormError('Veuillez remplir tous les champs');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(email, password);
      
      if (!result.success) {
        // Vérifier si l'erreur est liée à la vérification d'email
        if (result.error && (result.error.includes('vérifier votre email') || result.error.includes('email non vérifié'))) {
          setEmailNotVerified(email);
        } else {
          setFormError(result.error || 'Erreur lors de la connexion');
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Erreur lors de la connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = () => {
    if (emailNotVerified) {
      router.push(`/auth/verify-email?email=${encodeURIComponent(emailNotVerified)}`);
    }
  };

  const displayError = formError;

  return (
    <div className={styles.auth}>
      <div className={styles.container}>
        <div className={styles.authCard}>
          <div className={styles.header}>
            <h1>Connexion</h1>
            <p>Accédez à votre espace personnel Kawepla</p>
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
                className={styles.fullWidth}
                placeholder="votre@email.com"
                disabled={isSubmitting || authLoading}
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
                className={styles.fullWidth}
                placeholder="••••••••"
                disabled={isSubmitting || authLoading}
              />
              <Link href="/auth/forgot-password" className={styles.forgotPassword}>
                Mot de passe oublié ?
              </Link>
            </div>

            <div className={styles.rememberMe}>
              <label>
                <input type="checkbox" name="remember" disabled={isSubmitting || authLoading} />
                <span>Se souvenir de moi</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className={`${styles.submitButton} ${isSubmitting ? styles.loading : ''}`}
            >
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
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