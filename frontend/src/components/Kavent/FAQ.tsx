'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './FAQ.module.css';

const clientFaqs = [
    {
        question: "Comment puis-je personnaliser mon invitation ?",
        answer: "C'est très simple ! Une fois inscrit, accédez à notre galerie de modèles. Choisissez un design qui vous plaît, puis utilisez notre éditeur intuitif pour modifier les textes, les couleurs et même ajouter vos propres photos. Une fois terminé, enregistrez votre design pour l'utiliser lors de la création de votre événement."
    },
    {
        question: "Comment fonctionne le système de RSVP ?",
        answer: "Chaque invitation générée contient un lien unique pour vos invités. Ils peuvent confirmer leur présence (adultes, enfants) directement depuis leur mobile. Vous recevez une notification en temps réel et votre tableau de bord se met à jour automatiquement avec le nombre exact de participants."
    },
    {
        question: "Comment mes invités peuvent-ils partager leurs photos ?",
        answer: "Le jour de l'événement, Kawepla génère un QR code unique que vous pouvez imprimer ou afficher. Vos invités le scannent simplement (sans application à télécharger) et peuvent envoyer leurs photos directement dans votre album partagé sécurisé."
    },
    {
        question: "Puis-je gérer mon budget et mon planning ?",
        answer: "Oui, Kawepla inclut des outils de gestion complets. Vous pouvez lister vos tâches par priorité, suivre vos dépenses par catégorie et même discuter directement avec les prestataires que vous avez réservés via notre messagerie intégrée."
    }
];

const providerFaqs = [
    {
        question: "L'inscription sur Kawepla est-elle vraiment gratuite ?",
        answer: "Oui, absolument. Nous ne prélevons aucune commission sur vos contrats. L'inscription, la mise en avant de votre profil et de vos services, ainsi que la réception de demandes de clients sont entièrement gratuites pour les prestataires."
    },
    {
        question: "Comment les clients peuvent-ils me trouver ?",
        answer: "Les utilisateurs de Kawepla ont accès à un annuaire de prestataires. Ils peuvent filtrer par type de service (photographe, traiteur, DJ, etc.), par zone géographique et par budget. Si votre profil correspond à leurs critères, ils peuvent vous envoyer une demande de réservation directement."
    },
    {
        question: "Comment fonctionne la messagerie avec les clients ?",
        answer: "Dès qu'un client s'intéresse à vos services, une conversation s'ouvre dans votre tableau de bord pro. Vous pouvez échanger des messages, envoyer des devis personnalisés et confirmer vos disponibilités en quelques clics."
    },
    {
        question: "Comment mettre en valeur mes réalisations ?",
        answer: "Votre profil prestataire dispose d'une section 'Portfolio' où vous pouvez télécharger des photos de haute qualité de vos précédentes prestations. Un portfolio visuel fort est le meilleur moyen de convaincre les futurs organisateurs de faire appel à vous."
    }
];

interface FAQProps {
    role?: 'client' | 'provider';
}

export function FAQ({ role = 'client' }: FAQProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const activeFaqs = role === 'client' ? clientFaqs : providerFaqs;

    return (
        <section id="faq" className={styles.section}>
            <div className={styles.container}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={styles.header}
                >
                    <p className={`${styles.label} ${role === 'client' ? styles.labelHost : styles.labelProvider}`}>
                        FAQ
                    </p>
                    <h2 className={styles.title}>
                        Questions fréquentes
                    </h2>
                    <div className={styles.divider}></div>
                    <p className={styles.subtitle}>
                        {role === 'client' 
                            ? "Tout ce qu'il faut savoir pour organiser votre projet." 
                            : "Les réponses à vos questions sur Kawepla Pro."
                        }
                    </p>
                </motion.div>

                <div className={styles.faqs}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={role}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            {activeFaqs.map((faq, index) => (
                                <div key={index} className={styles.faqItem}>
                                    <button
                                        className={styles.questionBtn}
                                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    >
                                        <span className={styles.questionText}>
                                            {faq.question}
                                        </span>
                                        <ChevronDown
                                            className={`${styles.icon} ${openIndex === index ? styles.iconRotated : ''} ${role === 'client' ? styles.iconHost : styles.iconProvider}`}
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
                                </div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
