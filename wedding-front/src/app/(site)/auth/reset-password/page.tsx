'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, Check, X, ArrowLeft } from 'lucide-react';
import styles from '@/styles/site/auth.module.css';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validation du mot de passe
  const passwordValidation = {
    length: formData.password.length >= 8,
  };

  const isPasswordValid = passwordValidation.length;
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Token de réinitialisation manquant');
      return;
    }

    if (!isPasswordValid) {
      setError('Le mot de passe ne respecte pas les critères requis');
      return;
    }

    if (!passwordsMatch) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      // Simuler la réinitialisation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(true);
    } catch (err) {
      setError('Erreur lors de la réinitialisation du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (success) {
    return (
      <div className={styles.auth}>
        <div className={styles.container}>
          <div className={styles.authCard}>
            <div className={styles.header}>
              <Lock size={48} className={styles.icon} />
              <h1>Mot de passe réinitialisé</h1>
              <p>Votre mot de passe a été modifié avec succès</p>
            </div>

            <div className={styles.messageBox}>
              <Check size={48} className={styles.iconSuccess} />
              <p className={styles.success}>Mot de passe mis à jour avec succès !</p>
              <p>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
            </div>

            <Link href="/auth/login" className={styles.submitButton}>
              Se connecter
            </Link>
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
            <Lock size={48} className={styles.icon} />
            <h1>Réinitialiser votre mot de passe</h1>
            <p>Choisissez un nouveau mot de passe sécurisé</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {error && (
              <div className={styles.error}>
                <p>{error}</p>
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="password">Nouveau mot de passe</label>
              <div className={styles.passwordInput}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={styles.fullWidth}
                  placeholder="Votre nouveau mot de passe"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Validation mot de passe */}
              <div className={styles.validationItem}>
                <div className={`${styles.validationIcon} ${isPasswordValid ? styles.valid : styles.invalid}`}>
                  {isPasswordValid ? <Check size={16} /> : <X size={16} />}
                </div>
                <span className={styles.validationText}>Au moins 8 caractères</span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <div className={styles.passwordInput}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className={styles.fullWidth}
                  placeholder="Confirmez votre nouveau mot de passe"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={styles.passwordToggle}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Validation confirmation */}
              {formData.confirmPassword && (
                <div className={styles.validationItem}>
                  <div className={`${styles.validationIcon} ${passwordsMatch ? styles.valid : styles.invalid}`}>
                    {passwordsMatch ? <Check size={16} /> : <X size={16} />}
                  </div>
                  <span className={styles.validationText}>
                    {passwordsMatch ? 'Mots de passe identiques' : 'Les mots de passe ne correspondent pas'}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch || !token}
              className={`${styles.submitButton} ${loading ? styles.loading : ''}`}
            >
              {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>
          </form>

          <div className={styles.footer}>
            <Link href="/auth/login" className={styles.actionButton}>
              <ArrowLeft size={16} />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className={styles.auth}>
        <div className={styles.container}>
          <div className={styles.authCard}>
            <div className={styles.header}>
              <Lock size={48} className={styles.icon} />
              <h1>Chargement...</h1>
              <p>Préparation de la réinitialisation</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
