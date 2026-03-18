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
        <div className={styles.loadingOverlay}>
            <div className={`card animate-scaleIn ${styles.loadingCard}`}>
                <div className={styles.loadingContent}>
                    <div className={styles.errorIcon}>
                        <AlertCircle size={48} />
                    </div>
                    
                    <h2 className={styles.loadingTitle} style={{ color: 'var(--error-color, #ef4444)' }}>
                        Une erreur est survenue
                    </h2>
                    
                    <p className={styles.loadingText}>
                        Désolé, nous ne parvenons pas à charger cette invitation pour le moment.
                    </p>
                    
                    {error.message && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.8 }}>
                            ({error.message})
                        </p>
                    )}
                    
                    <button
                        onClick={() => reset()}
                        className={styles.submitButton}
                        style={{ marginTop: '1.5rem', width: '100%' }}
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        </div>
    );
}
