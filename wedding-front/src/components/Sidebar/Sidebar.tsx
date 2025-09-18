'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import NextImage from 'next/image';
import { Button } from '@/components/ui/button';

import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  CalendarRange,
  Users,
  PaintBucket,
  MessageSquare,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Home,
  Settings,
  Image,
  CreditCard,
  User
} from 'lucide-react';

const menuItems = [
  {
    title: 'Tableau de bord',
    path: '/client/dashboard',
    icon: LayoutDashboard,
    description: 'Vue d\'ensemble de votre invitation',
    priority: 1
  },
  {
    title: 'Design',
    path: '/client/design',
    icon: PaintBucket,
    description: 'Personnalisez votre invitation',
    priority: 2
  },
  {
    title: 'Créer l\'événement',
    path: '/client/invitations',
    icon: CalendarRange,
    description: 'Gérez vos invitations',
    priority: 1
  },
  {
    title: 'Invités',
    path: '/client/guests',
    icon: Users,
    description: 'Gérez votre liste d\'invités et les RSVP',
    priority: 1
  },

  {
    title: 'Réponses Invitations',
    path: '/client/messages',
    icon: MessageSquare,
    description: 'Consultez les messages de vos invités',
    priority: 2
  },
  {
    title: 'Prestataires',
    path: '/client/providers/all',
    icon: Users,
    description: 'Trouvez des prestataires',
    priority: 2
  },
  {
    title: 'Albums Photos',
    path: '/client/photos',
    icon: Image,
    description: 'Gérez vos albums photos et les photos',
    priority: 2
  },
  {
    title: 'Facturation',
    path: '/client/billing',
    icon: CreditCard,
    description: 'Gérez votre abonnement et facturation',
    priority: 2
  },
  // {
  //   title: 'Outils',
  //   path: '/client/tools',
  //   icon: Wrench,
  //   description: 'Outils pour votre mariage et événement',
  //   priority: 2
  // },
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const pathname = usePathname();
  const { logout, user } = useAuth();

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
      {/* Desktop Sidebar */}
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
        {/* Header Section */}
        <div className={styles.sidebarHeader}>
          <Link href="/" data-tutorial="logo">
            <NextImage 
              src="/images/logo.png" 
              alt="WeddInvite" 
              width={100} 
              height={100} 
              className={styles.logoImage}
              priority
            />
          </Link>
          <button 
            onClick={toggleSidebar} 
            className={styles.toggleButton}
            aria-label={isCollapsed ? "Développer le menu" : "Réduire le menu"}
          >
            {isCollapsed ? <ChevronRight className={styles.toggleIcon} /> : <ChevronLeft className={styles.toggleIcon} />}
          </button>
        </div>

        {/* Navigation Section */}
        <nav className={styles.navigation}>
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
                  {<item.icon className={styles.menuIcon} size={18} />}
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
          </div>
        </nav>

        {/* Footer Section */}
        <div className={styles.sidebarFooter}>
          <div className={styles.footerContent}>
            <Button
              variant="outline"
              onClick={logout}
              className={styles.logoutButton}
              title="Se déconnecter"
            >
              <LogOut className={styles.menuIcon} size={16} />
              {!isCollapsed && <span>Se déconnecter</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className={styles.mobileBottomNav}>
        <div className={styles.mobileNavContainer}>
          {primaryItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.mobileNavItem} ${
                basePath?.includes(item.path) ? styles.active : ''
              }`}
              title={item.title}
            >
              <span className={styles.mobileIcon}>
                {<item.icon className={styles.mobileMenuIcon} size={20} />}
              </span>
              <span className={styles.mobileTitle}>{item.title}</span>
            </Link>
          ))}

          {/* Bouton Plus pour menu complet */}
          <button
            onClick={toggleMobileMenu}
            className={`${styles.mobileNavItem} ${styles.mobileMoreButton}`}
            title="Plus d'options"
          >
            <span className={styles.mobileIcon}>
              <Plus className={styles.mobileMenuIcon} size={20} />
            </span>
            <span className={styles.mobileTitle}>Plus</span>
          </button>
        </div>
      </nav>

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
                  <Home className={styles.menuIcon} size={18} />
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
                    {<item.icon className={styles.menuIcon} size={18} />}
                  </span>
                  <div className={styles.mobileMenuItemContent}>
                    <span className={styles.title}>{item.title}</span>
                    <span className={styles.description}>{item.description}</span>
                  </div>
                </Link>
              ))}
              
              <div className={styles.mobileMenuFooter}>
                <Button
                  variant="outline"
                  onClick={() => {
                    logout();
                    toggleMobileMenu();
                  }}
                  className={styles.mobileLogoutButton}
                >
                  <LogOut className={styles.menuIcon} size={18} />
                  <span>Se déconnecter</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 