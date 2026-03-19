'use client';

import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import styles from './Footer.module.css';

export function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {/* Brand Section */}
                    <div className={styles.brandColumn}>
                        <h2 className={styles.brandTitle}>
                            KAWEPLA
                        </h2>
                        <p className={styles.brandDescription}>
                            Simplifiez l'organisation de vos événements et créez des souvenirs inoubliables avec vos proches.
                        </p>
                        <div className={styles.socialLinks}>
                            <a href="#" className={styles.socialIcon} aria-label="Facebook">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className={styles.socialIcon} aria-label="Instagram">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className={styles.socialIcon} aria-label="Twitter">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className={styles.socialIcon} aria-label="Linkedin">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className={styles.columnTitle}>
                            Navigation
                        </h3>
                        <ul className={styles.linkList}>
                            <li className={styles.linkItem}><Link href="/" className={styles.link}>Accueil</Link></li>
                            <li className={styles.linkItem}><Link href="/blog" className={styles.link}>Blog</Link></li>
                            <li className={styles.linkItem}><Link href="/pricing" className={styles.link}>Tarifs</Link></li>
                            <li className={styles.linkItem}><Link href="/help" className={styles.link}>FAQ / Aide</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className={styles.columnTitle}>
                            Légal
                        </h3>
                        <ul className={styles.linkList}>
                            <li className={styles.linkItem}><Link href="/mentions-legales" className={styles.link}>Mentions Légales</Link></li>
                            <li className={styles.linkItem}><Link href="/conditions-utilisation" className={styles.link}>CGU</Link></li>
                            <li className={styles.linkItem}><Link href="/politique-confidentialite" className={styles.link}>Confidentialité</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className={styles.columnTitle}>
                            Contact
                        </h3>
                        <ul className={styles.linkList}>
                            <li className={styles.linkItem}>
                                <a href="mailto:kawepla.kaporelo@gmail.com" className={styles.contactLink}>
                                    <Mail size={18} />
                                    <span>kawepla.kaporelo@gmail.com</span>
                                </a>
                            </li>
                            <li className={styles.linkItem}>
                                <div className={styles.contactLink}>
                                    <MapPin size={18} />
                                    <span>Paris, France</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className={styles.bottomBar}>
                    <p className={styles.copyright}>
                        © {new Date().getFullYear()} Kawepla. Tous droits réservés.
                    </p>
                    <div className={styles.legalLinks}>
                        <Link href="/mentions-legales" className={styles.legalLink}>Mentions Légales</Link>
                        <Link href="/politique-confidentialite" className={styles.legalLink}>Confidentialité</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
