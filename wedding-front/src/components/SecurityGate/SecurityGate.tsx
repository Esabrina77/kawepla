'use client';

import React from 'react';
import Link from 'next/link';
import { useBillingLimits } from '@/hooks/useBillingLimits';
import styles from './SecurityGate.module.css';

interface SecurityGateProps {
  action: 'createInvitation' | 'addGuest' | 'importGuests' | 'uploadPhotos';
  children: React.ReactNode;
  fallbackMessage?: string;
  fallbackAction?: string;
  fallbackLink?: string;
}

export const SecurityGate: React.FC<SecurityGateProps> = ({
  action,
  children,
  fallbackMessage,
  fallbackAction = 'Acheter des packs',
  fallbackLink = '/client/billing'
}) => {
  const { limitsData, loading } = useBillingLimits();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <span>Vérification des limites...</span>
      </div>
    );
  }

  if (!limitsData) {
    return (
      <div className={styles.errorContainer}>
        <span>Impossible de vérifier les limites</span>
      </div>
    );
  }

  let canPerformAction = false;
  let defaultMessage = '';
  let defaultAction = '';

  switch (action) {
    case 'createInvitation':
      canPerformAction = limitsData.canCreateInvitation;
      defaultMessage = 'Vous avez atteint la limite d\'invitations.';
      defaultAction = 'Acheter des packs pour créer plus d\'invitations';
      break;
    case 'addGuest':
      canPerformAction = limitsData.canAddGuest;
      defaultMessage = 'Vous avez atteint la limite d\'invités.';
      defaultAction = 'Acheter des packs pour ajouter plus d\'invités';
      break;
    case 'importGuests':
      canPerformAction = limitsData.canImportGuests;
      defaultMessage = 'Vous avez atteint la limite d\'invités.';
      defaultAction = 'Acheter des packs pour importer plus d\'invités';
      break;
    case 'uploadPhotos':
      canPerformAction = limitsData.canUploadPhotos;
      defaultMessage = 'Vous avez atteint la limite de photos.';
      defaultAction = 'Acheter des packs pour uploader plus de photos';
      break;
  }

  if (canPerformAction) {
    return <>{children}</>;
  }

  return (
    <div className={styles.limitReachedMessage}>
      <p>{fallbackMessage || defaultMessage}</p>
      <Link href={fallbackLink} className={styles.upgradeLink}>
        {fallbackAction || defaultAction}
      </Link>
    </div>
  );
};
