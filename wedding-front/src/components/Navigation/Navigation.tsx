'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/Button/Button';
import { PWAInstallButton } from '@/components/PWAInstallButton/PWAInstallButton';
import styles from './Navigation.module.css';
import { AccessibilityMenu } from '@/components/Accessibility/AccessibilityMenu';
import { useAuth } from '@/hooks/useAuth';

const navigationLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/features', label: 'Fonctionnalités' },
  { href: '/pricing', label: 'Tarifs' },
  { href: '/testimonies', label: 'Témoignages' },
  { href: '/contact', label: 'Contact' },
];

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  // Gérer le montage côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Fermer le menu si on change de route
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Empêcher le scroll du body quand le menu est ouvert
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const getDashboardLink = () => {
    if (!user) return null;
    return user.role === 'ADMIN' ? '/super-admin/dashboard' : '/client/dashboard';
  };

  const dashboardLink = getDashboardLink();

  // Composant du menu mobile à rendre dans un portail
  const MobileMenuPortal = () => {
    if (!mounted) return null;

    return createPortal(
      <>
        {/* Overlay */}
        {isMenuOpen && <div className={styles.overlay} onClick={closeMenu} />}
        
        {/* Menu mobile */}
        <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
          <div className={styles.mobileMenuContent}>
            {/* Navigation links */}
            <ul className={styles.mobileNavLinks}>
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`${styles.mobileNavLink} ${
                      pathname === link.href ? styles.active : ''
                    }`}
                    onClick={closeMenu}
                    title={`Accéder à la page ${link.label.toLowerCase()}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Actions mobiles */}
            <div className={styles.mobileActions}>
              <div className={styles.mobileAuthButtons}>
                {dashboardLink ? (
                  <Button variant="primary" size="large" fullWidth>
                    <Link href={dashboardLink} onClick={closeMenu} title="Accéder à votre tableau de bord">
                      Mon Espace
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="large" fullWidth>
                      <Link href="/auth/login" onClick={closeMenu} title="Se connecter à votre compte">
                        Connexion
                      </Link>
                    </Button>
                    <Button variant="primary" size="large" fullWidth>
                      <Link href="/auth/register" onClick={closeMenu} title="Créer un nouveau compte">
                        Inscription
                      </Link>
                    </Button>
                  </>
                )}
              </div>

              {/* PWA et Accessibilité */}
              <div className={styles.mobileUtilities}>
                <PWAInstallButton />
                <AccessibilityMenu isMobile={true} />
              </div>
            </div>
          </div>
        </div>
      </>,
      document.body
    );
  };

  return (
    <nav className={styles.navigation}>
      <div className={`container ${styles.navContainer}`}>
        {/* Section Logo */}
        <div className={styles.logoSection}>
          <Link href="/" className={styles.logo} title="Retour à l'accueil" onClick={closeMenu}>
            <Image src="/images/logo.png" alt="Logo" width={100} height={100} />
          </Link>
        </div>

        {/* Menu mobile toggle */}
        <button
          className={`${styles.menuButton} ${isMenuOpen ? styles.active : ''}`}
          onClick={toggleMenu}
          aria-label="Menu principal"
          aria-expanded={isMenuOpen}
          title="Ouvrir/Fermer le menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Section Navigation principale - Desktop */}
        <div className={styles.desktopNav}>
          <ul className={styles.navLinks}>
            {navigationLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`${styles.navLink} ${
                    pathname === link.href ? styles.active : ''
                  }`}
                  title={`Accéder à la page ${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Section Actions - Desktop */}
        <div className={styles.desktopActions}>
          <PWAInstallButton />
          <div className={styles.authButtons}>
            {dashboardLink ? (
              <Button variant="primary" size="small">
                <Link href={dashboardLink} title="Accéder à votre tableau de bord">
                  Mon Espace
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" size="small">
                  <Link href="/auth/login" title="Se connecter à votre compte">Connexion</Link>
                </Button>
                <Button variant="primary" size="small">
                  <Link href="/auth/register" title="Créer un nouveau compte">Inscription</Link>
                </Button>
              </>
            )}
          </div>
          <AccessibilityMenu />
        </div>
      </div>

      {/* Menu mobile rendu dans un portail */}
      <MobileMenuPortal />
    </nav>
  );
}; 