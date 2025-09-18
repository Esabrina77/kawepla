'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  PaintBucket, 
  Users, 
  CalendarRange, 
  BarChart3, 
  MessageSquare, 
  HelpCircle, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Plus,
    Home,
    Mail,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Tableau de bord',
    path: '/super-admin/dashboard',
    icon: LayoutDashboard,
    description: 'Vue d\'ensemble administrateur',
    priority: 1
  },
  {
    title: 'Designs',
    path: '/super-admin/design',
    icon: PaintBucket,
    description: 'Gérez les modèles de design',
    priority: 1
  },
  {
    title: 'Utilisateurs',
    path: '/super-admin/users',
    icon: Users,
    description: 'Gérez tous les utilisateurs',
    priority: 1
  },
  {
    title: 'Prestataires',
    path: '/super-admin/providers',
    icon: Users,
    description: 'Gérez tous les prestataires',
    priority: 1
  },
  {
    title: 'Invitations',
    path: '/super-admin/invitations',
    icon: CalendarRange,
    description: 'Surveillez les invitations',
    priority: 2
  },
  {
    title: 'Newsletters',
    path: '/super-admin/newsletters',
    icon: Mail,
    description: 'Gérez les newsletters',
    priority: 2
  },
  {
    title: 'Statistiques',
    path: '/super-admin/stats',
    icon: BarChart3,
    description: 'Analyses et rapports',
    priority: 2
  },
  {
    title: 'Discussions',
    path: '/super-admin/discussions',
    icon: MessageSquare,
    description: 'Support et discussions',
    priority: 2
  }
];

export const SuperAdminSidebar = () => {
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
      {/* Desktop Sidebar */}
      <aside 
        className={`${styles.sidebar} ${styles.superAdminSidebar} ${isCollapsed ? styles.collapsed : ''}`}
        data-testid="super-admin-sidebar"
      >
        {/* Header Section */}
        <div className={styles.sidebarHeader}>
          <Link href="/super-admin/dashboard" data-tutorial="logo">
            <Image 
              src="/images/logo.png" 
              alt="Logo KaWePla" 
              width={100} 
              height={100} 
              className={styles.logoImage}
              priority
            />
          </Link>
          
          <div className={styles.sidebarHeaderButtons}>
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
              {isCollapsed ? <ChevronRight className={styles.toggleIcon} /> : <ChevronLeft className={styles.toggleIcon} />}
            </button>
          </div>
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
            <Link href="/super-admin/help" className={styles.helpLink}>
              <span className={styles.icon}>
                <HelpCircle className={styles.menuIcon} size={18} />
              </span>
              {!isCollapsed && <span>Aide</span>}
            </Link>
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