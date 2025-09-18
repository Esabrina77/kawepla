'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useProviderProfile } from '@/hooks/useProviderProfile';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  CalendarCheck, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Home,
  Star,
  MapPin,
  Camera
} from 'lucide-react';

const menuItems = [
  {
    title: 'Tableau de bord',
    path: '/provider/dashboard',
    icon: LayoutDashboard,
    description: 'Vue d\'ensemble de votre activité',
    priority: 1
  },
  {
    title: 'Mon Profil',
    path: '/provider/profile',
    icon: User,
    description: 'Gérez votre profil provider',
    priority: 1
  },
  {
    title: 'Mes Services',
    path: '/provider/services',
    icon: Briefcase,
    description: 'Créez et gérez vos services',
    priority: 1
  },
  {
    title: 'Réservations',
    path: '/provider/bookings',
    icon: CalendarCheck,
    description: 'Gérez vos réservations',
    priority: 2
  },
  {
    title: 'Paramètres',
    path: '/provider/settings',
    icon: Settings,
    description: 'Configuration de votre compte',
    priority: 2
  }
];

export const ProviderSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { profile } = useProviderProfile();

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
      <aside className={`${styles.sidebar} ${styles.providerSidebar} ${isCollapsed ? styles.collapsed : ''}`}>
        {/* Header Section */}
        <div className={styles.sidebarHeader}>
          <Link href="/provider/dashboard" data-tutorial="logo">
            <Image 
              src="/images/logo.png" 
              alt="Kawepla Provider" 
              width={100} 
              height={100} 
              className={styles.logoImage}
              priority
            />
          </Link>
          
          <div className={styles.sidebarHeaderButtons}>
            {!isCollapsed && (
              <div className={styles.providerBadge}>
                PROVIDER
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

        {/* Profile Section */}
        {profile && !isCollapsed && (
          <div className={styles.profileSection}>
            <div className={styles.profileInfo}>
              <div className={styles.profilePhoto}>
                {profile.profilePhoto ? (
                  <img src={profile.profilePhoto} alt={profile.businessName} />
                ) : (
                  <Camera size={24} />
                )}
              </div>
              <div className={styles.profileDetails}>
                <h3 className={styles.businessName}>{profile.businessName}</h3>
                <div className={styles.profileMeta}>
                  <MapPin size={12} />
                  <span>{profile.displayCity}</span>
                </div>
                <div className={styles.statusBadge}>
                  {profile.status === 'APPROVED' ? (
                    <span className={styles.approved}>✓ Approuvé</span>
                  ) : profile.status === 'PENDING' ? (
                    <span className={styles.pending}>⏳ En attente</span>
                  ) : profile.status === 'SUSPENDED' ? (
                    <span className={styles.suspended}>⚠️ Suspendu</span>
                  ) : (
                    <span className={styles.rejected}>❌ Rejeté</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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
