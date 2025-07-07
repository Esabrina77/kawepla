'use client';
import React, { useState } from 'react';
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
  const pathname = usePathname();
  const { user } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getDashboardLink = () => {
    if (!user) return null;
    return user.role === 'ADMIN' ? '/super-admin/dashboard' : '/client/dashboard';
  };

  const dashboardLink = getDashboardLink();

  return (
    <nav className={styles.navigation}>
      <div className={`container ${styles.navContainer}`}>
        {/* Section Logo */}
        <div className={styles.logoSection}>
          <Link href="/" className={styles.logo} title="Retour à l'accueil">
            <Image src="/images/logo.png" alt="Logo" width={100} height={100} />
          </Link>
        </div>

        {/* Menu mobile */}
        <button
          className={`${styles.menuButton} ${isMenuOpen ? styles.active : ''}`}
          onClick={toggleMenu}
          aria-label="Menu principal"
          title="Ouvrir/Fermer le menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Section Navigation */}
        <div className={`${styles.mainNav} ${isMenuOpen ? styles.open : ''}`}>
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

        {/* Section Actions */}
        <div className={styles.actionsSection}>
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
                <Button size="small">
                  <Link href="/auth/register" title="Créer un nouveau compte">Inscription</Link>
                </Button>
              </>
            )}
          </div>
          <AccessibilityMenu />
        </div>
      </div>
    </nav>
  );
}; 