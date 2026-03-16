import React from 'react';
import styles from './PhotoModal.module.css';

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string;
  alt: string;
}

const PhotoModal: React.FC<PhotoModalProps> = ({ isOpen, onClose, photoUrl, alt }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className={styles.modalOverlay} 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className={styles.modalContent}>
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Fermer"
        >
          ✕
        </button>
        <img 
          src={photoUrl} 
          alt={alt}
          className={styles.modalImage}
        />
      </div>
    </div>
  );
};

export default PhotoModal; 