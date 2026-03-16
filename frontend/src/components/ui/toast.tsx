'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';
import styles from './toast.module.css';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration (plus long pour les erreurs importantes)
    const duration = toast.type === 'error' && toast.title === 'Limite atteinte' 
      ? (toast.duration || 8000) 
      : (toast.duration || 5000);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{ toasts: Toast[]; removeToast: (id: string) => void }> = ({ 
  toasts, 
  removeToast 
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: () => void }> = ({ toast, onRemove }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className={styles.icon} size={24} />;
      case 'error':
        return <AlertTriangle className={styles.icon} size={24} />;
      case 'warning':
        return <AlertCircle className={styles.icon} size={24} />;
      case 'info':
        return <Info className={styles.icon} size={24} />;
      default:
        return <Info className={styles.icon} size={24} />;
    }
  };

  const isLimitReached = toast.title === 'Limite atteinte';

  return (
    <div 
      className={`${styles.toast} ${styles[toast.type]}`}
      data-limit-reached={isLimitReached ? 'true' : undefined}
    >
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          {getIcon()}
        </div>
        <div className={styles.textWrapper}>
          <p className={styles.title}>
            {toast.title}
          </p>
          {toast.message && (
            <p className={styles.message}>
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={onRemove}
          className={styles.closeButton}
          aria-label="Fermer"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
