'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import styles from './Testimonials.module.css';

const testimonials = [
    {
        name: 'Sophie Moreau',
        role: 'Mariée',
        content: 'Kawepla a rendu l\'organisation de notre mariage tellement plus simple. Les invitations étaient magnifiques et la gestion des confirmations un jeu d\'enfant.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    },
    {
        name: 'Marc Dubois',
        role: 'Organisateur événementiel',
        content: 'Un outil indispensable pour mes événements professionnels. L\'interface est intuitive et mes clients adorent les invitations personnalisées.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    },
    {
        name: 'Émilie Laurent',
        role: 'Maman organisatrice',
        content: 'J\'ai utilisé Kawepla pour le baptême de ma fille. C\'était parfait, facile à utiliser et tous nos invités ont adoré partager leurs photos.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    },
];

export function Testimonials() {
    return (
        <section className={styles.section}>
            {/* Elegant background gradient */}
            <div className={styles.gradientBg}></div>

            <div className={styles.container}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={styles.header}
                >
                    <p className={styles.label}>
                        Témoignages
                    </p>
                    <h2 className={styles.title}>
                        Ce qu'ils en pensent
                    </h2>
                    <div className={styles.divider}></div>
                </motion.div>

                <div className={styles.grid}>
                    {testimonials.map((testimonial, index) => (
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
                            className={styles.card}
                        >
                            {/* Quote icon */}
                            <div className={styles.quoteIcon}>
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor">
                                    <path d="M12 21.35l-4.18 8.65L16 34.18V44H0V29.82L8.82 12h8.36l-5.18 9.35zm24 0l-4.18 8.65L40 34.18V44H24V29.82L32.82 12h8.36l-5.18 9.35z" />
                                </svg>
                            </div>

                            {/* Stars */}
                            <div className={styles.stars}>
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className={styles.star} />
                                ))}
                            </div>

                            {/* Content */}
                            <p className={styles.content}>
                                "{testimonial.content}"
                            </p>

                            {/* Author */}
                            <div className={styles.author}>
                                <img
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className={styles.avatar}
                                />
                                <div>
                                    <p className={styles.name}>
                                        {testimonial.name}
                                    </p>
                                    <p className={styles.role}>
                                        {testimonial.role}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
