import { Card } from '@/components/Card/Card';
import styles from '@/styles/site/faq.module.css';

const faqs = [
  {
    category: 'Général',
    questions: [
      {
        question: 'Qu\'est-ce que KaWepla ?',
        answer: 'KaWepla est une plateforme en ligne qui permet aux futurs mariés de créer et gérer facilement leurs invitations de mariage numériques. Notre solution comprend la gestion des RSVP, la personnalisation des designs, et bien plus encore.'
      },
      {
        question: 'Comment fonctionne le système d\'abonnement ?',
        answer: 'Nous proposons trois formules : Basique, Standard et Premium. Chaque formule est facturée en un paiement unique et valable pour un mariage. Vous pouvez comparer les différentes options dans notre page Tarifs.'
      },
      {
        question: 'Puis-je changer de formule après mon inscription ?',
        answer: 'Oui, vous pouvez upgrader votre formule à tout moment. La différence de prix sera calculée au prorata des fonctionnalités ajoutées.'
      }
    ]
  },
  {
    category: 'Design & Personnalisation',
    questions: [
      {
        question: 'Puis-je personnaliser complètement le design ?',
        answer: 'Oui, tous nos designs sont entièrement personnalisables. Vous pouvez modifier les couleurs, les polices, les images et les textes pour créer une invitation qui vous ressemble.'
      },
      {
        question: 'Les designs sont-ils responsives ?',
        answer: 'Absolument ! Tous nos designs sont optimisés pour s\'afficher parfaitement sur tous les appareils : ordinateurs, tablettes et smartphones.'
      },
      {
        question: 'Puis-je utiliser mes propres photos ?',
        answer: 'Oui, vous pouvez télécharger vos propres photos pour personnaliser votre invitation. Nous acceptons les formats JPG, PNG et GIF.'
      }
    ]
  },
  {
    category: 'RSVP & Invités',
    questions: [
      {
        question: 'Comment mes invités peuvent-ils répondre ?',
        answer: 'Vos invités reçoivent un lien unique vers votre invitation. Ils peuvent facilement répondre en ligne en quelques clics, et vous recevez une notification en temps réel.'
      },
      {
        question: 'Puis-je limiter le nombre d\'invités ?',
        answer: 'Oui, vous pouvez définir un nombre maximum d\'invités par RSVP, et gérer les invitations avec ou sans accompagnant.'
      },
      {
        question: 'Est-il possible d\'exporter la liste des invités ?',
        answer: 'Oui, vous pouvez exporter votre liste d\'invités et leurs réponses au format CSV ou Excel à tout moment.'
      }
    ]
  },
  {
    category: 'Support & Sécurité',
    questions: [   
      {
        question: 'Comment puis-je contacter le support ?',
        answer: 'Notre équipe support est disponible par email 7j/7. Les clients Premium bénéficient également d\'un support téléphonique prioritaire.'
      },
      {
        question: 'Mes données sont-elles sécurisées ?',
        answer: 'Oui, nous utilisons un cryptage SSL pour toutes les données. Vos informations et celles de vos invités sont stockées de manière sécurisée et ne sont jamais partagées.'
      },
      {
        question: 'Quelle est votre politique de remboursement ?',
        answer: 'Nous offrons une garantie satisfait ou remboursé de 30 jours. Si vous n\'êtes pas satisfait de nos services, nous vous remboursons intégralement.'
      }
    ]
  }
];

export default function FAQPage() {
  return (
    <div className={styles.faq}>
      <section className={styles.header}>
        <div className="container">
          <h1>Questions Fréquentes</h1>
          <p>Trouvez rapidement des réponses à vos questions</p>
        </div>
      </section>

      <section className={styles.content}>
        <div className="container">
          {faqs.map((category) => (
            <div key={category.category} className={styles.category}>
              <h2>{category.category}</h2>
              <div className={styles.questions}>
                {category.questions.map((faq) => (
                  <Card key={faq.question} className={styles.questionCard}>
                    <h3>{faq.question}</h3>
                    <p>{faq.answer}</p>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
} 