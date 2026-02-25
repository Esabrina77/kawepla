'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import styles from './Pricing.module.css';

const plans = [
    {
        name: 'Découverte',
        price: 'Gratuit',
        period: '',
        description: 'Parfait pour tester la plateforme.',
        features: [
            '1 invitation personnalisable',
            'Jusqu\'à 25 invités',
            'RSVP basique',
            '1 design standard',
            '3 requêtes IA',
            'Support communautaire',
        ],
        ctaType: 'primary',
        highlighted: false,
    },
    {
        name: 'Essentiel',
        price: '25€',
        period: '/événement',
        description: 'Pour les petits mariages et événements intimes.',
        features: [
            '2 invitations personnalisables',
            'Jusqu\'à 60 invités',
            'RSVP avec préférences alimentaires',
            '5 designs premium',
            'Album photos (50 photos max)',
            '15 requêtes IA',
            'Support email',
        ],
        ctaType: 'secondary',
        highlighted: false,
    },
    {
        name: 'Élégant',
        price: '49€',
        period: '/événement',
        description: 'Le choix le plus populaire pour les mariages.',
        features: [
            '3 invitations personnalisables',
            'Jusqu\'à 120 invités',
            'RSVP complet + messages',
            '10 designs premium',
            'Album photos (150 photos max)',
            'QR codes personnalisés',
            '40 requêtes IA',
            'Support prioritaire',
        ],
        ctaType: 'secondary',
        highlighted: true,
    },
    {
        name: 'Luxe',
        price: '99€',
        period: '/événement',
        description: 'L\'expérience complète sans compromis.',
        features: [
            '5 invitations personnalisables',
            'Jusqu\'à 250 invités',
            'Album photos (500 photos max)',
            'Tous les designs + personnalisations',
            '100 requêtes IA',
            'Accès bêta aux nouvelles fonctionnalités',
        ],
        ctaType: 'secondary',
        highlighted: false,
    },
];

export function Pricing() {
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
            <div className={styles.container}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={styles.header}
                >
                    <p className={styles.label}>
                        Nos tarifs
                    </p>
                    <h2 className={styles.title}>
                        Des tarifs simples et transparents
                    </h2>
                    <div className={styles.dividerContainer}>
                        <div className={styles.divider}></div>
                    </div>
                </motion.div>

                <div className={styles.grid}>
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{
                                duration: 0.6,
                                ease: "easeOut",
                                delay: index * 0.1
                            }}
                            className={`${styles.card} ${plan.highlighted ? styles.highlighted : ''}`}
                        >
                            {plan.highlighted && (
                                <div className={styles.popularBadge}>
                                    Le plus populaire
                                </div>
                            )}

                            <div className={styles.cardHeader}>
                                <h3 className={styles.planName}>
                                    {plan.name}
                                </h3>
                                <p className={styles.planDescription}>
                                    {plan.description}
                                </p>
                                <div className={styles.priceBox}>
                                    <span className={styles.price}>
                                        {plan.price}
                                    </span>
                                </div>
                                <span className={styles.period}>
                                    {plan.period}
                                </span>
                            </div>

                            <ul className={styles.featuresList}>
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className={styles.featureItem}>
                                        <div className={styles.checkIconContainer}>
                                            <Check className={styles.checkIcon} strokeWidth={3} />
                                        </div>
                                        <span className={styles.featureText}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Link href={authLink} className="w-full">
                                <button
                                    className={`${styles.ctaBtn} ${plan.highlighted ? styles.ctaPrimary : styles.ctaSecondary}`}
                                >
                                    {isAuthenticated ? 'Mon espace' : (plan.name === 'Découverte' ? 'Commencer gratuitement' : `Choisir ${plan.name}`)}
                                </button>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
