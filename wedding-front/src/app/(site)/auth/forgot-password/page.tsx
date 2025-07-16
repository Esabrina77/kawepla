'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import styles from '@/styles/site/auth.module.css';

export default function ForgotPasswordPage() {
  const { forgotPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Veuillez entrer votre adresse email');
      return;
    }

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Une erreur est survenue lors de l\'envoi du lien de réinitialisation');
      }
    }
  };

  if (success) {
    return (
      <div className={styles.auth}>
        <div className={styles.container}>
          <div className={styles.authCard}>
            <div className={styles.header}>
              <CheckCircle size={48} color="var(--color-success)" />
              <h1>Email envoyé</h1>
              <p>Si un compte existe avec l'adresse {email}, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.</p>
            </div>
            <div className={styles.success}>
              <AlertCircle size={20} /> N'oubliez pas de vérifier vos spams si vous ne trouvez pas l'email.
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

  return (
    <div className={styles.auth}>
      <div className={styles.container}>
        <div className={styles.authCard}>
          <div className={styles.header}>
            <Mail size={48} color="var(--color-primary)" />
            <h1>Mot de passe oublié</h1>
            <p>Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error}>
                <AlertCircle size={20} /> {error}
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="email">Adresse email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email"
                required
              />
            </div>

            <button
              type="submit"
              className={`${styles.submitButton} ${loading ? styles.loading : ''}`}
              disabled={loading}
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
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