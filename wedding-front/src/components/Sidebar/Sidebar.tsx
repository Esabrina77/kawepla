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
    path: '/client/dashboard',
    icon: '/icons/stats.svg',
    description: 'Vue d\'ensemble de votre invitation'
  },
  {
    title: 'Créer l\'événement',
    path: '/client/invitations',
    icon: '/icons/planning.svg',
    description: 'Gérez vos invitations'
  },
  {
    title: 'Design',
    path: '/client/design',
    icon: '/icons/design.svg',
    description: 'Personnalisez votre invitation'
  },
  {
    title: 'Invités',
    path: '/client/guests',
    icon: '/icons/guests.svg',
    description: 'Gérez votre liste d\'invités et les RSVP'
  },
  {
    title: 'Messages RSVP',
    path: '/client/messages',
    icon: '/icons/rsvp.svg',
    description: 'Consultez les réponses et messages de vos invités'
  },

  // TODO: Ajouter les suggestions
  {
    title: 'Discussions',
    path: '/client/discussions',
    icon: '/icons/discussions.svg',
    description: 'Contacter l\'équipe de KaWePla'
  },
  // TODO: Ajouter les paramètres
  // {
  //   title: 'Paramètres',
  //   path: '/client/settings',
  //   icon: '/icons/planning.svg',
  //   description: 'Gérez vos paramètres'
  // }
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  // Déterminer le chemin de base pour la correspondance active
  const basePath = pathname?.split('/').slice(0, 3).join('/');

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.sidebarHeader}>
        <Link href="/">
          <Image 
            src="/images/logo.png" 
            alt="WeddInvite" 
            width={100} 
            height={100} 
            style={{ objectFit: 'contain' }}
            priority
          />
        </Link>
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
              basePath?.includes(item.path) ? styles.active : ''
            }`}
            title={item.description}
          >
            <span className={styles.icon}>
              <Image
                src={item.icon}
                alt=""
                width={24}
                height={24}
              />
            </span>
            {!isCollapsed && (
              <div className={styles.navContent}>
                <span className={styles.title}>{item.title}</span>
                {item.description && (
                  <span className={styles.description}>{item.description}</span>
                )}
              </div>
            )}
          </Link>
        ))}
        <div className={`${styles.navItem} ${styles.accessibilityNavItem}`}>
          <AccessibilityMenu />
        </div>
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.footerContent}>
          <Link href="/client/help" className={styles.helpLink} >
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