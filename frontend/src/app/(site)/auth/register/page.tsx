'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import styles from '@/styles/site/auth.module.css';

function RegisterForm() {
  const { register, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userType, setUserType] = useState<'HOST' | 'PROVIDER'>('HOST');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'PROVIDER') {
      setUserType('PROVIDER');
    } else if (roleParam === 'HOST') {
      setUserType('HOST');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

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
      setIsSubmitting(false);
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
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.auth} data-role={userType}>
      <div className={`${styles.container} ${styles.registerContainer}`}>
        <div className={`${styles.authCard} ${styles.loginCard} ${styles.registerCard}`}>
          <div className={styles.header}>
            <h1 id="register-title">Création de compte</h1>
            <p>{userType === 'HOST' ? "Rejoignez Kawepla et créez vos invitations d'événements numériques" : "Rejoignez Kawepla et proposez vos services aux organisateurs"}</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {error && (
              <div className={styles.error} role="alert" aria-live="polite">
                <p>{error}</p>
              </div>
            )}

            <div className={styles.registerLayout}>
              {/* Colonne gauche : Sélection du type d'utilisateur */}
              <div className={styles.registerLeftColumn}>
                <div role="radiogroup" aria-labelledby="user-type-label" className={styles.userTypeSelector}>
                  <h3 id="user-type-label">Je suis un :</h3>
                  <div className={styles.userTypeOptions}>
                    <label className={`${styles.userTypeOption} ${userType === 'HOST' ? styles.selected : ''}`}>
                      <input
                        type="radio"
                        name="userType"
                        value="HOST"
                        checked={userType === 'HOST'}
                        onChange={(e) => setUserType(e.target.value as 'HOST' | 'PROVIDER')}
                        disabled={isSubmitting}
                        aria-label="Organisateur"
                      />
                      <div className={styles.userTypeContent}>
                        <div className={styles.userTypeIcon} aria-hidden="true">💒</div>
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
                        disabled={isSubmitting}
                        aria-label="Prestataire"
                      />
                      <div className={styles.userTypeContent}>
                        <div className={styles.userTypeIcon} aria-hidden="true">🎯</div>
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password">Mot de passe</label>
                  <div className={styles.passwordInput}>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      className={styles.fullWidth}
                      placeholder="••••••••"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.passwordToggle}
                      disabled={isSubmitting}
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className={styles.passwordHint}>
                    Le mot de passe doit contenir au moins 8 caractères
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                  <div className={styles.passwordInput}>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      className={styles.fullWidth}
                      placeholder="••••••••"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={styles.passwordToggle}
                      disabled={isSubmitting}
                      aria-label={showConfirmPassword ? "Masquer la confirmation du mot de passe" : "Afficher la confirmation du mot de passe"}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className={styles.terms}>
                  <label>
                    <input type="checkbox" name="terms" required disabled={isSubmitting} />
                    <span>
                      J'accepte les{' '}
                      <Link href="/legal/terms">conditions d'utilisation</Link> et la{' '}
                      <Link href="/legal/privacy">politique de confidentialité</Link>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${styles.submitButton} ${isSubmitting ? styles.loading : ''}`}
                >
                  {isSubmitting ? 'Création en cours...' : 'Créer mon compte'}
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className={styles.auth}>Chargement...</div>}>
      <RegisterForm />
    </Suspense>
  );
}