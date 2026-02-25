'use client';

import { motion } from 'framer-motion';
import { Mail, Users, Camera, Briefcase } from 'lucide-react';
import styles from './Features.module.css';

const features = [
    {
        icon: Mail,
        title: 'Invitations personnalisées',
        description: 'Créez et envoyez de magnifiques invitations digitales qui reflètent le style de votre événement.',
        image: 'https://images.unsplash.com/photo-1765614766650-43c8625ae745?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY2VsZWJyYXRpb24lMjBlbGVnYW50fGVufDF8fHx8MTc2NzgwOTk5NHww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
        icon: Users,
        title: 'Gestion des invités',
        description: 'Suivez les confirmations de présence et gérez votre liste d\'invités en temps réel.',
        image: 'https://images.unsplash.com/photo-1741969494307-55394e3e4071?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ0aGRheSUyMHBhcnR5JTIwZGVjb3JhdGlvbnxlbnwxfHx8fDE3Njc4MzQxNTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
        icon: Camera,
        title: 'Albums photos partagés',
        description: 'Rassemblez tous les souvenirs de votre événement dans un espace partagé sécurisé.',
        image: 'https://images.unsplash.com/photo-1550305080-4e029753abcf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBldmVudCUyMGNvbmZlcmVuY2V8ZW58MXx8fHwxNzY3ODU0ODk2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
        icon: Briefcase,
        title: 'Annuaire prestataires',
        description: 'Accédez à notre réseau de prestataires de confiance pour tous vos besoins.',
        image: 'https://images.unsplash.com/photo-1712903276040-c99b32a057eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldmVudCUyMHBsYW5uaW5nJTIwdGFibGV0fGVufDF8fHx8MTc2Nzg4NTMzNHww&ixlib=rb-4.1.0&q=80&w=1080',
    },
];

export function Features() {
    return (
        <section className={styles.section}>
            {/* Subtle background pattern */}
            <div className={styles.bgPattern} />

            <div className={styles.container}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={styles.header}
                >
                    <p className={styles.label}>
                        Nos fonctionnalités
                    </p>
                    <h2 className={styles.title}>
                        Tout ce dont vous avez besoin
                    </h2>
                    <div className={styles.divider}></div>
                </motion.div>

                <div className={styles.grid}>
                    {features.map((feature, index) => (
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
                            {/* Image with indigo overlay */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{
                                    duration: 0.6,
                                    ease: "easeOut",
                                    delay: index * 0.1
                                }}
                                className={styles.imageBox}
                            >
                                <img
                                    src={feature.image}
                                    alt={feature.title}
                                    className={styles.image}
                                />
                                {/* Indigo/Coral gradient overlay */}
                                <div
                                    className={styles.overlay}
                                    style={{
                                        background: index % 2 === 0
                                            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.7) 0%, rgba(99, 102, 241, 0.4) 100%)'
                                            : 'linear-gradient(135deg, rgba(251, 113, 133, 0.7) 0%, rgba(251, 113, 133, 0.4) 100%)'
                                    }}
                                />
                                {/* Icon on image */}
                                <div className={styles.iconContainer}>
                                    <div className={styles.iconBox}>
                                        <feature.icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                                    </div>
                                </div>
                            </motion.div>

                            <h3 className={styles.featureTitleBox}>
                                <span className={styles.featureTitle}>
                                    {feature.title}
                                </span>
                            </h3>
                            <p className={styles.description}>
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
