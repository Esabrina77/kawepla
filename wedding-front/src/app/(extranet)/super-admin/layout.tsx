'use client';

import { ReactNode } from 'react';
import { SuperAdminSidebar } from '@/components/Sidebar/SuperAdminSidebar';
import styles from './adminLayout.module.css';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className={styles.adminLayout}>
      <SuperAdminSidebar />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}