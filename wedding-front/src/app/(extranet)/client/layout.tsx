'use client';

import { Sidebar } from '@/components/Sidebar/Sidebar';
import styles from './clientLayout.module.css';
import { featherscriptFont, harringtonFont, openDyslexicFont } from '@/fonts/fonts';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${styles.layout} ${featherscriptFont.variable} ${harringtonFont.variable} ${openDyslexicFont.variable}`}>
      <Sidebar />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
} 
