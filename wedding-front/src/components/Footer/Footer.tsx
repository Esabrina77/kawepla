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
                  width={100}
                  height={100}
                  className={`logo-image ${styles.logoImage}`}
                />
              </div>
            </div>
            <p className={styles.description}>
              Créez vos invitations de événement numériques et gérez vos invités en toute simplicité.
            </p>
          </div>

          {/* Liens rapides */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              Liens rapides
            </h4>
            <ul className={styles.linkList}>
              <li>
                <button
                  onClick={() => handleFooterLink('#accueil')}
                  className={styles.footerLink}
                >
                  Accueil
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterLink('#fonctionnalites')}
                  className={styles.footerLink}
                >
                  Fonctionnalités
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterLink('#témoignages')}
                  className={styles.footerLink}
                >
                  Témoignages
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterLink('#tarifs')}
                  className={styles.footerLink}
                >
                  Tarifs
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterLink('#faq')}
                  className={styles.footerLink}
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleFooterLink('#contact')}
                  className={styles.footerLink}
                >
                  Contact
                </button>
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
              <span className={styles.contactText}>kawepla.kaporelo@gmail.com</span>
            </div>
            <div className={styles.contactItem}>
              <Phone className={styles.contactIcon} size={16} />
              <span className={styles.contactText}>+33 1 23 45 67 89</span>
            </div>
            <div className={styles.contactItem}>
              <MapPin className={styles.contactIcon} size={16} />
              <span className={styles.contactText}>123 Rue de l'Amour, 75001 Paris</span>
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div className={styles.socialSection}>
            <h4 className={styles.sectionTitle}>
              Suivez-nous
            </h4>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Twitter">
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Section inférieure */}
        <div className={styles.bottomSection}>
          <p className={styles.copyright}>
            © 2024 Kawepla. Fait avec <Heart className={styles.heartIcon} size={16} /> en France.
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