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
  CalendarRange, 
  Users, 
  PaintBucket, 
  MessageSquareText, 
  MessagesSquare, 
  HelpCircle, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Home, 
  Settings,
  Images,
  Image as ImageIcon,
  CreditCard
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
    title: 'Design',
    path: '/client/design',
    icon: PaintBucket,
    description: 'Personnalisez votre invitation',
    priority: 2
  },
  {
    title: 'Réponses Invitations',
    path: '/client/messages',
    icon: MessageSquareText,
    description: 'Consultez les réponses et messages de vos invités',
    priority: 2
  },
  {
    title: 'Albums Photos',
    path: '/client/photos',
    icon: Images,
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
  {
    title: 'Discussions',
    path: '/client/discussions',
    icon: MessagesSquare,
    description: 'Discutez avec la team Kawepla',
    priority: 2
  },
  
  {
    title: 'Aide',
    path: '/client/help',
    icon: HelpCircle,
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
          <Link href="/" data-tutorial="logo">
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
            {isCollapsed ? <ChevronRight className={styles.toggleIcon} /> : <ChevronLeft className={styles.toggleIcon} />}
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
                  {<item.icon className={styles.menuIcon} size={24} />}
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
            <div className={`${styles.navItem} ${styles.accessibilityNavItem}`} data-tutorial="accessibility">
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
                  {<item.icon className={styles.menuIcon} size={20} />}
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
                <Plus className={styles.plusIcon} size={24} />
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
                <LogOut className={styles.menuIcon} size={24} />
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
                  <Home className={styles.menuIcon} size={20} />
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
                    {<item.icon className={styles.menuIcon} size={20} />}
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
                    <LogOut className={styles.menuIcon} size={20} />
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