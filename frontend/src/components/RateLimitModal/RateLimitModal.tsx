'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import styles from './RateLimitModal.module.css';

interface RateLimitEventDetail {
  message: string;
  retryAfter?: string;
}

export function RateLimitModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string>('Trop de tentatives. Veuillez réessayer plus tard.');
  const [retryAfter, setRetryAfter] = useState<string | null>(null);

  useEffect(() => {
    const handleRateLimit = (event: CustomEvent<RateLimitEventDetail>) => {
      setMessage(event.detail.message || 'Trop de tentatives. Veuillez réessayer plus tard.');
      setRetryAfter(event.detail.retryAfter || null);
      setIsOpen(true);
    };

    window.addEventListener('rateLimitExceeded', handleRateLimit as EventListener);

    return () => {
      window.removeEventListener('rateLimitExceeded', handleRateLimit as EventListener);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setRetryAfter(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Trop de tentatives">
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <AlertTriangle className={styles.icon} size={48} />
        </div>
        
        <p className={styles.message}>
          {message}
        </p>

        {retryAfter && (
          <div className={styles.retryInfo}>
            <Clock size={16} />
            <span>Vous pourrez réessayer dans {retryAfter}</span>
          </div>
        )}

        <div className={styles.actions}>
          <Button
            onClick={handleClose}
            style={{
              height: '40px',
              padding: 'var(--space-xs) var(--space-md)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-primary)',
              color: 'var(--luxury-velvet-black)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '600',
              transition: 'all var(--transition-normal)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '120px',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            Compris
          </Button>
        </div>
      </div>
    </Modal>
  );
}


