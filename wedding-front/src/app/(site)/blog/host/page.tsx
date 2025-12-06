'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, Heart, Star } from 'lucide-react';
import styles from '../blog.module.css';

import { hostArticles } from '@/data/blogData';

export default function HostBlogPage() {
    const articles = hostArticles;

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
                                    {article.image && (
                                        <Image
                                            src={article.image}
                                            alt={article.title}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    )}
                                    {!article.image && <div className={styles.placeholderImage} />}
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
