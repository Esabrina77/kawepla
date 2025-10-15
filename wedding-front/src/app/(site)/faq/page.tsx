import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronDown, MessageCircle, Mail, Phone } from 'lucide-react';
import styles from './faq.module.css';

export const metadata: Metadata = {
  title: 'FAQ - Questions Fréquentes | Kawepla',
  description: 'Toutes les réponses à vos questions sur Kawepla : plateforme gratuite d\'invitations événement, gestion invités, RSVP en ligne. Support 7j/7.',
  keywords: 'faq kawepla, questions invitations, aide plateforme événement, support kawepla, comment utiliser kawepla',
  openGraph: {
    title: 'FAQ - Questions Fréquentes | Kawepla',
    description: 'Toutes les réponses à vos questions sur Kawepla',
    url: 'https://kawepla.kaporelo.com/faq',
  },
};

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
        answer: 'Kawepla s\'adapte à tous vos événements : mariages, anniversaires, baptêmes, communions, bar/bat mitzvah, baby showers, soirées d\'entreprise, et tout autre événement nécessitant des invitations et une gestion d\'invités.',
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
        question: 'Puis-je personnaliser le design ?',
        answer: 'Oui ! Choisissez parmi nos designs prédéfinis (Plus de 15 modèles disponibles) et personnalisez les couleurs, textes, photos. Les plans Premium et Prestige offrent encore plus d\'options de personnalisation.',
      },
      {
        question: 'Comment envoyer les invitations ?',
        answer: 'Chaque invité reçoit un lien unique par email ou SMS. Il peut également scanner un QR code. Vous pouvez aussi partager un lien public pour que vos invités se pré-enregistrent.',
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
        answer: 'Votre tableau de bord affiche en temps réel qui a confirmé, décliné ou n\'a pas encore répondu. Vous recevez aussi des notifications instantanées à chaque nouvelle réponse.',
      },
      {
        question: 'Puis-je relancer les invités qui n\'ont pas répondu ?',
        answer: 'Oui ! Un simple clic permet d\'envoyer un rappel automatique aux invités qui n\'ont pas encore confirmé leur présence.',
      },
      {
        question: 'Combien d\'invités puis-je inviter ?',
        answer: 'Plan Découverte : 30 invités. Plan Essentiel : 100 invités. Plan Premium : 250 invités. Plan Prestige : 500+ invités. Contactez-nous pour des événements plus importants.',
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
        answer: 'Oui ! Notre annuaire de prestataires vous permet de trouver des photographes, traiteurs, DJ, décorateurs et bien plus. Les prestataires peuvent vous contacter directement via la plateforme.',
      },
      {
        question: 'Les données sont-elles sécurisées ?',
        answer: 'Absolument. Kawepla est conforme RGPD. Vos données sont chiffrées, hébergées en Europe, et ne sont jamais partagées avec des tiers. Vous pouvez supprimer votre compte et toutes vos données à tout moment.',
      },
    ],
  },
  {
    category: 'Tarifs et paiement',
    questions: [
      {
        question: 'Quels sont les moyens de paiement acceptés ?',
        answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard, American Express), PayPal, et virements bancaires. Paiement sécurisé 100%.',
      },
      {
        question: 'Puis-je changer de plan à tout moment ?',
        answer: 'Oui ! Passez au plan supérieur à tout moment. Si vous passez d\'un plan gratuit à payant, vous ne payez que la différence au prorata.',
      },
      {
        question: 'Y a-t-il des frais cachés ?',
        answer: 'Aucun frais caché. Le prix affiché est le prix final. Pas de frais de transaction, pas de commission sur les RSVP.',
      },
      {
        question: 'Puis-je annuler mon abonnement ?',
        answer: 'Il n\'y a pas d\'abonnement ! Vous payez une seule fois et gardez l\'accès pendant 1 an après votre événement. Pas de renouvellement automatique.',
      },
    ],
  },
  {
    category: 'Support',
    questions: [
      {
        question: 'Comment contacter le support ?',
        answer: 'Support par email 7j/7',
      },
      {
        question: 'Proposez-vous des formations ?',
        answer: 'Oui ! Nous offrons des tutoriels vidéo gratuits. ',
      },
      {
        question: 'Puis-je obtenir de l\'aide pour créer mon événement ?',
        answer: 'Absolument ! Notre équipe peut vous accompagner dans la création de votre invitation (plan Prestige uniquement). Contactez-nous pour plus d\'informations.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className={styles.faqPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Foire Aux Questions
          </h1>
          <p className={styles.subtitle}>
            Toutes les réponses à vos questions sur Kawepla.<br />
            Vous ne trouvez pas votre réponse ? <Link href="/contact">Contactez-nous !</Link>
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className={styles.faqContent}>
        <div className={styles.container}>
          {faqCategories.map((category, index) => (
            <div key={index} className={styles.category}>
              <h2 className={styles.categoryTitle}>{category.category}</h2>
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
          <h2>Vous avez d'autres questions ?</h2>
          <p>Notre équipe est là pour vous aider 7j/7</p>
          <div className={styles.ctaButtons}>
            <Link href="/contact" className={styles.ctaButton}>
              <Mail />
              Nous contacter
            </Link>
            <Link href="/auth/register" className={styles.ctaButtonSecondary}>
              Essayer gratuitement
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className={styles.seoContent}>
        <div className={styles.container}>
          <h2>Kawepla : La plateforme complète pour vos événements</h2>
          <p>
            <strong>Kawepla</strong> est la solution idéale pour organiser tous vos événements sans stress. 
            Que vous prépariez un <strong>mariage</strong>, un <strong>anniversaire</strong>, un <strong>baptême</strong> 
            ou tout autre événement, notre plateforme gratuite vous accompagne de A à Z.
          </p>
          <p>
            Créez des <strong>invitations numériques élégantes</strong>, gérez vos invités en temps réel, 
            suivez les <strong>RSVP</strong>, partagez des photos et communiquez facilement avec tous vos participants. 
            Plus de 210 organisateurs nous font déjà confiance pour leurs événements.
          </p>
          <p>
            Notre <strong>plan gratuit</strong> vous permet de découvrir toutes les fonctionnalités essentielles 
            sans engagement. Inscrivez-vous en 2 minutes et créez votre première invitation dès aujourd'hui !
          </p>
        </div>
      </section>
    </div>
  );
}

