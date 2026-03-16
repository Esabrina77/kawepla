'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import styles from './Pricing.module.css';

const clientPlans = [
    { 
        name: 'Découverte', 
        price: 'Gratuit', 
        oldPrice: null,
        discount: null,
        period: '', 
        description: 'Pour tester.', 
        features: ['1 Événement', '25 Invités', '20 Photos', '3 Requêtes IA'], 
        highlighted: false 
    },
    { 
        name: 'Essentiel', 
        price: '22,00 €', 
        oldPrice: '59,00 €',
        discount: '-62%',
        period: '', 
        description: 'Événements intimes.', 
        features: ['2 Événements', '60 Invités', '50 Photos', '15 Requêtes IA'], 
        highlighted: false 
    },
    { 
        name: 'Élégant', 
        price: '49,00 €', 
        oldPrice: '99,00 €',
        discount: '-50%',
        period: '', 
        description: 'Le plus complet.', 
        features: ['3 Événements', '120 Invités', '150 Photos', '40 Requêtes IA'], 
        highlighted: true 
    },
    { 
        name: 'Luxe', 
        price: '99,00 €', 
        oldPrice: '149,00 €',
        discount: '-33%',
        period: '', 
        description: 'Expérience sans limite.', 
        features: ['5 Événements', '250 Invités', '500 Photos', '100 Requêtes IA'], 
        highlighted: false 
    },
];

interface PricingProps {
    role?: 'client' | 'provider';
}

export function Pricing({ role = 'client' }: PricingProps) {
    const { isAuthenticated, user } = useAuth();

    const getDashboardLink = () => {
        if (!user) return '/client/dashboard';
        if (user.role === 'ADMIN') return '/super-admin/dashboard';
        if (user.role === 'PROVIDER') return '/provider/dashboard';
        return '/client/dashboard';
    };

    const authLink = isAuthenticated ? getDashboardLink() : '/auth/register';

    return (
        <section className={styles.section} id="pricing">
            <div className={styles.container}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={styles.header}
                >
                    <p className={`${styles.label} ${role === 'client' ? styles.labelHost : styles.labelProvider}`}>
                        Tarification
                    </p>
                    <h2 className={styles.title}>
                        {role === 'client' ? 'Des tarifs transparents' : 'Kawepla est gratuit pour vous'}
                    </h2>
                </motion.div>

                <AnimatePresence mode="wait">
                    {role === 'client' ? (
                        <motion.div 
                            key="client-pricing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={styles.grid}
                        >
                            {clientPlans.map((plan, index) => (
                                <div key={index} className={`${styles.card} ${plan.highlighted ? styles.highlighted : ''}`}>
                                    {plan.highlighted && <div className={styles.popularBadge}>POPULAIRE</div>}
                                    <h3 className={styles.planName}>{plan.name}</h3>
                                    
                                    <div className={styles.priceContainer}>
                                        <div className={styles.priceBox}>
                                            <span className={styles.price}>{plan.price}</span>
                                            {plan.oldPrice && <span className={styles.oldPrice}>{plan.oldPrice}</span>}
                                        </div>
                                        {plan.discount && <div className={styles.discountBadge}>{plan.discount}</div>}
                                    </div>
                                    
                                    <ul className={styles.features}>
                                        {plan.features.map((f, i) => (
                                            <li key={i} className={styles.feature}>
                                                <div className={styles.checkWrap}>
                                                    <Check size={14} strokeWidth={3} />
                                                </div>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link href={authLink} className={`${styles.cta} ${plan.name === 'Découverte' ? styles.ctaGhost : ''}`}>
                                        {plan.name === 'Découverte' ? 'Démarrer' : 'Acheter le pack'}
                                    </Link>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="provider-pricing"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={styles.providerCard}
                        >
                            <div className={styles.proIcon}>
                                <Star size={48} fill="var(--provider)" color="var(--provider)" />
                            </div>
                            <h3 className={styles.proTitle}>Zéro commission, 100% visibilité</h3>
                            <p className={styles.proDesc}>
                                Chez Kawepla, nous croyons au talent. C'est pourquoi l'inscription, 
                                la création de services et la réception de demandes sont <strong>gratuites</strong> pour tous les prestataires.
                            </p>
                            <Link href={authLink} className={styles.proCta}>
                                Créer mon compte pro
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
