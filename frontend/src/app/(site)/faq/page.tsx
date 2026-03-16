'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Mail, HelpCircle, Rocket } from 'lucide-react';
import styles from './faq.module.css';

const faqCategories = [
  {
    category: 'Général',
    questions: [
      {
        question: 'Qu\'est-ce que Kawepla ?',
        answer: 'Kawepla est une plateforme complète et gratuite pour organiser tous vos événements : mariages, anniversaires, baptêmes, communions, et bien plus. Créez des invitations numériques élégantes, gérez vos invités, suivez les RSVP en temps réel, partagez des photos et communiquez avec vos invités.',
      },
      {
        question: 'Kawepla est-il vraiment gratuit ?',
        answer: 'Oui ! Notre plan Découverte est 100% gratuit à vie. Vous pouvez créer 1 invitation, inviter jusqu\'à 30 personnes et profiter de toutes les fonctionnalités de base. Pas de carte bancaire requise, pas de période d\'essai limitée.',
      },
      {
        question: 'Quels types d\'événements puis-je organiser ?',
        answer: 'Kawepla s\'adapte à tous vos événements : mariages, anniversaires, baptêmes, communions, baby showers, soirées d\'entreprise, et tout autre événement nécessitant des invitations et une gestion d\'invités.',
      },
      {
        question: 'Ai-je besoin de compétences techniques ?',
        answer: 'Absolument pas ! Kawepla est conçu pour être ultra-simple. En quelques clics, vous créez votre invitation, ajoutez vos invités et envoyez le tout. Notre interface intuitive guide chaque étape.',
      },
    ],
  },
  {
    category: 'Invitations',
    questions: [
      {
        question: 'Comment créer une invitation ?',
        answer: '1. Inscrivez-vous gratuitement. 2. Choisissez un design parmi notre bibliothèque. 3. Personnalisez le texte, la date, le lieu. 4. Ajoutez vos invités. 5. Envoyez ! Le tout en moins de 10 minutes.',
      },
      {
        question: 'Comment envoyer les invitations ?',
        answer: 'Chaque invité reçoit un lien unique par email ou vous pouvez aussi partager un lien partageable pour que chaque invité s\'enregistre lui-même.',
      },
      {
        question: 'Les invités doivent-ils créer un compte ?',
        answer: 'Non ! Vos invités cliquent simplement sur leur lien unique et peuvent répondre immédiatement. Aucune inscription requise pour eux.',
      },
    ],
  },
  {
    category: 'Gestion des invités',
    questions: [
      {
        question: 'Comment ajouter mes invités ?',
        answer: 'Vous pouvez ajouter vos invités un par un ou importer une liste depuis un fichier Excel/CSV. Renseignez simplement prénom, nom et email (ou téléphone).',
      },
      {
        question: 'Comment suivre les réponses (RSVP) ?',
        answer: 'Votre tableau de bord affiche en temps réel qui a confirmé, décliné ou n\'a pas encore répondu.',
      },
      {
        question: 'Puis-je relancer les invités qui n\'ont pas répondu ?',
        answer: 'Oui ! Vous pouvez envoyer un rappel aux invités qui n\'ont pas encore confirmé leur présence.',
      },
      {
        question: 'Combien d\'invités puis-je inviter ?',
        answer: 'Plan Découverte : 30 invités. Contactez-nous pour des événements plus importants.',
      },
    ],
  },
  {
    category: 'Fonctionnalités',
    questions: [
      {
        question: 'Qu\'est-ce que l\'album photos partagé ?',
        answer: 'Vos invités peuvent uploader leurs photos de l\'événement dans un album commun. Fini les photos perdues dans les groupes WhatsApp ! Tout est centralisé et facilement téléchargeable.',
      },
      {
        question: 'Puis-je trouver des prestataires ?',
        answer: 'Oui ! Notre annuaire de prestataires vous permet de trouver des photographes, traiteurs, DJ, décorateurs et bien plus. Vous pouvez les contacter directement via la plateforme.',
      },
      {
        question: 'Les données sont-elles sécurisées ?',
        answer: 'Absolument. Kawepla est conforme RGPD. Vos données sont chiffrées et ne sont jamais partagées avec des tiers.',
      },
    ],
  },
  {
    category: 'Tarifs et paiement',
    questions: [
      {
        question: 'Quels sont les moyens de paiement acceptés ?',
        answer: 'Stripe gère tous les paiements de manière sécurisée.',
      },
      {
        question: 'Puis-je acheter plusieurs packs ?',
        answer: 'Oui ! Vous achetez le package qui vous convient et vous pouvez en cumuler plusieurs selon vos besoins.',
      },
      {
        question: 'Y a-t-il des frais cachés ?',
        answer: 'Aucun frais caché. Le prix affiché est le prix final.',
      },
      {
        question: 'Puis-je annuler mon abonnement ?',
        answer: 'Il n\'y a pas d\'abonnement ! Vous payez une seule fois et gardez l\'accès pendant 1 an après votre événement. Pas de renouvellement automatique.',
      },
    ],
  },
  {
    category: 'Pour les Prestataires',
    questions: [
      {
        question: 'Comment référencer mon activité ?',
        answer: 'Créez un compte "Prestataire" gratuitement, complétez votre profil avec vos photos et tarifs. Notre équipe validera votre profil sous 48h.',
      },
      {
        question: 'Est-ce payant pour les prestataires ?',
        answer: 'L\'inscription est gratuite. Nous prélevons une commission uniquement sur les réservations effectuées via la plateforme (si activé).',
      },
      {
        question: 'Comment améliorer ma visibilité ?',
        answer: 'Soignez vos photos, récoltez des avis positifs et répondez rapidement aux demandes. Vous pouvez aussi opter pour un badge "Vérifié".',
      },
    ],
  },
  {
    category: 'Support',
    questions: [
      {
        question: 'Comment contacter le support ?',
        answer: 'Support par email 7j/7 à kawepla.kaporelo@gmail.com',
      },
      {
        question: 'Proposez-vous des formations ?',
        answer: 'Oui ! Nous offrons des tutoriels vidéo gratuits.',
      },
      {
        question: 'Puis-je obtenir de l\'aide pour créer mon événement ?',
        answer: 'Absolument ! Notre équipe peut vous accompagner dans la création de votre invitation (plan Premium uniquement). Contactez-nous pour plus d\'informations.',
      },
    ],
  },
];

export default function FAQPage() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  return (
    <div className={styles.faqPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Questions <span className={styles.titleAccent}>fréquentes</span>
          </h1>
          <p className={styles.subtitle}>
            Toutes les réponses à vos questions sur Kawepla
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className={styles.faqContent}>
        <div className={styles.container}>
          {faqCategories.map((category, index) => (
            <div key={index} className={styles.category}>
              <h2 className={styles.categoryTitle}>
                <HelpCircle className={styles.categoryIcon} />
                {category.category}
              </h2>
              <div className={styles.questions}>
                {category.questions.map((item, qIndex) => (
                  <details key={qIndex} className={styles.questionItem}>
                    <summary className={styles.question}>
                      <span>{item.question}</span>
                      <ChevronDown className={styles.icon} />
                    </summary>
                    <div className={styles.answer}>
                      <p>{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Vous avez d'autres questions ?</h2>
          <p className={styles.ctaDescription}>
            Notre équipe est là pour vous aider 7j/7
          </p>
          <div className={styles.ctaButtons}>
            <a href="mailto:kawepla.kaporelo@gmail.com" className={styles.ctaButton}>
              <Mail className={styles.ctaIcon} />
              Nous contacter
            </a>
            <Link href="/auth/register" className={styles.ctaButtonSecondary}>
              <Rocket className={styles.ctaIcon} />
              Essayer gratuitement
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
