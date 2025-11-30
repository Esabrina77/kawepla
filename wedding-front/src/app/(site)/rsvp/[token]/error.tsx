'use client';

import { useEffect } from 'react';
import styles from './rsvp.module.css';
import { AlertCircle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('RSVP Page Error:', error);
    }, [error]);

    return (
        <div className={styles.container}>
            <div className={styles.errorCard}>
                <div className={styles.errorContent}>
                    <div className={styles.errorIcon}>
                        <AlertCircle size={48} />
                    </div>
                    <h2 className={styles.errorTitle}>Une erreur est survenue</h2>
                    <p className={styles.errorText}>
                        Désolé, nous ne parvenons pas à charger cette invitation pour le moment.
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                        {error.message || 'Erreur inconnue'}
                    </p>
                    <button
                        onClick={() => reset()}
                        className={styles.submitButton}
                        style={{ marginTop: '2rem' }}
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        </div>
    );
}
