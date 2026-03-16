'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import styles from './Testimonials.module.css';

const clientTestimonials = [
    {
        name: 'Sophie Moreau',
        role: 'Client - Anniversaire',
        content: 'Kawepla a rendu l\'organisation de mon anniversaire tellement plus simple. Les invitations étaient magnifiques et l\'album photo partagé a été le clou de la soirée !',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    },
    {
        name: 'Émilie Laurent',
        role: 'Parent - Fête d\'école',
        content: 'J\'ai utilisé Kawepla pour la fête de fin d\'année de l\'école. C\'était parfait, facile à utiliser et tous nos invités ont adoré partager leurs photos instantanément.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
    {
        name: 'Lucas Bernard',
        role: 'Client - Crémaillère',
        content: 'Incroyable plateforme. L\'éditeur de design est vraiment puissant et la gestion des RSVP nous a évité bien des relances par SMS.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
    {
        name: 'Clara Petit',
        role: 'Client - Baptême',
        content: 'Un gain de temps précieux. Tout est centralisé au même endroit. Le QR code pour les photos a fonctionné à merveille le jour J.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    },
];

const providerTestimonials = [
    {
        name: 'Marc Dubois',
        role: 'Photographe Pro',
        content: 'Depuis que je propose mes services sur Kawepla, mon carnet de commandes se remplit tout seul. La plateforme est intuitive et me permet de gérer mes réservations sereinement.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    },
    {
        name: 'Damien Vasseur',
        role: 'Traiteur Événementiel',
        content: 'Un excellent outil pour discuter avec mes futurs clients et affiner leurs besoins. La visibilité sur la plateforme est un vrai plus pour mon activité.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    },
    {
        name: 'Sarah Lefebvre',
        role: 'Décoratrice',
        content: 'La mise en avant de mon portfolio sur Kawepla m\'a permis de toucher une clientèle que je ne trouvais pas auparavant. Je recommande à 100%.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1543132220-4bf3de6e10ae?w=100&h=100&fit=crop',
    },
    {
        name: 'Thierry Martin',
        role: 'DJ Pro',
        content: 'Simple, efficace et gratuit. C\'est l\'outil que j\'attendais pour centraliser mes demandes de devis et gérer mon planning d\'événements.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop',
    },
];

interface TestimonialsProps {
    role?: 'client' | 'provider';
}

export function Testimonials({ role = 'client' }: TestimonialsProps) {
    const activeTestimonials = role === 'client' ? clientTestimonials : providerTestimonials;

    return (
        <section className={styles.section} id="testimonials">
            <div className={styles.container}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={styles.header}
                >
                    <p className={`${styles.label} ${role === 'client' ? styles.labelHost : styles.labelProvider}`}>
                        Témoignages
                    </p>
                    <h2 className={styles.title}>Ce qu'ils en pensent</h2>
                </motion.div>

                <div className={styles.grid}>
                    <AnimatePresence mode="wait">
                        {activeTestimonials.map((testimonial, index) => (
                            <motion.div
                                key={`${role}-${index}`}
                                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                className={styles.card}
                            >
                                <div className={styles.stars}>
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className={styles.star} size={14} fill="currentColor" />
                                    ))}
                                </div>

                                <p className={styles.content}>"{testimonial.content}"</p>

                                <div className={styles.author}>
                                    <img src={testimonial.image} alt={testimonial.name} className={styles.avatar} />
                                    <div>
                                        <p className={styles.name}>{testimonial.name}</p>
                                        <p className={styles.role}>{testimonial.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
