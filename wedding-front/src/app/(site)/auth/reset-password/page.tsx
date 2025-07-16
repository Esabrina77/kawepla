'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import styles from '@/styles/site/auth.module.css';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const { resetPassword, verifyResetToken, loading } = useAuth();
  const [token, setToken] = useState<string>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      verifyToken(tokenFromUrl);
    }
  }, [searchParams]);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      await verifyResetToken(tokenToVerify);
      setIsTokenValid(true);
    } catch (error) {
      setIsTokenValid(false);
      setValidationError('Ce lien de réinitialisation est invalide ou a expiré.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (password.length < 8) {
      setValidationError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        setValidationError(error.message);
      } else {
        setValidationError('Une erreur est survenue lors de la réinitialisation du mot de passe');
      }
    }
  };

  if (!token) {
    return (
      <div className={styles.auth}>
        <div className={styles.container}>
          <div className={styles.authCard}>
            <div className={styles.header}>
              <AlertCircle size={48} color="var(--color-danger)" />
              <h1>Lien invalide</h1>
              <p>Le lien de réinitialisation est invalide ou manquant.</p>
            </div>
            <div className={styles.footer}>
              <Link href="/auth/login" className={styles.forgotPassword}>
                <ArrowLeft size={16} /> Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className={styles.auth}>
        <div className={styles.container}>
          <div className={styles.authCard}>
            <div className={styles.header}>
              <AlertCircle size={48} color="var(--color-danger)" />
              <h1>Lien expiré</h1>
              <p>{validationError}</p>
              <p>Veuillez demander un nouveau lien de réinitialisation.</p>
            </div>
            <div className={styles.footer}>
              <Link href="/auth/forgot-password" className={styles.forgotPassword}>
                <ArrowLeft size={16} /> Demander un nouveau lien
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.auth}>
        <div className={styles.container}>
          <div className={styles.authCard}>
            <div className={styles.header}>
              <CheckCircle size={48} color="var(--color-success)" />
              <h1>Mot de passe réinitialisé</h1>
              <p>Votre mot de passe a été réinitialisé avec succès.</p>
            </div>
            <div className={styles.footer}>
              <Link href="/auth/login" className={styles.forgotPassword}>
                <ArrowLeft size={16} /> Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.auth}>
      <div className={styles.container}>
        <div className={styles.authCard}>
          <div className={styles.header}>
            <Lock size={48} color="var(--color-primary)" />
            <h1>Réinitialiser le mot de passe</h1>
            <p>Entrez votre nouveau mot de passe ci-dessous.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {validationError && (
              <div className={styles.error}>
                <AlertCircle size={20} /> {validationError}
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="password">Nouveau mot de passe</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
                required
                minLength={8}
              />
              <span className={styles.passwordHint}>Le mot de passe doit contenir au moins 8 caractères</span>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmer le mot de passe"
                required
              />
            </div>

            <button
              type="submit"
              className={`${styles.submitButton} ${loading ? styles.loading : ''}`}
              disabled={loading}
            >
              {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>

            <div className={styles.footer}>
              <Link href="/auth/login" className={styles.forgotPassword}>
                <ArrowLeft size={16} /> Retour à la connexion
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
