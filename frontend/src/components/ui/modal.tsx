import React from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import styles from './modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  isLoading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <button
          onClick={onClose}
          disabled={isLoading}
          className={`${styles.actionButton} ${styles.cancelSecondary}`}
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`${styles.actionButton} ${styles.confirmPrimary}`}
        >
          {isLoading ? 'Traitement...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = 'OK'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className={styles.iconWrapper}>
        <div className={`${styles.iconCircle} ${styles.successIcon}`}>
          <Check size={32} />
        </div>
      </div>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <button
          onClick={onClose}
          className={`${styles.actionButton} ${styles.confirmPrimary}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = 'OK'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className={styles.iconWrapper}>
        <div className={`${styles.iconCircle} ${styles.errorIcon}`}>
          <AlertCircle size={32} />
        </div>
      </div>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <button
          onClick={onClose}
          className={`${styles.actionButton} ${styles.confirmPrimary}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};