import { Metadata } from 'next';
import Link from 'next/link';
import { Heart, Users, Camera, MessageCircle, Calendar, MapPin, Gift, Check } from 'lucide-react';
import styles from './mariage.module.css';

export const metadata: Metadata = {
  title: 'Invitation Mariage Numérique Gratuite | Kawepla - Gestion Complète',
  description: 'Créez votre invitation de mariage numérique gratuite en 10 min. Gestion invités, RSVP en ligne, album photos partagé, économisez +200€. 210+ mariages organisés avec Kawepla.',
  keywords: 'invitation mariage gratuite, invitation mariage numérique, faire-part mariage en ligne, gestion invités mariage, RSVP mariage, album photos mariage, save the date numérique',
  openGraph: {
    title: 'Invitation Mariage Numérique Gratuite | Kawepla',
    description: 'Créez votre invitation de mariage numérique en 10 min - Gratuit',
    url: 'https://kawepla.kaporelo.com/mariage',
  },
};

const features = [
  {
    icon: Heart,
    title: 'Invitations Élégantes',
    description: '15+ designs romantiques et modernes pour votre faire-part de mariage numérique'
  },
  {
    icon: Users,
    title: 'Gestion Invités',
    description: 'Suivez les confirmations, les menus, les +1 en temps réel'
  },
  {
    icon: Calendar,
    title: 'RSVP en Ligne',
    description: 'Vos invités répondent en 1 clic, vous êtes notifié instantanément'
  },
  {
    icon: Camera,
    title: 'Album Photos Partagé',
    description: 'Tous les invités partagent leurs photos dans un seul album'
  },

  {
    icon: MapPin,
    title: 'Plan & Itinéraire',
    description: 'Intégration Google Maps pour guider vos invités jusqu\'au lieu'
  },
  {
    icon: Gift,
    title: 'Liste de Mariage',
    description: 'Ajoutez le lien vers votre liste de cadeaux (Zankyou, MyWed, etc.)'
  },
];

const benefits = [
  'Économisez 300-800€ sur les faire-part papier',
  'Créez et envoyez en moins de 10 minutes',
  'Modifications illimitées (date, lieu, infos)',
  'Écologique : zéro papier gaspillé',
  'Réponses instantanées de vos invités',
  'Suivi en temps réel des confirmations',
  'Album photos centralisé',
  'Accès 1 an après le mariage',
];

const testimonials = [
  {
    name: 'Emma & Lucas',
    date: 'Mariage Juin 2024',
    text: 'Kawepla nous a fait gagner un temps fou ! Plus besoin de relancer chaque invité par téléphone. Nous avions toutes les réponses en temps réel.',
    guests: 120,
    savings: '450€',
  },
  {
    name: 'Marie & Jean',
    date: 'Mariage Septembre 2024',
    text: 'L\'album photos partagé est génial ! Tous nos invités ont uploadé leurs photos et on a pu tout télécharger d\'un coup. Un souvenir inestimable.',
    guests: 80,
    savings: '320€',
  },
];

export default function MariagePage() {
  return (
    <div className={styles.mariagePage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Heart className={styles.badgeIcon} />
            <span>210+ mariages organisés avec Kawepla</span>
          </div>
          
          <h1 className={styles.title}>
            Votre Invitation de Mariage<br />
            <span className={styles.titleAccent}>Numérique & Gratuite</span>
          </h1>
          
          <p className={styles.subtitle}>
            Créez des invitations élégantes, gérez vos invités et suivez les RSVP en temps réel.<br />
            <strong>Économisez +300€ sur les faire-part papier.</strong>
          </p>
          
          <div className={styles.heroButtons}>
            <Link href="/auth/register" className={styles.ctaButton}>
              Créer mon invitation gratuite
            </Link>
            <Link href="/faq" className={styles.ctaButtonSecondary}>
              Comment ça marche ?
            </Link>
          </div>
          
          <p className={styles.heroNote}>
            ✓ Gratuit à vie · ✓ Aucune carte requise · ✓ Prêt en 10 minutes
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            Tout ce dont vous avez besoin<br />
            <span className={styles.sectionSubtitle}>pour votre mariage</span>
          </h2>
          
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <Icon />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefits}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            Pourquoi choisir Kawepla<br />
            <span className={styles.sectionSubtitle}>pour votre mariage ?</span>
          </h2>
          
          <div className={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <div key={index} className={styles.benefitItem}>
                <Check className={styles.benefitIcon} />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonials}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            Ils ont dit "OUI" à Kawepla<br />
            <span className={styles.sectionSubtitle}>pour leur mariage</span>
          </h2>
          
          <div className={styles.testimonialsGrid}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className={styles.testimonialCard}>
                <p className={styles.testimonialText}>"{testimonial.text}"</p>
                <div className={styles.testimonialAuthor}>
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.date}</span>
                </div>
                <div className={styles.testimonialStats}>
                  <span><Users className={styles.statIcon} /> {testimonial.guests} invités</span>
                  <span className={styles.savings}>Économies: {testimonial.savings}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className={styles.ctaFinal}>
        <div className={styles.ctaContent}>
          <h2>Prêt à créer votre invitation de mariage ?</h2>
          <p>Inscrivez-vous gratuitement et créez votre première invitation en 10 minutes</p>
          <Link href="/auth/register" className={styles.ctaButton}>
            Commencer gratuitement
          </Link>
        </div>
      </section>

      {/* SEO Content */}
      <section className={styles.seoContent}>
        <div className={styles.container}>
          <h2>Invitation de Mariage Numérique : La Solution Moderne et Économique</h2>
          
          <h3>Pourquoi choisir une invitation de mariage numérique ?</h3>
          <p>
            Les <strong>invitations de mariage numériques</strong> sont devenues la norme pour les couples modernes. 
            Avec Kawepla, créez des <strong>faire-part de mariage en ligne</strong> élégants en quelques minutes, 
            sans dépenser des centaines d'euros en papeterie traditionnelle.
          </p>
          
          <h3>Économisez du temps et de l'argent</h3>
          <p>
            Un <strong>faire-part de mariage papier</strong> coûte entre 300€ et 800€ pour 100 invités. 
            Avec Kawepla, votre <strong>invitation mariage gratuite</strong> inclut toutes les fonctionnalités : 
            gestion invités, RSVP en ligne, album photos partagé, messagerie. 
            Économisez en moyenne <strong>450€</strong> par mariage.
          </p>
          
          <h3>Gestion simplifiée de vos invités</h3>
          <p>
            Fini les appels téléphoniques pour savoir qui vient ! Avec notre système de <strong>RSVP mariage en ligne</strong>, 
            vos invités confirment en 1 clic et vous êtes notifié instantanément. 
            Suivez en temps réel les confirmations, les menus, les allergies et les +1.
          </p>
          
          <h3>Un album photos collaboratif unique</h3>
          <p>
            Notre <strong>album photos de mariage partagé</strong> permet à tous vos invités d'uploader leurs clichés. 
            Plus besoin de chercher les photos dans 10 groupes WhatsApp différents ! 
            Tout est centralisé et vous pouvez télécharger l'intégralité des souvenirs en un clic.
          </p>
          
          <h3>Écologique et moderne</h3>
          <p>
            En choisissant une <strong>invitation mariage numérique</strong>, vous faites un geste pour la planète. 
            Zéro papier gaspillé, zéro envoi postal. De plus, vous pouvez modifier les informations 
            (date, lieu, horaires) à tout moment gratuitement.
          </p>
        </div>
      </section>
    </div>
  );
}

