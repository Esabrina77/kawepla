'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '@/styles/site/auth.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');

  useEffect(() => {
    // Récupérer l'email depuis les paramètres d'URL
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email || !code) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    if (code.length !== 6) {
      setError('Le code doit contenir 6 chiffres');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la vérification');
      }

      setSuccess('Email vérifié avec succès ! Redirection vers la connexion...');
      
      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setResendSuccess('');
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/send-verification-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'envoi du code');
      }

      setResendSuccess('Nouveau code envoyé avec succès !');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className={styles.auth}>
      <div className={styles.container}>
        <div className={styles.authCard}>
          <div className={styles.header}>
            <h1>Vérification de votre email</h1>
            <p>Saisissez le code de vérification envoyé à votre adresse email</p>
          </div>

          <form className={styles.form} onSubmit={handleVerify}>
            {error && (
              <div className={styles.error}>
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className={styles.success}>
                <p>{success}</p>
              </div>
            )}

            {resendSuccess && (
              <div className={styles.success}>
                <p>{resendSuccess}</p>
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="email">Adresse email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="fullWidth"
                placeholder="votre@email.com"
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="code">Code de vérification (6 chiffres)</label>
              <input
                id="code"
                name="code"
                type="text"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setCode(value);
                }}
                required
                className="fullWidth"
                placeholder="123456"
                disabled={loading}
                maxLength={6}
                style={{ 
                  fontSize: '1.5rem', 
                  textAlign: 'center', 
                  letterSpacing: '0.5rem',
                  fontWeight: 'bold'
                }}
              />
              <div className={styles.passwordHint}>
                Le code expire dans 10 minutes
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading || !email || code.length !== 6}
              >
                {loading ? 'Vérification...' : 'Vérifier mon email'}
              </button>
            </div>

            <div className={styles.resendSection}>
              <p>Vous n&apos;avez pas reçu le code ?</p>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendLoading || !email}
                className={styles.resendButton}
              >
                {resendLoading ? 'Envoi...' : 'Renvoyer le code'}
              </button>
            </div>
          </form>

          <div className={styles.footer}>
            <p>
              Déjà vérifié ? <Link href="/auth/login">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
} 