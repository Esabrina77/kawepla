'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './FAQ.module.css';

const faqs = [
    {
        question: 'Comment fonctionne la période d\'essai gratuite ?',
        answer: 'Vous pouvez essayer le plan Premium gratuitement pendant 14 jours, sans carte bancaire requise. À la fin de la période d\'essai, vous pouvez choisir de continuer avec un plan payant ou revenir au plan gratuit.'
    },
    {
        question: 'Puis-je changer de plan à tout moment ?',
        answer: 'Oui, absolument ! Vous pouvez passer à un plan supérieur ou inférieur à tout moment. Si vous passez à un plan supérieur, vous serez facturé au prorata. Si vous rétrogradez, le crédit sera appliqué à votre prochaine facture.'
    },
    {
        question: 'Comment puis-je inviter mes invités ?',
        answer: 'Kawepla vous permet d\'envoyer des invitations par email directement depuis la plateforme. Vous pouvez personnaliser vos invitations avec nos modèles ou créer les vôtres. Les invités reçoivent un lien unique pour confirmer leur présence.'
    },
    {
        question: 'Les invités doivent-ils créer un compte ?',
        answer: 'Non, vos invités n\'ont pas besoin de créer un compte. Ils peuvent confirmer leur présence et accéder aux informations de l\'événement via un lien unique envoyé dans l\'invitation.'
    },
    {
        question: 'Mes données sont-elles sécurisées ?',
        answer: 'Absolument. Nous prenons la sécurité de vos données très au sérieux. Toutes les données sont chiffrées et stockées sur des serveurs sécurisés. Nous ne partageons jamais vos informations avec des tiers.'
    },
    {
        question: 'Puis-je utiliser Kawepla pour plusieurs événements ?',
        answer: 'Avec le plan Premium et Entreprise, vous pouvez créer et gérer autant d\'événements que vous le souhaitez. Le plan gratuit vous permet de gérer 1 événement actif à la fois.'
    }
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className={styles.section}>
            <div className={styles.container}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={styles.header}
                >
                    <p className={styles.label}>
                        FAQ
                    </p>
                    <h2 className={styles.title}>
                        Questions fréquentes
                    </h2>
                    <div className={styles.divider}></div>
                    <p className={styles.subtitle}>
                        Vous avez des questions ? Nous avons les réponses.
                    </p>
                </motion.div>

                <div className={styles.faqs}>
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{
                                duration: 0.5,
                                ease: "easeOut",
                                delay: index * 0.05
                            }}
                            className={styles.faqItem}
                        >
                            <button
                                className={styles.questionBtn}
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            >
                                <span className={styles.questionText}>
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`${styles.icon} ${openIndex === index ? styles.iconRotated : ''}`}
                                />
                            </button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                    >
                                        <div className={styles.answer}>
                                            <p className={styles.answerText}>
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
