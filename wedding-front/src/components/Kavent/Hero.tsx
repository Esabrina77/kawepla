'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import styles from './Hero.module.css';

export function Hero() {
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
        <section className={styles.hero}>
            {/* Background Image with 70% opacity - fade in */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className={styles.bgImageContainer}
            >
                <img
                    src="/images/hero/table.png"
                    alt="Elegant event setting"
                    className={styles.bgImage}
                />
            </motion.div>

            {/* Content */}
            <div className={styles.content}>
                {/* Title - fade in from bottom */}
                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                    className={styles.title}
                    style={{
                        textShadow: '0 4px 8px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.6)'
                    }}
                >
                    KAWEPLA
                </motion.h1>

                {/* Divider Line - scale in */}
                <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
                    className={styles.divider}
                />

                {/* Subtitle - fade in from bottom */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 1.2 }}
                    className={styles.subtitle}
                    style={{
                        textShadow: '0 2px 6px rgba(0, 0, 0, 0.9), 0 1px 3px rgba(0, 0, 0, 0.7)'
                    }}
                >
                    Des événements qui vous ressemblent
                </motion.p>

                {/* Hero CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 1.5 }}
                    className={styles.btnContainer}
                >
                    {isAuthenticated ? (
                        <Link href={getDashboardLink()}>
                            <button className={styles.heroBtn}>
                                Mon espace
                            </button>
                        </Link>
                    ) : (
                        <>
                            <Link href="/auth/register?role=HOST">
                                <button className={styles.heroBtn}>
                                    Je suis Organisateur
                                </button>
                            </Link>
                            <Link href="/auth/register?role=PROVIDER">
                                <button className={styles.heroBtnSecondary}>
                                    Je suis Prestataire
                                </button>
                            </Link>
                        </>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
