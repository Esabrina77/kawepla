"use client";

import { useState, useEffect } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import styles from "./Header.module.css";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const { isAuthenticated, user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return "/client/dashboard";
    if (user.role === "ADMIN") return "/super-admin/dashboard";
    if (user.role === "PROVIDER") return "/provider/dashboard";
    return "/client/dashboard";
  };

  const authLink = isAuthenticated ? getDashboardLink() : "/auth/login";
  const authText = isAuthenticated ? "Mon espace" : "Connexion";

  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.container}>
          <Link href="/" className={styles.logoLink}>
            <div className={styles.logoBox}>
              <span
                style={{
                  fontSize: "3rem",
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 700,
                  color: "#6366F1",
                }}
              >
                K
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className={styles.desktopNav}>
            <Link href="/" className={styles.navLink}>
              Accueil
            </Link>
            <Link href="/blog/host" className={styles.navLink}>
              Blog Organisateurs
            </Link>
            <Link href="/blog/provider" className={styles.navLink}>
              Blog Prestataires
            </Link>
            <Link href="/#pricing" className={styles.navLink}>
              Tarifs
            </Link>
            <Link href="/#faq" className={styles.navLink}>
              FAQ / Aide
            </Link>
          </div>

          {/* Right Side - Dark Mode + CTA */}
          <div className={styles.rightSide}>
            {/* Dark Mode Toggle */}
            <button
              className={styles.themeToggle}
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun size={20} color="white" />
              ) : (
                <Moon size={20} color="white" />
              )}
            </button>

            <Link href={authLink}>
              <button className={styles.authBtn}>{authText}</button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={styles.mobileNav}>
            <Link
              href="/"
              className={styles.mobileNavLink}
              onClick={() => setIsMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              href="/blog/host"
              className={styles.mobileNavLink}
              onClick={() => setIsMenuOpen(false)}
            >
              Blog Organisateurs
            </Link>
            <Link
              href="/blog/provider"
              className={styles.mobileNavLink}
              onClick={() => setIsMenuOpen(false)}
            >
              Blog Prestataires
            </Link>
            <Link
              href="/#pricing"
              className={styles.mobileNavLink}
              onClick={() => setIsMenuOpen(false)}
            >
              Tarifs
            </Link>
            <Link
              href="/#faq"
              className={styles.mobileNavLink}
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ / Aide
            </Link>

            <div className={styles.mobileFooter}>
              <button className={styles.themeToggle} onClick={toggleDarkMode}>
                {isDark ? (
                  <Sun size={20} color="white" />
                ) : (
                  <Moon size={20} color="white" />
                )}
              </button>
              <Link 
                href={authLink} 
                style={{ flex: 1 }}
                onClick={() => setIsMenuOpen(false)}
              >
                <button className={styles.authBtn} style={{ width: "100%" }}>
                  {authText}
                </button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
