'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Calendar, Send, Sparkles } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import styles from './HowItWorks.module.css';

const steps = [
    {
        number: '01',
        icon: Calendar,
        title: 'Créez votre événement',
        description: 'Configurez les détails de votre événement en quelques clics.',
        bgColorLight: '#FFFFFF',
        bgColorDark: '#111827',
    },
    {
        number: '02',
        icon: Send,
        title: 'Invitez vos proches',
        description: 'Partagez vos invitations personnalisées par email ou lien.',
        bgColorLight: '#EEF2FF',
        bgColorDark: '#1F2937',
    },
    {
        number: '03',
        icon: Sparkles,
        title: 'Profitez du moment',
        description: 'Concentrez-vous sur l\'essentiel, on s\'occupe du reste.',
        bgColorLight: '#FFFFFF',
        bgColorDark: '#111827',
    },
];

export function HowItWorks() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
    const imageOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.9, 0.8]);

    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check if dark mode is active
        const checkDarkMode = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };

        // Initial check
        checkDarkMode();

        // Watch for changes
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    return (
        <section ref={containerRef} className={styles.section}>
            {/* Section Header - Full width */}
            <div className={styles.headerContainer}>
                <div className={styles.headerContent}>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className={styles.label}
                    >
                        Comment ça marche
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className={styles.title}
                    >
                        Organisez en 3 étapes simples
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className={styles.subtitle}
                    >
                        Simplifiez l'organisation de vos événements
                    </motion.p>
                </div>
            </div>

            {/* Main Content Area - Fixed Image + Scrollable Steps */}
            <div className={styles.mainLayout}>
                {/* Fixed Image - Left Side (40%) */}
                <div className={styles.imageSidebar}>
                    <div className={styles.stickyImage}>
                        <motion.img
                            src="https://images.unsplash.com/photo-1763429463761-822d11e0be8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldmVudCUyMHBsYW5uaW5nJTIwb3JnYW5pemF0aW9ufGVufDF8fHx8MTc2Nzg4NTM2MXww&ixlib=rb-4.1.0&q=80&w=1080"
                            alt="Event planning"
                            className={styles.bgImage}
                            style={{
                                scale: imageScale,
                                opacity: imageOpacity,
                            }}
                        />
                        {/* Gradient overlay - indigo to dark */}
                        <div
                            className={styles.imageOverlay}
                        />
                        {/* Right edge gradient for smooth transition */}
                        <div
                            className={styles.edgeGradient}
                        />
                    </div>
                </div>

                {/* Scrollable Content - Right Side (60%) */}
                <div className={styles.stepsContainer}>
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: false, amount: 0.5 }}
                            transition={{ duration: 0.8 }}
                            className={styles.stepSection}
                            style={{
                                backgroundColor: isDark ? step.bgColorDark : step.bgColorLight,
                            }}
                        >
                            <div className={styles.stepContent}>
                                {/* Mobile Image */}
                                <div className={styles.mobileImage}>
                                    <img
                                        src="https://images.unsplash.com/photo-1763429463761-822d11e0be8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldmVudCUyMHBsYW5uaW5nJTIwb3JnYW5pemF0aW9ufGVufDF8fHx8MTc2Nzg4NTM2MXww&ixlib=rb-4.1.0&q=80&w=1080"
                                        alt="Event planning"
                                        className={styles.mobileImageImg}
                                    />
                                    <div
                                        className={styles.imageOverlay}
                                    />
                                </div>

                                {/* Large Background Number */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 0.1, scale: 1 }}
                                    viewport={{ once: false, amount: 0.5 }}
                                    transition={{ duration: 0.8, delay: 0.1 }}
                                    className={styles.bgNumber}
                                >
                                    {step.number}
                                </motion.div>

                                {/* Title */}
                                <motion.h3
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false, amount: 0.5 }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                    className={styles.stepTitle}
                                >
                                    {step.title}
                                </motion.h3>

                                {/* Description */}
                                <motion.p
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false, amount: 0.5 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                    className={styles.stepDescription}
                                >
                                    {step.description}
                                </motion.p>

                                {/* Step indicator */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false, amount: 0.5 }}
                                    transition={{ duration: 0.6, delay: 0.5 }}
                                    className={styles.stepBadge}
                                >
                                    Étape {step.number}
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
