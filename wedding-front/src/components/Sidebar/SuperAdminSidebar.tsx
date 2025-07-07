'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import Image from 'next/image';
import { AccessibilityMenu } from '@/components/Accessibility/AccessibilityMenu';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  {
    title: 'Tableau de bord',
    path: '/super-admin/dashboard',
    icon: '/icons/stats.svg'
  },
  {
    title: 'Templates',
    path: '/super-admin/templates',
    icon: '/icons/design.svg'
  },
  {
    title: 'Designs',
    path: '/super-admin/design',
    icon: '/icons/design.svg'
  },
  {
    title: 'Utilisateurs',
    path: '/super-admin/users',
    icon: '/icons/guests.svg'
  },
  {
    title: 'Statistiques',
    path: '/super-admin/stats',
    icon: '/icons/stats.svg'
  },
  {
    title: 'Messages',
    path: '/super-admin/messages',
    icon: '/icons/rsvp.svg'
  },
  {
    title: 'Paramètres',
    path: '/super-admin/settings',
    icon: '/icons/planning.svg'
  }
];

export const SuperAdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside 
      className={`${styles.sidebar} ${styles.superAdminSidebar} ${isCollapsed ? styles.collapsed : ''}`}
      data-testid="super-admin-sidebar"
    >
      <div className={styles.sidebarHeader}>
        <Link href="/">
          <Image 
            src="/images/logo.png" 
            alt="Logo KaWePla" 
            width={120} 
            height={120} 
            style={{ objectFit: 'contain' }}
            priority
          />
        </Link>
        {!isCollapsed && (
          <div className={styles.superAdminBadge}>
            SUPER ADMIN
          </div>
        )}
        <button 
          onClick={toggleSidebar} 
          className={styles.toggleButton}
          aria-label={isCollapsed ? "Développer le menu" : "Réduire le menu"}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className={styles.navigation}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`${styles.navItem} ${
              pathname === item.path ? styles.active : ''
            }`}
          >
            <span className={styles.icon}>
              <Image
                src={item.icon}
                alt=""
                width={24}
                height={24}
              />
            </span>
            {!isCollapsed && <span className={styles.title}>{item.title}</span>}
          </Link>
        ))}
        <div className={`${styles.navItem} ${styles.accessibilityNavItem}`}>
          <AccessibilityMenu />
        </div>
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.footerContent}>
          <Link href="/help" className={styles.helpLink}>
            <span className={styles.icon}>
              <Image
                src="/icons/rsvp.svg"
                alt=""
                width={24}
                height={24}
              />
            </span>
            {!isCollapsed && <span>Aide</span>}
          </Link>
          <button 
            onClick={logout}
            className={styles.logoutButton}
            title="Se déconnecter"
          >
            <span className={styles.icon}>
              <Image
                src="/icons/logout.svg"
                alt=""
                width={24}
                height={24}
              />
            </span>
            {!isCollapsed && <span>Se déconnecter</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}; 