'use client';

import React from 'react';
import { X } from 'lucide-react';
import { QRCodeComponent } from '@/components/QRCode/QRCode';
import styles from './QRCodeModal.module.css';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  albumTitle: string;
  albumId: string;
}

export function QRCodeModal({ isOpen, onClose, albumTitle, albumId }: QRCodeModalProps) {
  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/share-album/${albumId}`
    : `http://localhost:3012/share-album/${albumId}`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>QR Code</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.qrSection}>
            <QRCodeComponent
              url={shareUrl}
              title={albumTitle}
              size={250}
              showActions={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 