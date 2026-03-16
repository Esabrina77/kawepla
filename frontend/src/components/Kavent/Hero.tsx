'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import styles from './Hero.module.css';

interface HeroProps {
    role?: 'client' | 'provider';
    onRoleChange?: (role: 'client' | 'provider') => void;
}

export function Hero({ role = 'client', onRoleChange }: HeroProps) {
    const { isAuthenticated } = useAuth();

    return (
        <section className={`${styles.hero} ${role === 'client' ? styles.heroHost : styles.heroProvider}`}>
            {/* Background Image with animated overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 1.2 }}
                className={styles.bgImageContainer}
            >
                <img
                    src="/images/hero/table.png"
                    alt="Elegant event setting"
                    className={styles.bgImage}
                />
                <div className={`${styles.overlay} ${role === 'client' ? styles.overlayHost : styles.overlayProvider}`} />
            </motion.div>

            {/* Content */}
            <div className={styles.content} style={{ zIndex: 10 }}>
                {/* Title */}
                <motion.h1
                    key={`title-${role}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.title}
                    style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                >
                    KAWEPLA
                </motion.h1>

                {/* Divider Line */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className={styles.divider}
                />

                {/* Subtitle */}
                <motion.p
                    key={`subtitle-${role}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={styles.subtitle}
                >
                    {role === 'client' ? 'Des événements qui vous ressemblent' : 'Propulsez votre activité événementielle'}
                </motion.p>

                {/* Role Switcher (Arrows removed) */}
                <div className={styles.heroControls}>
                    <div className={styles.switcher}>
                        <button 
                            className={`${styles.switchBtn} ${role === 'client' ? styles.activeHost : ''}`}
                            onClick={() => onRoleChange?.('client')}
                        >Organisateurs</button>
                        <button 
                            className={`${styles.switchBtn} ${role === 'provider' ? styles.activeProvider : ''}`}
                            onClick={() => onRoleChange?.('provider')}
                        >Prestataires</button>
                    </div>
                </div>
            </div>
        </section>
    );
}
