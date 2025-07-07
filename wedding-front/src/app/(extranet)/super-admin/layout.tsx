'use client';

import { SuperAdminSidebar } from '@/components/Sidebar/SuperAdminSidebar';
import styles from './superadminLayout.module.css';
import { featherscriptFont, harringtonFont, openDyslexicFont } from '@/fonts/fonts';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${styles.layout} ${featherscriptFont.variable} ${harringtonFont.variable} ${openDyslexicFont.variable}`}>
      <SuperAdminSidebar />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
} 