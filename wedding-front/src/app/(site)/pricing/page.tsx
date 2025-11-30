'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import styles from './pricing.module.css';

export default function PricingPage() {
    const [activeTab, setActiveTab] = useState<'host' | 'provider'>('host');

    const hostPlans = [
        {
            name: "Découverte",
            price: 0,
            description: "Parfait pour tester la plateforme.",
            features: [
                "1 invitation personnalisable",
                "Jusqu'à 25 invités",
                "RSVP basique",
                "1 design standard",
                "3 requêtes IA",
                "Support communautaire"
            ],
            cta: "Commencer gratuitement",
            ctaLink: "/auth/register?role=host&plan=free",
            popular: false
        },
        {
            name: "Essentiel",
            price: 25,
            description: "Pour les petits mariages et événements intimes.",
            features: [
                "2 invitations personnalisables",
                "Jusqu'à 60 invités",
                "RSVP avec préférences alimentaires",
                "5 designs premium",
                "Album photos (50 photos max)",
                "15 requêtes IA",
                "Support email"
            ],
            cta: "Choisir Essentiel",
            ctaLink: "/auth/register?role=host&plan=essential",
            popular: false
        },
        {
            name: "Élégant",
            price: 49,
            description: "Le choix le plus populaire pour les mariages.",
            features: [
                "3 invitations personnalisables",
                "Jusqu'à 120 invités",
                "RSVP complet + messages",
                "10 designs premium",
                "Album photos (150 photos max)",
                "QR codes personnalisés",
                "40 requêtes IA",
                "Support prioritaire"
            ],
            cta: "Choisir Élégant",
            ctaLink: "/auth/register?role=host&plan=elegant",
            popular: true
        },
        {
            name: "Luxe",
            price: 99,
            description: "L'expérience complète sans compromis.",
            features: [
                "5 invitations personnalisables",
                "Jusqu'à 250 invités",
                "Album photos (500 photos max)",
                "Tous les designs + personnalisations",
                "100 requêtes IA",
                "Accès bêta aux nouvelles fonctionnalités"
            ],
            cta: "Choisir Luxe",
            ctaLink: "/auth/register?role=host&plan=luxe",
            popular: false
        }
    ];

    const providerPlans = [
        {
            name: "Accès Anticipé",
            price: 0,
            description: "Profitez de toutes les fonctionnalités gratuitement pendant la phase de lancement.",
            features: [
                "Page vitrine complète",
                "Réception illimitée de demandes",
                "20 requêtes IA / mois",
                "Tableau de bord de suivi",
                "0% de commission",
                "Badge 'Vérifié' (après validation)"
            ],
            cta: "Inscrire mon activité",
            ctaLink: "/auth/register?role=provider",
            popular: true
        }
    ];

    const plans = activeTab === 'host' ? hostPlans : providerPlans;

    return (
        <div className={styles.pricingPage}>
            <div className={styles.header}>
                <div className={styles.container}>
                    <h1 className={styles.title}>Des tarifs simples et transparents</h1>
                    <p className={styles.subtitle}>
                        Choisissez le plan adapté à vos besoins. Aucun frais caché, annulation à tout moment.
                    </p>

                    <div className={styles.toggleContainer}>
                        <button
                            className={`${styles.toggleBtn} ${activeTab === 'host' ? styles.active : ''}`}
                            onClick={() => setActiveTab('host')}
                        >
                            Organisateurs
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${activeTab === 'provider' ? styles.active : ''}`}
                            onClick={() => setActiveTab('provider')}
                        >
                            Prestataires
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.container}>
                <div className={styles.grid}>
                    {plans.map((plan, index) => (
                        <div key={index} className={`${styles.card} ${plan.popular ? styles.popular : ''}`}>
                            {plan.popular && <div className={styles.popularBadge}>Populaire</div>}

                            <h3 className={styles.planName}>{plan.name}</h3>
                            <div className={styles.price}>
                                {plan.price === 0 ? "Gratuit" : (
                                    <>
                                        {plan.price}<span className={styles.currency}>€</span>
                                    </>
                                )}
                                {plan.price > 0 && <span className={styles.period}>/événement</span>}
                            </div>

                            <p className={styles.description}>{plan.description}</p>

                            <ul className={styles.featuresList}>
                                {plan.features.map((feature, i) => (
                                    <li key={i} className={styles.featureItem}>
                                        <Check size={20} className={styles.checkIcon} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={plan.ctaLink}
                                className={`${styles.ctaButton} ${plan.popular ? styles.primary : styles.outline}`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.faqSection}>
                <div className={styles.container}>
                    <h2 className={styles.faqTitle}>Questions fréquentes</h2>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
                            Vous avez d'autres questions ? Consultez notre centre d'aide.
                        </p>
                        <Link href="/faq" className={`${styles.ctaButton} ${styles.outline}`} style={{ display: 'inline-block', width: 'auto', padding: '12px 32px' }}>
                            Voir la FAQ complète
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
