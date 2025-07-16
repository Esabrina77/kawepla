'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import Image from 'next/image';
import { AccessibilityMenu } from '@/components/Accessibility/AccessibilityMenu';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  ScrollText, 
  Paintbrush, 
  Users, 
  CalendarRange, 
  LineChart, 
  MessagesSquare, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Crown
} from 'lucide-react';

const menuItems = [
  {
    title: 'Tableau de bord',
    path: '/super-admin/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Templates',
    path: '/super-admin/templates',
    icon: ScrollText
  },
  {
    title: 'Designs',
    path: '/super-admin/design',
    icon: Paintbrush
  },
  {
    title: 'Utilisateurs',
    path: '/super-admin/users',
    icon: Users
  },
  {
    title: 'Invitations',
    path: '/super-admin/invitations',
    icon: CalendarRange
  },
  {
    title: 'Statistiques',
    path: '/super-admin/stats',
    icon: LineChart
  },
  {
    title: 'Discussions',
    path: '/super-admin/discussions',
    icon: MessagesSquare
  },
  // {
  //   title: 'Paramètres',
  //   path: '/super-admin/settings',
  //   icon: Settings
  // }
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
            width={100} 
            height={100} 
            style={{ objectFit: 'contain' }}
            priority
          />
        </Link>

        <div className={styles.sidebarHeaderButtons}>
        {!isCollapsed && (
          <div className={styles.superAdminBadge}>
            <Crown className={styles.crownIcon} size={16} /> SUPER ADMIN
          </div>
        )}
        <button 
          onClick={toggleSidebar} 
          className={styles.toggleButton}
          aria-label={isCollapsed ? "Développer le menu" : "Réduire le menu"}
        >
          {isCollapsed ? <ChevronRight className={styles.toggleIcon} /> : <ChevronLeft className={styles.toggleIcon} />}
        </button>
        </div>
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
              {<item.icon className={styles.menuIcon} size={24} />}
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
          <Link href="/super-admin/help" className={styles.helpLink}>
            <span className={styles.icon}>
              <HelpCircle className={styles.menuIcon} size={24} />
            </span>
            {!isCollapsed && <span>Aide</span>}
          </Link>
          <button 
            onClick={logout}
            className={styles.logoutButton}
            title="Se déconnecter"
          >
            <span className={styles.icon}>
              <LogOut className={styles.menuIcon} size={24} />
            </span>
            {!isCollapsed && <span>Se déconnecter</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}; 