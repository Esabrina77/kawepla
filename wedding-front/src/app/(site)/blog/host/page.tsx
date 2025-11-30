'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, Heart, Star } from 'lucide-react';
import styles from './blog.module.css';

export default function HostBlogPage() {
    const articles = [
        {
            id: 1,
            title: "Comment organiser un mariage sans stress ?",
            excerpt: "Découvrez nos 10 conseils pour planifier le plus beau jour de votre vie en toute sérénité.",
            category: "Mariage",
            date: "15 Oct 2025",
            image: "/images/blog/wedding-planning.jpg",
            slug: "organiser-mariage-sans-stress"
        },
        {
            id: 2,
            title: "Les tendances déco anniversaire 2025",
            excerpt: "Des couleurs pastel aux thèmes rétro, voici ce qui fera fureur cette année.",
            category: "Anniversaire",
            date: "10 Oct 2025",
            image: "/images/blog/birthday-trends.jpg",
            slug: "tendances-deco-anniversaire-2025"
        },
        {
            id: 3,
            title: "Réussir son séminaire d'entreprise",
            excerpt: "Engagez vos collaborateurs avec des activités originales et un lieu inspirant.",
            category: "Corporate",
            date: "05 Oct 2025",
            image: "/images/blog/corporate-event.jpg",
            slug: "reussir-seminaire-entreprise"
        }
    ];

    return (
        <div className={styles.blogPage}>
            <header className={styles.header}>
                <div className={styles.container}>
                    <h1 className={styles.title}>Le Blog des Organisateurs</h1>
                    <p className={styles.subtitle}>
                        Inspiration, conseils et astuces pour créer des événements inoubliables.
                    </p>
                </div>
            </header>

            <section className={styles.articlesSection}>
                <div className={styles.container}>
                    <div className={styles.grid}>
                        {articles.map((article) => (
                            <article key={article.id} className={styles.card}>
                                <div className={styles.imageWrapper}>
                                    {/* Placeholder image if real one missing */}
                                    <div className={styles.placeholderImage} />
                                    <span className={styles.category}>{article.category}</span>
                                </div>
                                <div className={styles.content}>
                                    <div className={styles.meta}>
                                        <Calendar size={14} />
                                        <span>{article.date}</span>
                                    </div>
                                    <h2 className={styles.cardTitle}>{article.title}</h2>
                                    <p className={styles.excerpt}>{article.excerpt}</p>
                                    <Link href={`/blog/host/${article.slug}`} className={styles.readMore}>
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
