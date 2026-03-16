'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import styles from './CTA.module.css';

interface CTAProps {
    role?: 'client' | 'provider';
}

export function CTA({ role = 'client' }: CTAProps) {
    const { isAuthenticated, user } = useAuth();

    const getDashboardLink = () => {
        if (!user) return '/client/dashboard';
        if (user.role === 'ADMIN') return '/super-admin/dashboard';
        if (user.role === 'PROVIDER') return '/provider/dashboard';
        return '/client/dashboard';
    };

    const authLink = isAuthenticated ? getDashboardLink() : '/auth/register';
    const authText = isAuthenticated ? 'Mon espace' : 'Commencer';

    return (
        <section className={`${styles.section} ${role === 'client' ? styles.themeHost : styles.themeProvider}`}>
            {/* Background Image with overlay */}
            <div className={styles.bgImageContainer}>
                <img
                    src={role === 'client' 
                        ? "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80" 
                        : "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80"
                    }
                    alt="Celebration"
                    className={styles.bgImage}
                />
                <div className={styles.overlay} />
            </div>

            <div className={styles.container}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <p className={styles.label}>
                        Commencez dès aujourd'hui
                    </p>

                    <h2 className={styles.title}>
                        {role === 'client' ? 'Prêt à créer votre événement ?' : 'Prêt à booster votre activité ?'}
                    </h2>

                    <div className={styles.divider}></div>

                    <p className={styles.description}>
                        {role === 'client' 
                            ? "Rejoignez des milliers d'organisateurs qui font confiance à Kawepla" 
                            : "Rejoignez la communauté des meilleurs prestataires de France"
                        }
                    </p>

                    <Link href={authLink}>
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={styles.ctaBtn}
                        >
                            {authText}
                        </motion.button>
                    </Link>

                    <p className={styles.note}>
                        Aucune carte bancaire requise
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
