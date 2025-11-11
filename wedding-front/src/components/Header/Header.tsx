'use client';

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { FloatingThemeToggle } from "@/components/FloatingThemeToggle";
import styles from './Header.module.css';

interface HeaderProps {
  onNavigate?: (page: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  const navItems = [
    { label: "Accueil", href: "/" },
    { label: "Comment ça marche", href: "#comment-ca-marche" },
    { label: "Tarifs", href: "#tarifs" },
    { label: "FAQ", href: "/faq" },
  ];

  const handleSmoothScroll = (href: string) => {
    // Si c'est un lien externe (commence par /)
    if (href.startsWith('/')) {
      router.push(href);
      setIsMenuOpen(false);
      return;
    }
    
    // Si on n'est pas sur la page d'accueil, rediriger vers la page d'accueil avec l'ancre
    if (pathname !== '/') {
      router.push('/' + href);
      return;
    }
    
    // Sinon, faire le scroll smooth normal pour les ancres
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  // Déterminer le lien du dashboard selon le rôle de l'utilisateur
  const getDashboardLink = () => {
    if (isLoading) return '/auth/login'; // Or a loading page
    if (!user) return '/auth/login';
    
    switch (user.role) {
      case 'ADMIN':
        return '/super-admin/dashboard';
      case 'HOST':
      default:
        return '/client/dashboard';
    }
  };

  // Déterminer le texte du bouton selon le statut de connexion
  const getButtonText = () => {
    if (isLoading) return 'Chargement...';
    if (isAuthenticated && user) return 'Mon espace';
    return 'Commencer';
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logoSection}>
          <Link href="/">
            <div className="logo-container logo-lg">
              <Image
                src="/images/logo.png"
                alt="Kawepla Logo"
                width={150}
                height={120}
                className={`logo-image ${styles.logoImage}`}
                priority
              />
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleSmoothScroll(item.href)}
              className={styles.navButton}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className={styles.ctaSection}>
          <FloatingThemeToggle variant="inline" size={20} className={styles.desktopThemeToggle} />
          <Link href={getDashboardLink()} className={styles.signupButton}>
            {getButtonText()}
          </Link>
        </div>

        {/* Mobile Menu Button with Theme Toggle */}
        <div className={styles.mobileMenuSection}>
          <FloatingThemeToggle variant="inline" size={20} className={styles.mobileThemeToggle} />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={styles.mobileMenuButton}
            aria-label="Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`${styles.mobileNav} ${isMenuOpen ? styles.open : ''}`}>
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleSmoothScroll(item.href)}
            className={styles.mobileNavButton}
          >
            {item.label}
          </button>
        ))}
        
        <div className={styles.mobileCtaSection}>
          <Link href={getDashboardLink()} className={styles.signupButton}>
            {getButtonText()}
          </Link>
        </div>
      </div>
    </header>
  );
}
