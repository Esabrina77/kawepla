'use client';

import { motion } from 'framer-motion';
import { Mail, Users, Camera, Briefcase, Zap, Calendar, Heart, ShieldCheck, Star } from 'lucide-react';
import { useEffect, useCallback } from 'react';
import styles from './Features.module.css';

const clientFeatures = [
    { icon: Mail, title: 'Éditeur Design', description: 'Créez vos invitations sur mesure.', image: 'https://images.unsplash.com/photo-1742970416358-2d28d873df56?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { icon: Zap, title: 'Infos d\'Event', description: 'Lieu, date et RSVP en un clic.', image: 'https://images.unsplash.com/photo-1742581659446-6260fc707e7d?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { icon: Users, title: 'Gestion Invités', description: 'Suivez les confirmations en direct.', image: 'https://images.unsplash.com/photo-1632067694887-097be1c5c5d4?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { icon: Calendar, title: 'Organisation', description: 'Checklist et Budget intégrés.', image: 'https://plus.unsplash.com/premium_photo-1682126157704-beacbab4906f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { icon: Briefcase, title: 'Prestataires', description: 'Réservez les meilleurs pros.', image: 'https://images.unsplash.com/photo-1630673394533-b13bef31abf2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { icon: Camera, title: 'QR Photos', description: 'L\'album partagé de vos invités.', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
];

const providerFeatures = [
    { icon: Star, title: 'Visibilité Pro', description: 'Mettez en avant votre expertise.', image: 'https://images.unsplash.com/photo-1607703703520-bb638e84caf2?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXVkaWVuY2V8ZW58MHx8MHx8fDA%3D' },
    { icon: Zap, title: 'Offres Services', description: 'Gérez vos forfaits et tarifs.', image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { icon: Heart, title: 'Portfolio', description: 'Sublimez vos réalisations.', image: 'https://images.unsplash.com/photo-1606819717115-9159c900370b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { icon: ShieldCheck, title: 'Réservations', description: 'Sécurisez vos futurs contrats.', image: 'https://images.unsplash.com/photo-1681505531034-8d67054e07f6?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { icon: Mail, title: 'Messagerie', description: 'Discutez avec vos clients.', image: 'https://plus.unsplash.com/premium_photo-1676057060928-c717a8e96784?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y2hhdGluZ3xlbnwwfHwwfHx8MA%3D%3D' },
    { icon: Zap, title: 'Dashboard', description: 'Suivez vos revenus en direct.', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3RhdHN8ZW58MHx8MHx8fDA%3D' },
];

interface FeaturesProps {
    role?: 'client' | 'provider';
    onRoleChange?: (role: 'client' | 'provider') => void;
    currentIndex: number;
    onIndexChange: (index: number) => void;
}

export function Features({ role = 'client', currentIndex, onIndexChange }: FeaturesProps) {
    const activeFeatures = role === 'client' ? clientFeatures : providerFeatures;

    const handleNext = useCallback(() => {
        onIndexChange((currentIndex + 1) % activeFeatures.length);
    }, [currentIndex, activeFeatures.length, onIndexChange]);

    useEffect(() => {
        const timer = setInterval(handleNext, 6000);
        return () => clearInterval(timer);
    }, [handleNext]);

    const getPositionIndex = (itemIndex: number) => {
        let diff = itemIndex - currentIndex;
        if (diff > activeFeatures.length / 2) diff -= activeFeatures.length;
        if (diff < -activeFeatures.length / 2) diff += activeFeatures.length;
        return diff;
    };

    return (
        <section className={styles.section} id="features">
            <div className={styles.container}>
                <div className={styles.header}>
                    <p className={`${styles.label} ${role === 'client' ? styles.labelHost : styles.labelProvider}`}>
                        Plateforme
                    </p>
                    <h2 className={styles.title}>L'essentiel pour votre projet</h2>
                </div>

                <div className={styles.perspectiveWrapper}>
                    <div className={styles.sliderTrack}>
                        {activeFeatures.map((feature, index) => {
                            const pos = getPositionIndex(index);
                            const isVisible = Math.abs(pos) <= 1;
                            const isCenter = pos === 0;

                            return (
                                <motion.div
                                    key={`${role}-${index}`}
                                    initial={false}
                                    animate={{
                                        x: `${pos * 70}%`,
                                        scale: isCenter ? 1 : 0.8,
                                        opacity: isVisible ? (isCenter ? 1 : 0.4) : 0,
                                        zIndex: isCenter ? 10 : (isVisible ? 5 : 0),
                                        filter: isCenter ? 'blur(0px)' : 'blur(4px)',
                                        pointerEvents: isCenter ? 'auto' : (isVisible ? 'auto' : 'none'),
                                    }}
                                    transition={{ 
                                        duration: 0.8, 
                                        ease: [0.32, 0.72, 0, 1] 
                                    }}
                                    className={`${styles.mainSlide} ${isCenter ? styles.centerCard : styles.sideCard}`}
                                    onClick={() => !isCenter && isVisible && onIndexChange(index)}
                                >
                                    <div className={styles.imageWrap}>
                                        <img src={feature.image} alt="" className={styles.image} />
                                        <div className={`${styles.overlay} ${role === 'client' ? styles.overlayHost : styles.overlayProvider}`} />
                                    </div>
                                    
                                    <div className={styles.infoSide}>
                                        <div className={`${styles.iconCircle} ${role === 'client' ? styles.bgHost : styles.bgProvider}`}>
                                            {(() => {
                                                const Icon = feature.icon;
                                                return <Icon size={24} color="white" />;
                                            })()}
                                        </div>
                                        <h3 className={styles.featureTitle}>{feature.title}</h3>
                                        {isCenter && (
                                            <motion.p 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className={styles.featureDesc}
                                            >
                                                {feature.description}
                                            </motion.p>
                                        )}
                                        
                                        {isCenter && (
                                            <div className={styles.progressTrack}>
                                                <motion.div 
                                                    key={`progress-${currentIndex}`}
                                                    className={`${styles.progressBar} ${role === 'client' ? styles.bgHost : styles.bgProvider}`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: "100%" }}
                                                    transition={{ duration: 6, ease: "linear" }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className={styles.thumbs}>
                        {activeFeatures.map((_, i) => (
                            <button 
                                key={i}
                                onClick={() => onIndexChange(i)}
                                className={`${styles.thumbDot} ${i === currentIndex ? (role === 'client' ? styles.dotHost : styles.dotProvider) : ''}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
