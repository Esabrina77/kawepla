'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Download, Copy, Share2, Check } from 'lucide-react';
import styles from './QRCode.module.css';

// Import dynamique pour éviter les problèmes SSR
const QRCodeSVG = dynamic(() => import('react-qr-code'), {
  ssr: false,
  loading: () => <div className={styles.loading}>Génération du QR code...</div>
});

interface QRCodeProps {
  url: string;
  title?: string;
  size?: number;
  showActions?: boolean;
  className?: string;
}

export function QRCodeComponent({ 
  url, 
  title = "QR Code", 
  size = 200, 
  showActions = true,
  className = ''
}: QRCodeProps) {
  const [copied, setCopied] = useState(false);

  const downloadQRCode = () => {
    const svg = document.querySelector(`.${styles.qrWrapper} svg`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // On ajoute un padding blanc au canvas pour le rendu final
    const padding = 40;
    canvas.width = size + padding * 2;
    canvas.height = size + padding * 2;
    
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, padding, padding, size, size);
        
        const link = document.createElement('a');
        link.download = `qr-code-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Scannez ce QR code pour accéder à ${title}`,
          url: url
        });
      } catch (err) {
        console.error('Erreur lors du partage:', err);
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.qrWrapper}>
        <QRCodeSVG
          value={url}
          size={size}
          bgColor="#ffffff"
          fgColor="#0f172a"
          level="H"
        />
      </div>

      {showActions && (
        <div className={styles.actions}>
          <button onClick={downloadQRCode} className={`${styles.actionButton} ${styles.actionButtonPrimary}`}>
            <Download className={styles.actionIcon} />
            Télécharger le QR Code
          </button>

          <button onClick={copyLink} className={styles.actionButton}>
            {copied ? (
              <>
                <Check className={`${styles.actionIcon} ${styles.copiedText}`} />
                <span className={styles.copiedText}>Lien copié !</span>
              </>
            ) : (
              <>
                <Copy className={styles.actionIcon} />
                Copier le lien de partage
              </>
            )}
          </button>

          <button onClick={shareLink} className={styles.actionButton}>
            <Share2 className={styles.actionIcon} />
            Partager l'album
          </button>
        </div>
      )}
    </div>
  );
}