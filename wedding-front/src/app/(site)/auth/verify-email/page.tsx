'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Key } from 'lucide-react';
import styles from '@/styles/site/auth.module.css';

function VerifyEmailContent() {
  const { verifyEmail, sendVerificationCode } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || !email) return;
    
    setIsVerifying(true);
    setVerificationError('');
    
    try {
      const result = await verifyEmail(email, verificationCode);
      
      if (result.success) {
        setVerificationSuccess(true);
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        setVerificationError(result.error || 'Erreur lors de la vérification');
      }
    } catch (error) {
      setVerificationError('Erreur lors de la vérification');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;
    
    setIsResending(true);
    setResendError('');
    
    try {
      const result = await sendVerificationCode(email);
      
      if (result.success) {
        setResendSuccess(true);
      } else {
        setResendError(result.error || 'Erreur lors de l\'envoi du code');
      }
    } catch (error) {
      setResendError('Erreur lors de l\'envoi du code de vérification');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={styles.auth}>
      <div className={styles.container}>
        <div className={styles.authCard}>
          <div className={styles.header}>
            <div className={styles.iconContainer}>
              <Mail size={56} className={styles.icon} />
            </div>
            <h1>Vérifiez votre email</h1>
            <p className={styles.description}>
              {email ? (
                <>Nous avons envoyé un code de vérification à <strong className={styles.emailHighlight}>{email}</strong></>
              ) : (
                'Nous avons envoyé un code de vérification à votre adresse email'
              )}
            </p>
          </div>

          {/* Formulaire de vérification */}
          <form onSubmit={handleVerifyCode} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="verificationCode" className={styles.inputLabel}>
                Code de vérification
              </label>
              <div className={styles.codeInputContainer}>
                <Key size={20} className={styles.codeInputIcon} />
                <input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Entrez le code à 6 chiffres"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                  className={styles.codeInput}
                  disabled={isVerifying}
                />
              </div>
              <small className={styles.inputHint}>
                Vérifiez votre boîte de réception et saisissez le code reçu
              </small>
            </div>

            {verificationError && (
              <div className={`${styles.messageBox} ${styles.error}`}>
                <AlertCircle size={20} />
                <span>{verificationError}</span>
              </div>
            )}

            {verificationSuccess && (
              <div className={`${styles.messageBox} ${styles.success}`}>
                <CheckCircle size={20} />
                <span>Email vérifié avec succès ! Redirection en cours...</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || !verificationCode || verificationCode.length !== 6 || verificationSuccess}
              className={`${styles.submitButton} ${isVerifying ? styles.loading : ''}`}
            >
              {isVerifying ? 'Vérification...' : 'Vérifier mon email'}
            </button>
          </form>

          <div className={styles.actionsContainer}>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResending || !email}
              className={styles.resendButton}
            >
              {isResending ? 'Envoi...' : 'Renvoyer le code'}
            </button>

            {resendSuccess && (
              <div className={`${styles.messageBox} ${styles.success}`}>
                <CheckCircle size={16} />
                <span>Code renvoyé avec succès !</span>
              </div>
            )}

            {resendError && (
              <div className={`${styles.messageBox} ${styles.error}`}>
                <AlertCircle size={16} />
                <span>{resendError}</span>
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <Link href="/auth/login" className={styles.backButton}>
              <ArrowLeft size={18} />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className={styles.auth}>
        <div className={styles.container}>
          <div className={styles.authCard}>
            <div className={styles.header}>
              <div className={styles.iconContainer}>
                <Mail size={56} className={styles.icon} />
              </div>
              <h1>Chargement...</h1>
              <p className={styles.description}>Préparation de la vérification email</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
} 