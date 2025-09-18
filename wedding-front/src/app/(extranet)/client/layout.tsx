'use client';

import { Sidebar } from '@/components/Sidebar/Sidebar';
import styles from './clientLayout.module.css';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${styles.layout}`}>
      <Sidebar />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
} 
