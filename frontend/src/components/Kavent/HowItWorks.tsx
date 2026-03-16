'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Palette, Rocket, CheckCircle2, Briefcase, Layout, MessageSquare, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import styles from './HowItWorks.module.css';

const clientSteps = [
    { icon: UserPlus, title: 'Inscription', description: 'Rejoignez la communauté Kawepla en quelques secondes.' },
    { icon: Palette, title: 'Design', description: 'Personnalisez votre invitation avec notre éditeur intuitif.' },
    { icon: Rocket, title: 'Événement', description: 'Associez votre design aux infos réelles (lieu, date, heure).' },
    { icon: CheckCircle2, title: 'Suivi', description: 'Gérez les RSVP et collectez les photos en direct.' },
];

const providerSteps = [
    { icon: Briefcase, title: 'Profil Pro', description: 'Créez votre vitrine et définissez votre zone d\'activité.' },
    { icon: Layout, title: 'Services', description: 'Publiez vos offres détaillées et votre portfolio.' },
    { icon: MessageSquare, title: 'Réservations', description: 'Échangez avec les clients et confirmez vos réservations.' },
    { icon: TrendingUp, title: 'Croissance', description: 'Développez votre visibilité et votre chiffre d\'affaires.' },
];

interface HowItWorksProps {
    role?: 'client' | 'provider';
}

export function HowItWorks({ role = 'client' }: HowItWorksProps) {
    const activeSteps = role === 'client' ? clientSteps : providerSteps;
    const [activeStep, setActiveStep] = useState(0);

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % activeSteps.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [activeSteps.length, role]);

    const handleNext = () => setActiveStep((prev) => (prev + 1) % activeSteps.length);
    const handlePrev = () => setActiveStep((prev) => (prev - 1 + activeSteps.length) % activeSteps.length);

    return (
        <section className={styles.section} id="how-it-works">
            <div className={styles.container}>
                <div className={styles.header}>
                    <p className={`${styles.label} ${role === 'client' ? styles.labelHost : styles.labelProvider}`}>
                        Le Concept
                    </p>
                    <h2 className={styles.title}>
                        {role === 'client' ? '4 étapes simples' : 'Lancez votre activité'}
                    </h2>
                </div>

                <div className={styles.carouselContainer}>
                    {/* Stepper Visual (Reduced Size) */}
                    <div className={styles.stepperWrapper}>
                        <div className={styles.progressLine}>
                            <motion.div 
                                className={`${styles.progressFill} ${role === 'client' ? styles.bgHost : styles.bgProvider}`}
                                animate={{ width: `${(activeStep / (activeSteps.length - 1)) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        <div className={styles.stepsIconsRow}>
                            {activeSteps.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = activeStep === index;
                                const isCompleted = activeStep > index;

                                return (
                                    <div key={index} className={styles.stepItem} onClick={() => setActiveStep(index)}>
                                        <div className={`
                                            ${styles.circle} 
                                            ${isActive ? (role === 'client' ? styles.circleActiveHost : styles.circleActiveProvider) : ''}
                                            ${isCompleted ? (role === 'client' ? styles.circleDoneHost : styles.circleDoneProvider) : ''}
                                        `}>
                                            <Icon size={16} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Slide */}
                    <div className={styles.contentArea}>
                        <button onClick={handlePrev} className={styles.navBtn}>←</button>
                        
                        <div className={styles.slideWrapper}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${role}-${activeStep}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className={styles.detailCard}
                                >
                                    <h3 className={styles.detailTitle}>{activeSteps[activeStep].title}</h3>
                                    <p className={styles.detailDescription}>{activeSteps[activeStep].description}</p>
                                    
                                    <div className={styles.timerTrack}>
                                        <motion.div 
                                            key={`timer-${activeStep}`}
                                            className={`${styles.timerFill} ${role === 'client' ? styles.bgHost : styles.bgProvider}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 5, ease: "linear" }}
                                        />
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <button onClick={handleNext} className={styles.navBtn}>→</button>
                    </div>
                </div>
            </div>
        </section>
    );
}
