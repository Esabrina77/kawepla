'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { FloatingThemeToggle } from '@/components/FloatingThemeToggle';
import styles from './HeaderMobile.module.css';

interface HeaderMobileProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const HeaderMobile: React.FC<HeaderMobileProps> = ({
  title,
  showBackButton = true,
  onBack,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header className={styles.header}>
      {showBackButton ? (
        <button className={styles.backButton} onClick={handleBack}>
          <ArrowLeft size={24} />
        </button>
      ) : (
        <div className={styles.headerSpacer}></div>
      )}
      
      <h1 className={styles.pageTitle}>{title}</h1>
      
      <div className={styles.themeToggleWrapper}>
        <FloatingThemeToggle variant="inline" size={20} />
      </div>
    </header>
  );
};

