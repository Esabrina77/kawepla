import { Button } from '@/components/Button/Button'
import { Card } from '@/components/Card/Card'
import { VineAnimation } from '@/components/VineAnimation/VineAnimation'
import styles from '@/styles/site/home.module.css'
import Link from 'next/link'
import { PWAInstallButton } from '@/components/PWAInstallButton/PWAInstallButton'

export default function HomePage() {
  return (
    <div className={styles.homePage}>
      <VineAnimation />
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Nous sommes invités à célébrer votre amour</h1>
          <p>Bienvenue sur WeddingPlan, la plateforme qui transforme vos invitations de mariage en une expérience élégante et intuitive.</p>
          <div className={styles.heroButtons}>
            <Link href="/auth/register" title="Commencer à créer votre invitation de mariage">
              <Button variant="primary" size="large">
                Créez votre invitation
              </Button>
            </Link>
            <Link href="/features" title="En savoir plus sur nos fonctionnalités">
              <Button variant="outline" size="large">
                Découvrez nos fonctionnalités
              </Button>
            </Link>
            <PWAInstallButton />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className={styles.about}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Pourquoi WeddingPlan ?</h2>
            <p>Parce que chaque mariage mérite une invitation à la hauteur de l'événement :</p>
          </div>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutItem} title="Design personnalisé">
              <h3>Un design personnalisé qui traduit votre style</h3>
            </div>
            <div className={styles.aboutItem} title="Partage facile">
              <h3>Un lien unique ou QR Code envoyé à vos proches</h3>
            </div>
            <div className={styles.aboutItem} title="Système RSVP">
              <h3>Un système de RSVP simple et efficace</h3>
            </div>
            <div className={styles.aboutItem} title="Gestion en temps réel">
              <h3>Une gestion en temps réel des réponses</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.featuresGrid}>
            <div title="Interface intuitive pour créer votre invitation">
              <Card className={styles.featureCard}>
                <h3>Simplicité & Élégance</h3>
                <p>Un tableau de bord intuitif pour choisir un thème, ajouter vos informations et publier une invitation en quelques clics.</p>
              </Card>
            </div>
            <div title="Options de personnalisation avancées">
              <Card className={styles.featureCard}>
                <h3>Design Raffiné</h3>
                <p>Soyez maître de votre invitation : modèles élégants, thèmes premium, effets visuels, QR Code automatique.</p>
              </Card>
            </div>
            <div title="Outils de gestion des invités">
              <Card className={styles.featureCard}>
                <h3>Gestion des invités</h3>
                <p>Ajoutez vos invités, suivez les confirmations, envoyez des relances… tout se fait automatiquement.</p>
              </Card>
            </div>
            <div title="Informations pratiques pour vos invités">
              <Card className={styles.featureCard}>
                <h3>Programme & Informations pratiques</h3>
                <p>Partagez date, lieu, dress code, hébergements et itinéraires — avec carte interactive et FAQ dédiée.</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorks}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Comment ça marche ?</h2>
          </div>
          <div className={styles.stepsGrid}>
            <div className={styles.step} title="Première étape : création de compte">
              <div className={styles.stepNumber}>1</div>
              <h3>Créez votre compte</h3>
              <p>Inscription rapide, accès immédiat à votre espace personnel.</p>
            </div>
            <div className={styles.step} title="Deuxième étape : personnalisation">
              <div className={styles.stepNumber}>2</div>
              <h3>Personnalisez votre invitation</h3>
              <p>Choisissez un thème, ajoutez photos, textes, programme.</p>
            </div>
            <div className={styles.step} title="Troisième étape : partage et suivi">
              <div className={styles.stepNumber}>3</div>
              <h3>Partagez et suivez</h3>
              <p>Envoi d'un lien ou QR code, consultation du nombre de réponses, relances intégrées.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonials}>
        <div className={styles.container}>
          <div className={styles.testimonialsGrid}>
            <div title="Témoignage de Julie & Thomas">
              <Card className={styles.testimonialCard}>
                <p className={styles.testimonialContent}>
                  « Nous avons adoré la simplicité et l'élégance du site. Tout le monde a complimenté notre invitation. »
                </p>
                <div className={styles.testimonialInfo}>
                  <h4>Julie & Thomas</h4>
                </div>
              </Card>
            </div>
            <div title="Témoignage de Sarah & Stephen">
              <Card className={styles.testimonialCard}>
                <p className={styles.testimonialContent}>
                  « Le compte à rebours et la FAQ intégrée ont vraiment aidé nos invités ! »
                </p>
                <div className={styles.testimonialInfo}>
                  <h4>Sarah & Stephen</h4>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Guest Info Section */}
      <section className={styles.guestInfo}>
        <div className={styles.container}>
          <div className={styles.guestInfoGrid}>
            <div className={styles.guestInfoCard} title="Informations centralisées">
              <h3>Tout en un endroit</h3>
              <p>Hébergement, transports, dress code, cadeaux</p>
            </div>
            <div className={styles.guestInfoCard} title="Assistance aux invités">
              <h3>Pensé pour vos invités</h3>
              <p>FAQ, carte, recommandations pratiques pour les accompagner.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <h2>Prêt à créer l'invitation parfaite ?</h2>
          <p>Commencez maintenant, et offrez à vos invités une expérience mémorable.</p>
          <Link href="/auth/register" title="Commencer à créer votre invitation gratuitement">
            <Button variant="primary" size="large">
              Créez gratuitement votre invitation
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
