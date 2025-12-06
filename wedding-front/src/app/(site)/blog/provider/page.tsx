'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, TrendingUp } from 'lucide-react';
import styles from '../blog.module.css'; // Reuse styles

import { providerArticles } from '@/data/blogData';

export default function ProviderBlogPage() {
    const articles = providerArticles;

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
                                    {article.image && (
                                        <Image
                                            src={article.image}
                                            alt={article.title}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    )}
                                    {!article.image && <div className={styles.placeholderImage} style={{ background: 'linear-gradient(45deg, var(--bg-secondary), #A58866)' }} />}
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
