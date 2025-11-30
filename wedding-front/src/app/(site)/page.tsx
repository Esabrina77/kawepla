'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  CheckCircle2,
  Star,
  Calendar,
  Users,
  Mail,
  Camera,
  Search,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { TrustPilotWidget } from '@/components/TrustPilot/TrustPilotWidget';
import styles from './page.module.css';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'host' | 'provider'>('host');

  return (
    <div className={styles.page}>

      {/* ============================================
          1. HERO SECTION - DUAL FOCUS
          ============================================ */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>✨</span>
              <span className={styles.badgeText}>La plateforme événementielle n°1 en France</span>
            </div>

            <h1 className={styles.heroTitle}>
              <span className={styles.gradientText}>Organisez</span> ou <span className={styles.gradientText}>Prestez</span>,<br />
              tout se passe ici.
            </h1>

            <p className={styles.heroSubtitle}>
              Kawepla connecte les organisateurs d'événements aux meilleurs prestataires.
              Que vous prépariez un mariage, un anniversaire ou un séminaire, ou que vous soyez un professionnel, nous avons les outils qu'il vous faut.
            </p>

            <div className={styles.heroActions}>
              <div className={styles.roleSelector}>
                <button
                  className={`${styles.roleBtn} ${activeTab === 'host' ? styles.active : ''}`}
                  onClick={() => setActiveTab('host')}
                >
                  Je suis Organisateur
                </button>
                <button
                  className={`${styles.roleBtn} ${activeTab === 'provider' ? styles.active : ''}`}
                  onClick={() => setActiveTab('provider')}
                >
                  Je suis Prestataire
                </button>
              </div>

              <div className={styles.ctaGroup}>
                {activeTab === 'host' ? (
                  <>
                    <Link href="/auth/register?role=host" className={styles.primaryBtn}>
                      Créer mon événement
                      <ArrowRight size={20} />
                    </Link>
                    <p className={styles.ctaNote}>Gratuit pour démarrer • Pas de CB requise</p>
                  </>
                ) : (
                  <>
                    <Link href="/auth/register?role=provider" className={styles.primaryBtn}>
                      Référencer mon activité
                      <ArrowRight size={20} />
                    </Link>
                    <p className={styles.ctaNote}>Boostez votre visibilité • 0% de commission au lancement</p>
                  </>
                )}
              </div>
            </div>

            <div className={styles.trustBar}>
              <div className={styles.trustItem}>
                <Star className={styles.trustIcon} size={16} fill="currentColor" />
                <span>4.9/5 sur Trustpilot</span>
              </div>
              <div className={styles.trustItem}>
                <Users className={styles.trustIcon} size={16} />
                <span>+2000 Événements créés</span>
              </div>
              <div className={styles.trustItem}>
                <ShieldCheck className={styles.trustIcon} size={16} />
                <span>Données sécurisées en France</span>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.visualCard}>
              <Image
                src={activeTab === 'host' ? "/images/hero-host.png" : "/images/hero-provider.png"}
                alt={activeTab === 'host' ? "Interface Organisateur" : "Interface Prestataire"}
                width={300}
                height={630}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          2. SEGMENTED VALUE PROPOSITION
          ============================================ */}
      <section className={styles.valueProp}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {activeTab === 'host'
                ? "Tout pour réussir votre événement"
                : "Développez votre activité événementielle"}
            </h2>
            <p className={styles.sectionSubtitle}>
              {activeTab === 'host'
                ? "Des outils professionnels, simples et gratuits pour gérer chaque étape."
                : "Une suite d'outils complète pour gérer vos clients et augmenter votre chiffre d'affaires."}
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {activeTab === 'host' ? (
              <>
                <div className={styles.featureCard}>
                  <div className={styles.featureIconBox}><Mail size={24} /></div>
                  <h3>Invitations Numériques</h3>
                  <p>Créez des invitations époustouflantes, envoyez-les par email ou lien, et suivez les ouvertures.</p>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.featureIconBox}><Users size={24} /></div>
                  <h3>Gestion des Invités</h3>
                  <p>Centralisez votre liste, gérez les +1, les régimes alimentaires et les groupes en un clic.</p>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.featureIconBox}><Camera size={24} /></div>
                  <h3>Albums Partagés</h3>
                  <p>Récupérez toutes les photos prises par vos invités dans une galerie privée et sécurisée.</p>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.featureIconBox}><Search size={24} /></div>
                  <h3>Recherche Prestataires</h3>
                  <p>Trouvez les meilleurs lieux, traiteurs et photographes vérifiés autour de vous.</p>
                </div>
              </>
            ) : (
              <>
                <div className={styles.featureCard}>
                  <div className={styles.featureIconBox}><Search size={24} /></div>
                  <h3>Visibilité Maximale</h3>
                  <p>Soyez visible auprès de milliers d'organisateurs qualifiés qui cherchent vos services.</p>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.featureIconBox}><Calendar size={24} /></div>
                  <h3>Gestion des Réservations</h3>
                  <p>Un calendrier intelligent pour gérer vos disponibilités et éviter les doubles réservations.</p>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.featureIconBox}><Briefcase size={24} /></div>
                  <h3>Vitrines Professionnelles</h3>
                  <p>Mettez en avant votre portfolio, vos avis et vos tarifs avec une page dédiée élégante.</p>
                </div>
                <div className={styles.featureCard}>
                  <div className={styles.featureIconBox}><TrendingUp size={24} /></div>
                  <h3>Outils Marketing</h3>
                  <p>Utilisez l'IA pour optimiser vos descriptions et attirer plus de clients.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ============================================
          3. EVENT TYPES / CATEGORIES CAROUSEL
          ============================================ */}
      <section className={styles.categoriesSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            {activeTab === 'host' ? "Pour tous vos moments importants" : "Rejoignez les meilleurs prestataires"}
          </h2>

          <div className={styles.categoryGrid}>
            {activeTab === 'host' ? (
              ['Mariage', 'Anniversaire', 'Baptême', 'Séminaire', 'Baby Shower', 'Soirée', 'Gala', 'Autre'].map((type) => (
                <div key={type} className={styles.categoryTag}>
                  {type}
                </div>
              ))
            ) : (
              ['Lieux de réception', 'Traiteurs', 'Photographes', 'DJ & Musique', 'Décoration', 'Beauté', 'Transport', 'Animation'].map((cat) => (
                <div key={cat} className={styles.categoryTag}>
                  {cat}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ============================================
          4. HOW IT WORKS
          ============================================ */}
      <section className={styles.howItWorks}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Comment ça marche ?</h2>

          <div className={styles.stepsContainer}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3>{activeTab === 'host' ? "Créez votre compte" : "Créez votre profil"}</h3>
              <p>{activeTab === 'host' ? "C'est gratuit et sans engagement." : "Remplissez vos informations et ajoutez vos photos."}</p>
            </div>
            <div className={styles.stepLine} />
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3>{activeTab === 'host' ? "Personnalisez" : "Soyez validé"}</h3>
              <p>{activeTab === 'host' ? "Configurez votre événement et vos invitations." : "Nous vérifions chaque prestataire pour garantir la qualité."}</p>
            </div>
            <div className={styles.stepLine} />
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3>{activeTab === 'host' ? "Invitez & Profitez" : "Recevez des demandes"}</h3>
              <p>{activeTab === 'host' ? "Envoyez vos invitations et suivez les réponses." : "Répondez aux clients et développez votre business."}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          5. SOCIAL PROOF & TESTIMONIALS
          ============================================ */}
      <section className={styles.testimonials}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Ils nous font confiance</h2>
          <div className={styles.testimonialGrid}>
            <div className={styles.testimonialCard}>
              <div className={styles.stars}>★★★★★</div>
              <p>"J'ai organisé mon mariage avec Kawepla. Les invités ont adoré l'invitation numérique et l'album partagé !"</p>
              <div className={styles.author}>- Sarah, Mariée 2024</div>
            </div>
            <div className={styles.testimonialCard}>
              <div className={styles.stars}>★★★★★</div>
              <p>"En tant que photographe, j'ai trouvé 3 nouveaux clients le premier mois. L'interface est super pro."</p>
              <div className={styles.author}>- Thomas, Photographe</div>
            </div>
            <div className={styles.testimonialCard}>
              <div className={styles.stars}>★★★★★</div>
              <p>"Simple, efficace et gratuit pour les petites fêtes. Je l'utilise pour tous les anniversaires de mes enfants."</p>
              <div className={styles.author}>- Julie, Maman organisée</div>
            </div>
          </div>
          <div className={styles.trustPilotWrapper}>
            <TrustPilotWidget />
          </div>
        </div>
      </section>

      {/* ============================================
          6. SEO FOOTER & FINAL CTA
          ============================================ */}
      <section className={styles.finalCta}>
        <div className={styles.container}>
          <h2>Prêt à commencer ?</h2>
          <p>Rejoignez la communauté Kawepla dès aujourd'hui.</p>
          <Link href={`/auth/register?role=${activeTab}`} className={styles.largeCtaBtn}>
            {activeTab === 'host' ? "Créer mon événement gratuitement" : "Inscrire mon entreprise"}
          </Link>
        </div>
      </section>


    </div>
  );
}
