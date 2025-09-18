'use client';

import React from 'react';
import { X, QrCode } from 'lucide-react';
import { QRCodeComponent } from '@/components/QRCode/QRCode';
import { Button } from '@/components/ui/button';
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

  console.log('🔍 URL générée pour QR code:', shareUrl);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <QrCode className={styles.titleIcon} />
            <h2>QR Code pour {albumTitle}</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className={styles.closeButton}
          >
            <X className={styles.closeIcon} />
          </Button>
        </div>

        <div className={styles.content}>
          <div className={styles.description}>
            <p>
              Partagez ce QR code avec vos invités pour qu'ils puissent facilement 
              accéder à l'album et uploader leurs photos.
            </p>
          </div>

          <div className={styles.qrSection}>
            <QRCodeComponent
              url={shareUrl}
              title={albumTitle}
              size={250}
              showActions={true}
            />
          </div>

          <div className={styles.instructions}>
            <h3>Comment utiliser ce QR code :</h3>
            <ol>
              <li>Téléchargez le QR code ou imprimez-le</li>
              <li>Placez-le sur les tables lors de votre événement</li>
              <li>Vos invités scannent avec leur téléphone</li>
              <li>Ils peuvent uploader leurs photos directement</li>
            </ol>
          </div>

          <div className={styles.tips}>
            <h4>💡 Conseils :</h4>
            <ul>
              <li>Placez plusieurs QR codes dans différents endroits</li>
              <li>Ajoutez une petite note explicative à côté</li>
              <li>Encouragez vos invités à partager leurs plus beaux moments</li>
            </ul>
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
} 