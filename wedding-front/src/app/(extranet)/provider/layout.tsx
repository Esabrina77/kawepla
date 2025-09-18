'use client';

import { ReactNode } from 'react';
import { useProviderProfile } from '@/hooks/useProviderProfile';
import { ProviderSidebar } from '@/components/Sidebar/ProviderSidebar';
import styles from './providerLayout.module.css';

interface ProviderLayoutProps {
  children: ReactNode;
}

export default function ProviderLayout({ children }: ProviderLayoutProps) {
  const { profile, loading } = useProviderProfile();

  // Toujours afficher la sidebar, la redirection sera gérée par les pages individuelles
  return (
    <div className={styles.providerLayout}>
      <ProviderSidebar />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
