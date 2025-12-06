'use client';

import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { hostArticles } from '@/data/blogData';
import styles from '../../blog.module.css';

export default function BlogPostPage({ params }: { params: { slug: string } }) {
    const article = hostArticles.find((p) => p.slug === params.slug);

    if (!article) {
        notFound();
    }

    return (
        <div className={styles.blogPage}>
            <article className={styles.container} style={{ paddingTop: '120px' }}>
                <Link href="/blog/host" className={styles.backLink}>
                    <ArrowLeft size={20} /> Retour aux articles
                </Link>

                <header className={styles.articleHeader}>
                    <div className={styles.categoryBadge}>{article.category}</div>
                    <h1 className={styles.articleTitle}>{article.title}</h1>
                    <div className={styles.articleMeta}>
                        <div className={styles.metaItem}>
                            <Calendar size={16} />
                            <span>{article.date}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <User size={16} />
                            <span>Par L'Équipe Kawepla</span>
                        </div>
                    </div>
                </header>

                <div className={styles.articleImageWrapper} style={{ position: 'relative' }}>
                    {article.image ? (
                        <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            style={{ objectFit: 'cover' }}
                            priority
                        />
                    ) : (
                        <div className={styles.placeholderImage} />
                    )}
                </div>

                <div
                    className={styles.articleContent}
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />
            </article>
        </div>
    );
}
