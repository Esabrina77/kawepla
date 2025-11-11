'use client';

import React from 'react';
import { 
  Mail, Users, CheckCircle, Camera, Building2, 
  Bell, Smartphone, BarChart3, Star, Rocket, 
  Zap, Check, Crown, Heart, Shield, HelpCircle,
  ArrowRight, Clock, X, AlertTriangle
} from "lucide-react";

import Image from 'next/image';
import { SITE_CONFIG } from '@/config/siteConfig';
import styles from './page.module.css';

export default function HomePage() {
  // Fonctionnalités différenciantes (les 3 principales)
  const keyFeatures = [
    {
      icon: <Mail className="w-8 h-8" />,
      title: "Invitations élégantes",
      description: "Créez des invitations personnalisées en quelques minutes",
      benefit: "Gagnez des heures de création"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Gestion automatique",
      description: "Suivez les réponses et préférences en temps réel",
      benefit: "Fini les relances manuelles"
    },
    {
      icon: <Camera className="w-8 h-8" />,
      title: "Tout centralisé",
      description: "Invitations, photos, messages, prestataires en un seul endroit",
      benefit: "Organisation simplifiée"
    }
  ];

  // Autres fonctionnalités (moins mises en avant)
  const otherFeatures = [
    { icon: <CheckCircle />, title: "Réponses automatiques", description: "Formulaire sécurisé avec confirmation instantanée" },
    { icon: <Building2 />, title: "Réseau de prestataires", description: "Trouvez et réservez directement sur la plateforme" },
    { icon: <Bell />, title: "Notifications temps réel", description: "Restez informé de chaque réponse" },
    { icon: <Smartphone />, title: "Application mobile", description: "Gérez depuis n'importe où" },
    { icon: <BarChart3 />, title: "Statistiques détaillées", description: "Tableau de bord complet avec analytics" }
  ];

  // Plans tarifaires (simplifiés)
  const realPlans = [
    {
      name: SITE_CONFIG.plans.decouverte.nom,
      price: SITE_CONFIG.plans.decouverte.prix,
      period: SITE_CONFIG.plans.decouverte.periode,
      description: SITE_CONFIG.plans.decouverte.description,
      badge: SITE_CONFIG.plans.decouverte.badge,
      current: true,
      features: SITE_CONFIG.plans.decouverte.features.slice(0, 4),
      colorClass: 'decouverte'
    },
    {
      name: SITE_CONFIG.plans.elegant.nom,
      price: SITE_CONFIG.plans.elegant.prix,
      period: SITE_CONFIG.plans.elegant.periode,
      description: SITE_CONFIG.plans.elegant.description,
      badge: SITE_CONFIG.plans.elegant.badge,
      popular: true,
      features: SITE_CONFIG.plans.elegant.features.slice(0, 4),
      colorClass: 'elegant'
    },
    {
      name: SITE_CONFIG.plans.premium.nom,
      price: SITE_CONFIG.plans.premium.prix,
      period: SITE_CONFIG.plans.premium.periode,
      description: SITE_CONFIG.plans.premium.description,
      features: SITE_CONFIG.plans.premium.features.slice(0, 4),
      colorClass: 'premium'
    }
  ];

  const testimonials = [
    {
      name: "Claire & Antoine",
      text: "Kawepla a révolutionné notre organisation ! Tout centralisé, nos invités ont adoré la simplicité.",
      rating: 5,
      location: "Mariage à Lyon",
      photo: "/images/testimonials/claire-antoine.jpg",
      guests: 120
    },
    {
      name: "Marie & Jean",
      text: "La plateforme est incroyable ! Nous avons trouvé nos prestataires directement et géré tous nos invités.",
      rating: 5,
      location: "Anniversaire à Paris",
      photo: "/images/testimonials/marie-jean.jpg",
      guests: 85
    },
    {
      name: "Emma & Lucas",
      text: "Le tableau de bord est parfait pour suivre tout en temps réel. Plus de 200 invitations, 95% de réponses.",
      rating: 5,
      location: "Événement corporatif",
      photo: "/images/testimonials/emma-lucas.jpg",
      guests: 200
    }
  ];

  const faqs = SITE_CONFIG.faq.slice(0, 4);

  // Structured Data JSON-LD pour le SEO
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Kawepla",
    "url": "https://kawepla.kaporelo.com",
    "logo": "https://kawepla.kaporelo.com/images/logo.png",
    "description": SITE_CONFIG.seo.description,
    "sameAs": [],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "kawepla.kaporelo@gmail.com",
      "contactType": "customer service",
      "availableLanguage": "French"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Kawepla",
    "url": "https://kawepla.kaporelo.com",
    "description": SITE_CONFIG.seo.description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://kawepla.kaporelo.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Kawepla",
    "applicationCategory": "EventManagementApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "82"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.reponse
      }
    }))
  };

  return (
    <div className={styles.page}>
      {/* Structured Data pour le SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* ============================================
          1. HERO - Titre accrocheur + CTA visible
          ============================================ */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Organisez vos événements
              <br />
              <span className={styles.heroTitleAccent}>sans stress</span>
            </h1>
            
            <p className={styles.heroSubtitle}>
              La plateforme tout-en-un pour créer vos invitations, gérer vos invités et partager vos moments.
            </p>

            <div className={styles.heroCTA}>
              <a href="/auth/login" className={styles.ctaPrimary}>
                <Rocket className={styles.ctaIcon} />
                Essayez gratuitement
              </a>
              <a href="#comment-ca-marche" className={styles.ctaSecondary}>
                Voir comment ça marche
                <ArrowRight className={styles.arrowIcon} />
              </a>
            </div>

            <div className={styles.heroTrust}>
              <Shield className={styles.trustIcon} />
              <span>82 organisateurs nous font confiance</span>
            </div>
          </div>

          {/* Image de l'application */}
          <div className={styles.heroVisual}>
            <div className={styles.appImageWrapper}>
              <Image
                src="/images/app-pic.png"
                alt="Interface Kawepla - Application de gestion d'événements"
                width={400}
                height={600}
                className={styles.appImage}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          2. SOLUTION - Toutes les fonctionnalités ensemble
          ============================================ */}
      <section id="comment-ca-marche" className={styles.solutionSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Une solution <span className={styles.sectionTitleAccent}>tout-en-un</span>
            </h2>
            <p className={styles.sectionDescription}>
              Créez vos invitations, gérez vos invités, partagez vos photos et trouvez vos prestataires en un seul endroit.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {keyFeatures.map((feature, index) => (
              <div 
                key={index} 
                className={`${styles.solutionCard} ${styles.animateCard}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={styles.solutionIcon}>{feature.icon}</div>
                <h3 className={styles.solutionTitle}>{feature.title}</h3>
                <p className={styles.solutionDescription}>{feature.description}</p>
                <div className={styles.solutionBenefit}>{feature.benefit}</div>
              </div>
            ))}
            {otherFeatures.map((feature, index) => (
              <div 
                key={`other-${index}`} 
                className={`${styles.featureCard} ${styles.animateCard}`}
                style={{ animationDelay: `${(keyFeatures.length + index) * 0.1}s` }}
              >
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          4. PREUVES SOCIALES - Témoignages + Chiffres
          ============================================ */}
      <section className={styles.testimonialsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Ils nous font <span className={styles.sectionTitleAccent}>confiance</span>
            </h2>
            <p className={styles.sectionDescription}>
              82 organisateurs satisfaits à travers la France
            </p>
          </div>

          <div className={styles.testimonialsGrid}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className={styles.testimonialCard}>
                <div className={styles.testimonialHeader}>
                  <img 
                    src={testimonial.photo} 
                    alt={testimonial.name}
                    className={styles.testimonialPhoto}
                    onError={(e) => {
                      e.currentTarget.src = '/images/testimonials.png';
                    }}
                  />
                  <div className={styles.testimonialInfo}>
                    <div className={styles.testimonialName}>{testimonial.name}</div>
                    <div className={styles.testimonialLocation}>{testimonial.location}</div>
                  </div>
                </div>
                
                <div className={styles.testimonialRating}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className={styles.starIcon} />
                  ))}
                </div>
                
                <p className={styles.testimonialText}>"{testimonial.text}"</p>
                
                <div className={styles.testimonialStats}>
                  {testimonial.guests} invités
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          5. TARIFS - Simplifiés
          ============================================ */}
      <section className={styles.pricingSection} id="tarifs">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Des tarifs <span className={styles.sectionTitleAccent}>adaptés</span>
            </h2>
            <p className={styles.sectionDescription}>
              Commencez gratuitement, payez seulement quand vous êtes prêt
            </p>
          </div>

          <div className={styles.pricingGrid}>
            {realPlans.map((plan, index) => (
              <div key={index} className={`${styles.pricingCard} ${plan.popular ? styles.popular : ''} ${styles[plan.colorClass]}`}>
                {plan.popular && (
                  <div className={styles.popularBadge}>{plan.badge}</div>
                )}
                
                <div className={styles.pricingHeader}>
                  <h3 className={styles.pricingTitle}>{plan.name}</h3>
                  <div className={styles.pricingPrice}>
                    <span className={styles.price}>{plan.price}</span>
                    <span className={styles.period}>/{plan.period}</span>
                  </div>
                  <p className={styles.pricingDescription}>{plan.description}</p>
                </div>

                <ul className={styles.pricingFeatures}>
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className={styles.pricingFeature}>
                      <Check className={styles.checkIcon} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a 
                  href={plan.current ? "/auth/login" : "#"} 
                  className={`${styles.pricingButton} ${plan.current ? styles.buttonPrimary : styles.buttonSecondary}`}
                >
                  {plan.current ? "Commencer gratuitement" : "Choisir ce plan"}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          6. FAQ - Réassurance
          ============================================ */}
      <section className={styles.faqSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Questions <span className={styles.sectionTitleAccent}>fréquentes</span>
            </h2>
          </div>

          <div className={styles.faqGrid}>
            {faqs.map((faq, index) => (
              <div key={index} className={styles.faqCard}>
                <h3 className={styles.faqQuestion}>
                  <HelpCircle className={styles.faqIcon} />
                  {faq.question}
                </h3>
                <p className={styles.faqAnswer}>{faq.reponse}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          7. CTA FINAL - Simple et clair
          ============================================ */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>
              Prêt à organiser votre événement ?
            </h2>
            <p className={styles.ctaDescription}>
              Rejoignez les 82 organisateurs qui nous font confiance
            </p>
            <a href="/auth/login" className={styles.ctaButton}>
              <Rocket className={styles.ctaIcon} />
              Commencer gratuitement
            </a>
            <div className={styles.ctaTrust}>
              <Shield className={styles.trustIcon} />
              <span>Gratuit à vie • Sans engagement • Support inclus</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
