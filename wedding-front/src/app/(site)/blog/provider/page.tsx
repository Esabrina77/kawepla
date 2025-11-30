'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, TrendingUp } from 'lucide-react';
import styles from '../host/blog.module.css'; // Reuse styles

export default function ProviderBlogPage() {
    const articles = [
        {
            id: 1,
            title: "5 astuces pour booster votre visibilité sur Kawepla",
            excerpt: "Optimisez votre profil et attirez plus de clients qualifiés grâce à nos conseils d'experts.",
            category: "Business",
            date: "12 Oct 2025",
            image: "/images/blog/visibility-tips.jpg",
            slug: "booster-visibilite-kawepla"
        },
        {
            id: 2,
            title: "Comment gérer les demandes de devis efficacement ?",
            excerpt: "Gagnez du temps et augmentez votre taux de conversion avec nos modèles de réponse.",
            category: "Gestion",
            date: "08 Oct 2025",
            image: "/images/blog/quote-management.jpg",
            slug: "gerer-demandes-devis"
        },
        {
            id: 3,
            title: "Les tendances événementielles 2026",
            excerpt: "Préparez votre saison prochaine en découvrant ce que les organisateurs rechercheront.",
            category: "Tendances",
            date: "01 Oct 2025",
            image: "/images/blog/event-trends-2026.jpg",
            slug: "tendances-evenementielles-2026"
        }
    ];

    return (
        <div className={styles.blogPage}>
            <header className={styles.header}>
                <div className={styles.container}>
                    <h1 className={styles.title}>Le Blog des Prestataires</h1>
                    <p className={styles.subtitle}>
                        Développez votre activité, trouvez de nouveaux clients et restez à la pointe des tendances.
                    </p>
                </div>
            </header>

            <section className={styles.articlesSection}>
                <div className={styles.container}>
                    <div className={styles.grid}>
                        {articles.map((article) => (
                            <article key={article.id} className={styles.card}>
                                <div className={styles.imageWrapper}>
                                    {/* Placeholder image */}
                                    <div className={styles.placeholderImage} style={{ background: 'linear-gradient(45deg, var(--bg-secondary), #A58866)' }} />
                                    <span className={styles.category}>{article.category}</span>
                                </div>
                                <div className={styles.content}>
                                    <div className={styles.meta}>
                                        <Calendar size={14} />
                                        <span>{article.date}</span>
                                    </div>
                                    <h2 className={styles.cardTitle}>{article.title}</h2>
                                    <p className={styles.excerpt}>{article.excerpt}</p>
                                    <Link href={`/blog/provider/${article.slug}`} className={styles.readMore}>
                                        Lire l'article <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
