import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, Clock, MapPin } from 'lucide-react';
import styles from './Footer.module.css';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <div className={styles.logoContainer}>
            <Link href="/">
              <Image 
                src="/images/logo.png"
                alt="Jawepla"
                width={150}
                height={100}
                className={styles.logo}
                priority
              />
            </Link>
          </div>
          <p>Créez et gérez des invitations de mariage uniques et élégantes pour votre jour spécial. Notre plateforme vous accompagne dans l'organisation de votre mariage.</p>
        </div>

        <div className={styles.footerSection}>
          <h4>Navigation</h4>
          <ul>
            <li><Link href="/features">Fonctionnalités</Link></li>
            <li><Link href="/pricing">Tarifs</Link></li>
            <li><Link href="/testimonies">Témoignages</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4>Légal</h4>
          <ul>
            <li><Link href="/legal/terms">Conditions d'utilisation</Link></li>
            <li><Link href="/legal/privacy">Politique de confidentialité</Link></li>
            <li><Link href="/legal/cookies">Gestion des cookies</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4>Contact</h4>
          <ul>
            <li>
              <Mail size={16} className={styles.contactIcon} />
              kawepla.kaporelo@gmail.com
            </li>

            <li>
              <Clock size={16} className={styles.contactIcon} />
              Lun-Ven, 9h-18h
            </li>
            <li>
              <MapPin size={16} className={styles.contactIcon} />
              Paris, France
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={styles.container}>
          <p>&copy; {currentYear} Kawepla. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
} 