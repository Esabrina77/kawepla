'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import styles from './CTA.module.css';

export function CTA() {
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
        <section className={styles.section}>
            {/* Background Image with overlay */}
            <div className={styles.bgImageContainer}>
                <img
                    src="https://images.unsplash.com/photo-1605701249915-0e5dbedc4137?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZWxlYnJhdGlvbiUyMHBhcnR5JTIwZWxlZ2FudHxlbnwxfHx8fDE3Njc4ODUzODB8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Celebration"
                    className={styles.bgImage}
                />
                {/* Coral gradient overlay */}
                <div className={styles.overlay} />
            </div>

            <div className={styles.container}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <p className={styles.label}>
                        Commencez dès aujourd'hui
                    </p>

                    <h2 className={styles.title}>
                        Prêt à créer votre événement ?
                    </h2>

                    <div className={styles.divider}></div>

                    <p className={styles.description}>
                        Rejoignez des milliers d'organisateurs qui font confiance à Kawepla
                    </p>

                    <Link href={authLink}>
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
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
