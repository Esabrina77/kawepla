import Link from 'next/link';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3>WeddingPlan</h3>
          <p>Créez des invitations de mariage uniques et élégantes pour votre jour spécial.</p>
        </div>

        <div className={styles.footerSection}>
          <h4>Navigation</h4>
          <ul>
            <li><Link href="/features">Fonctionnalités</Link></li>
            <li><Link href="/pricing">Tarifs</Link></li>
            <li><Link href="/testimonies">Témoignages</Link></li>
            <li><Link href="/contact">Contact</Link></li>
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
            <li>Email: contact@weddingplan.fr</li>
            <li>Téléphone: +33 1 23 45 67 89</li>
            <li>Du lundi au vendredi</li>
            <li>9h - 18h</li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={styles.container}>
          <p>&copy; {new Date().getFullYear()} WeddingPlan. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
} 