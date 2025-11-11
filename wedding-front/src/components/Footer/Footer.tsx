'use client'
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import styles from './Footer.module.css';

export function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  const handleFooterLink = (href: string) => {
    // Si on n'est pas sur la page d'accueil, rediriger vers la page d'accueil avec l'ancre
    if (pathname !== '/') {
      router.push('/' + href);
      return;
    }
    
    // Sinon, faire le scroll smooth normal
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.container}`}>
        <div className={`grid grid-4 ${styles.grid}`}>
          {/* Logo et description */}
          <div className={styles.logoSection}>
            <div className={styles.logoContainer}>
              <div className="logo-container logo-md">
                <Image
                  src="/images/logo.png"
                  alt="Kawepla Logo"
                  width={150}
                  height={120}
                  className={`logo-image ${styles.logoImage}`}
                />
              </div>
            </div>
            <p className={styles.description}>
              La plateforme tout-en-un pour créer vos invitations, gérer vos invités et partager vos moments.
            </p>
          </div>

          {/* Liens rapides */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              Liens rapides
            </h4>
            <ul className={styles.linkList}>
              <li>
                <a href="/" className={styles.footerLink}>
                  Accueil
                </a>
              </li>
              <li>
                <button onClick={() => handleFooterLink('#comment-ca-marche')} className={styles.footerLink}>
                  Comment ça marche
                </button>
              </li>
              <li>
                <button onClick={() => handleFooterLink('#tarifs')} className={styles.footerLink}>
                  Tarifs
                </button>
              </li>
              <li>
                <button onClick={() => handleFooterLink('#faq')} className={styles.footerLink}>
                  FAQ
                </button>
              </li>
              <li>
                <a href="/auth/register" className={styles.footerLink}>
                  Créer un compte
                </a>
              </li>
              <li>
                <a href="/auth/login" className={styles.footerLink}>
                  Se connecter
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              Contact
            </h4>
            <div className={styles.contactItem}>
              <Mail className={styles.contactIcon} size={16} />
              <a href="mailto:kawepla.kaporelo@gmail.com" className={styles.contactText}>
                kawepla.kaporelo@gmail.com
              </a>
            </div>
            <p className={styles.contactNote}>
              Service disponible par mail
            </p>
          </div>

          {/* Réseaux sociaux */}
          <div className={styles.socialSection}>
            <h4 className={styles.sectionTitle}>
              Suivez-nous
            </h4>
            <div className={styles.socialLinks}>

              <a href="#" className={styles.socialLink} aria-label="Instagram">
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Section inférieure */}
        <div className={styles.bottomSection}>
          <p className={styles.copyright}>
            © 2025 Kawepla. Fait avec <Heart className={styles.heartIcon} size={16} /> en France.
          </p>
          <div className={styles.legalLinks}>
            <a href="/mentions-legales" className={styles.legalLink}>
              Mentions légales
            </a>
            <a href="/politique-confidentialite" className={styles.legalLink}>
              Politique de confidentialité
            </a>
            <a href="/conditions-utilisation" className={styles.legalLink}>
              Conditions d'utilisation
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}