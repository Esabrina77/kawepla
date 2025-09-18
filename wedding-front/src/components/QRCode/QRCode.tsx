'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Download, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    // Créer un SVG temporaire pour le téléchargement
    const svg = document.querySelector(`.${styles.qrWrapper} svg`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = size;
    canvas.height = size;
    
    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = `qr-code-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
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
          fgColor="#2c2c2c"
          level="M"
        />
      </div>

      {showActions && (
        <div className={styles.actions}>
          <Button onClick={downloadQRCode} size="sm" variant="outline">
            <Download className={styles.actionIcon} />
            Télécharger
          </Button>

          <Button onClick={copyLink} size="sm" variant="outline">
            <Copy className={styles.actionIcon} />
            {copied ? 'Copié !' : 'Copier le lien'}
          </Button>

          <Button onClick={shareLink} size="sm" variant="outline">
            <Share2 className={styles.actionIcon} />
            Partager
          </Button>
        </div>
      )}
    </div>
  );
} 