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
    description: 'Vue d\'ensemble de votre invitation',
    priority: 1 // Haute priorité pour mobile
  },
  {
    title: 'Créer l\'événement',
    path: '/client/invitations',
    icon: '/icons/planning.svg',
    description: 'Gérez vos invitations',
    priority: 1
  },
  {
    title: 'Invités',
    path: '/client/guests',
    icon: '/icons/guests.svg',
    description: 'Gérez votre liste d\'invités et les RSVP',
    priority: 1
  },
  {
    title: 'Design',
    path: '/client/design',
    icon: '/icons/design.svg',
    description: 'Personnalisez votre invitation',
    priority: 2
  },
  {
    title: 'Messages RSVP',
    path: '/client/messages',
    icon: '/icons/rsvp.svg',
    description: 'Consultez les réponses et messages de vos invités',
    priority: 2
  },
  {
    title: 'Discussions',
    path: '/client/discussions',
    icon: '/icons/discussions.svg',
    description: 'Discutez avec la team Kawepla',
    priority: 2
  },
  {
    title: 'Paramètres',
    path: '/client/settings',
    icon: '/icons/settings.svg',
    description: 'Gérez vos paramètres',
    priority: 2
  },
  {
    title: 'Aide',
    path: '/client/help',
    icon: '/icons/rsvp.svg',
    description: 'Centre d\'aide et support',
    priority: 2
  }
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  // Déterminer le chemin de base pour la correspondance active
  const basePath = pathname?.split('/').slice(0, 3).join('/');

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Séparer les éléments pour mobile
  const primaryItems = menuItems.filter(item => item.priority === 1);
  const secondaryItems = menuItems.filter(item => item.priority >= 2);

  return (
    <>
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
          {/* Desktop: afficher tous les éléments */}
          <div className={styles.desktopMenu}>
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
          </div>

          {/* Mobile: afficher les éléments prioritaires + bouton + */}
          <div className={styles.mobileMenu}>
            {primaryItems.map((item) => (
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
                    width={20}
                    height={20}
                  />
                </span>
                <div className={styles.navContent}>
                  <span className={styles.title}>{item.title}</span>
                </div>
              </Link>
            ))}

            {/* Bouton + pour afficher plus d'options */}
            <button
              onClick={toggleMobileMenu}
              className={`${styles.navItem} ${styles.moreButton}`}
              title="Plus d'options"
            >
              <span className={styles.icon}>
                <span className={styles.plusIcon}>+</span>
              </span>
              <div className={styles.navContent}>
                <span className={styles.title}>Plus</span>
              </div>
            </button>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.footerContent}>
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

      {/* Menu mobile popup */}
      {showMobileMenu && (
        <div className={styles.mobileMenuOverlay} onClick={toggleMobileMenu}>
          <div className={styles.mobileMenuPopup} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mobileMenuHeader}>
              <h3>Menu complet</h3>
              <button 
                onClick={toggleMobileMenu}
                className={styles.closeMobileMenu}
              >
                ×
              </button>
            </div>
            <div className={styles.mobileMenuItems}>
              {/* Lien vers l'accueil */}
              <Link
                href="/"
                className={styles.mobileMenuItem}
                onClick={toggleMobileMenu}
              >
                <span className={styles.icon}>
                  <Image
                    src="/images/logo.png"
                    alt=""
                    width={20}
                    height={20}
                  />
                </span>
                <div className={styles.mobileMenuItemContent}>
                  <span className={styles.title}>Accueil</span>
                  <span className={styles.description}>Retourner à la page d'accueil</span>
                </div>
              </Link>

              {/* Éléments secondaires */}
              {secondaryItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`${styles.mobileMenuItem} ${
                    basePath?.includes(item.path) ? styles.active : ''
                  }`}
                  onClick={toggleMobileMenu}
                >
                  <span className={styles.icon}>
                    <Image
                      src={item.icon}
                      alt=""
                      width={20}
                      height={20}
                    />
                  </span>
                  <div className={styles.mobileMenuItemContent}>
                    <span className={styles.title}>{item.title}</span>
                    <span className={styles.description}>{item.description}</span>
                  </div>
                </Link>
              ))}

              {/* Menu d'accessibilité */}
              <div className={styles.mobileMenuAccessibility}>
                <div className={styles.mobileMenuItemContent}>
                  <span className={styles.title}>Accessibilité</span>
                  <span className={styles.description}>Options d'accessibilité</span>
                </div>
                <div className={styles.accessibilityWrapper}>
                  <AccessibilityMenu />
                </div>
              </div>
              
              <div className={styles.mobileMenuFooter}>
                <button 
                  onClick={() => {
                    logout();
                    toggleMobileMenu();
                  }}
                  className={styles.mobileLogoutButton}
                >
                  <span className={styles.icon}>
                    <Image
                      src="/icons/logout.svg"
                      alt=""
                      width={20}
                      height={20}
                    />
                  </span>
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 