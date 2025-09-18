'use client';

import React from 'react';
import { 
  Palette, Camera, Users, BarChart3, CheckCircle, ArrowRight, Star, Sparkles, 
  Mail, Smartphone, Heart, Crown, Check, MessageCircle, Phone, MapPin, Clock, 
  Facebook, Instagram, Twitter, HelpCircle, Shield, FileText, Settings, 
  Calendar, Gift, Music, Globe, Lock, Zap, Award, Users2, Share2, Bell, 
  TrendingUp, ShieldCheck, Clock4, Tablet, Monitor, X, AlertTriangle, 
  DollarSign, Timer, Target, Rocket, GiftIcon, CameraIcon, MessageSquare,
  ThumbsUp, Award as AwardIcon, Globe as GlobeIcon, Zap as ZapIcon, Calculator,
  Eye, Building2, UserCheck, Image, MessageSquare as MessageSquareIcon
} from "lucide-react";
import { PWAInstallButton } from '@/components/PWAInstallButton/PWAInstallButton';
import { GuaranteeBadge } from '@/components/GuaranteeBadge/GuaranteeBadge';
import { SITE_CONFIG } from '@/config/siteConfig';
import styles from './page.module.css';

export default function HomePage() {
  // Fonctionnalités basées sur le siteConfig avec icônes
  const featuresWithIcons = SITE_CONFIG.features.map((feature, index) => {
    const icons = [
      <Mail className="w-5 h-5" />,
      <Users className="w-5 h-5" />,
      <CheckCircle className="w-5 h-5" />,
      <Camera className="w-5 h-5" />,
      <MessageCircle className="w-5 h-5" />,
      <Building2 className="w-5 h-5" />,
      <Bell className="w-5 h-5" />,
      <Smartphone className="w-5 h-5" />,
      <BarChart3 className="w-5 h-5" />
    ];
    
    return {
      icon: icons[index] || <Star className="w-5 h-5" />,
      title: feature.titre,
      description: feature.description
    };
  });

  // Plans réels basés sur le backend StripeService
  const realPlans = [
    {
      name: SITE_CONFIG.plans.decouverte.nom,
      price: SITE_CONFIG.plans.decouverte.prix,
      originalPrice: null,
      period: SITE_CONFIG.plans.decouverte.periode,
      description: SITE_CONFIG.plans.decouverte.description,
      icon: <Heart style={{ width: '24px', height: '24px' }} />,
      badge: SITE_CONFIG.plans.decouverte.badge,
      current: true,
      popular: false,
      savings: null,
      features: SITE_CONFIG.plans.decouverte.features,
      limits: SITE_CONFIG.plans.decouverte.limits
    },
    {
      name: SITE_CONFIG.plans.essentiel.nom,
      price: SITE_CONFIG.plans.essentiel.prix,
      originalPrice: null,
      period: SITE_CONFIG.plans.essentiel.periode,
      description: SITE_CONFIG.plans.essentiel.description,
      icon: <Check style={{ width: '24px', height: '24px' }} />,
      badge: null,
      current: false,
      popular: false,
      savings: null,
      features: SITE_CONFIG.plans.essentiel.features,
      limits: SITE_CONFIG.plans.essentiel.limits
    },
    {
      name: SITE_CONFIG.plans.elegant.nom,
      price: SITE_CONFIG.plans.elegant.prix,
      originalPrice: null,
      period: SITE_CONFIG.plans.elegant.periode,
      description: SITE_CONFIG.plans.elegant.description,
      icon: <Star style={{ width: '24px', height: '24px' }} />,
      badge: SITE_CONFIG.plans.elegant.badge,
      current: false,
      popular: true,
      savings: null,
      features: SITE_CONFIG.plans.elegant.features,
      limits: SITE_CONFIG.plans.elegant.limits
    },
    {
      name: SITE_CONFIG.plans.premium.nom,
      price: SITE_CONFIG.plans.premium.prix,
      originalPrice: null,
      period: SITE_CONFIG.plans.premium.periode,
      description: SITE_CONFIG.plans.premium.description,
      icon: <Crown style={{ width: '24px', height: '24px' }} />,
      badge: null,
      current: false,
      popular: false,
      savings: null,
      features: SITE_CONFIG.plans.premium.features,
      limits: SITE_CONFIG.plans.premium.limits
    },
    {
      name: SITE_CONFIG.plans.luxe.nom,
      price: SITE_CONFIG.plans.luxe.prix,
      originalPrice: null,
      period: SITE_CONFIG.plans.luxe.periode,
      description: SITE_CONFIG.plans.luxe.description,
      icon: <Crown style={{ width: '24px', height: '24px' }} />,
      badge: null,
      current: false,
      popular: false,
      savings: null,
      features: SITE_CONFIG.plans.luxe.features,
      limits: SITE_CONFIG.plans.luxe.limits
    }
  ];

  const testimonials = [
    {
      name: "Claire & Antoine",
      text: "Kawepla a révolutionné notre organisation ! Invitations, réponses automatiques, photos, messages... Tout centralisé. Nos invités ont adoré la simplicité et nous avons économisé des heures de travail.",
      rating: 5,
      location: "Mariage à Lyon",
      photo: "/images/testimonials/claire-antoine.jpg",
      guests: 120,
      savings: "500€",
      eventType: "Mariage"
    },
    {
      name: "Marie & Jean",
      text: "La plateforme est incroyable ! Nous avons trouvé nos prestataires directement sur Kawepla, géré tous nos invités et partagé nos photos. Une solution complète qui nous a fait gagner un temps fou.",
      rating: 5,
      location: "Anniversaire à Paris",
      photo: "/images/testimonials/marie-jean.jpg",
      guests: 85,
      savings: "300€",
      eventType: "Anniversaire"
    },
    {
      name: "Emma & Lucas",
      text: "Le tableau de bord est parfait pour suivre tout en temps réel. Plus de 200 invitations envoyées, 95% de réponses. Magique !",
      rating: 5,
      location: "Événement corporatif à Bordeaux",
      photo: "/images/testimonials/emma-lucas.jpg",
      guests: 200,
      savings: "800€",
      eventType: "Événement corporatif"
    }
  ];

  const stats = [
    { number: SITE_CONFIG.stats.organisateursSatisfaits, label: "Organisateurs satisfaits", icon: <Heart /> },
    { number: SITE_CONFIG.stats.invitationsEnvoyees, label: "Invitations envoyées", icon: <Mail /> },
    { number: SITE_CONFIG.stats.tauxReponse, label: "Taux de réponse", icon: <CheckCircle /> },
    { number: SITE_CONFIG.stats.economiesMoyennes, label: "Économies moyennes", icon: <DollarSign /> }
  ];

  const problems = [
    {
      icon: <X className="w-8 h-8" />,
      title: "Outils éparpillés",
      description: "Invitations ici, photos là, messages ailleurs... Rien n'est centralisé"
    },
    {
      icon: <AlertTriangle className="w-8 h-8" />,
      title: "Perte de temps précieux",
      description: "Appels téléphoniques, relances, gestion manuelle de tout"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Coordination impossible",
      description: "Impossible de savoir qui vient, quand, avec qui, et où trouver les prestataires"
    }
  ];

  const solutions = [
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Plateforme tout-en-un",
      description: "Invitations, RSVP, photos, messages, prestataires... Tout centralisé"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Organisation simplifiée",
      description: "Interface intuitive, automatisation intelligente, gain de temps garanti"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Suivi en temps réel",
      description: "Tableau de bord complet, analytics détaillées, coordination parfaite"
    }
  ];

  const faqs = SITE_CONFIG.faq;

  return (
    <div className={styles.page}>
      {/* Hero Section Optimisé */}
      <section id="accueil" className={`section ${styles.heroSection}`}>
        <div className={styles.heroPattern}></div>
        
        <div className={`container text-center ${styles.heroContent}`}>
          <div className="mb-lg">
            <span className={`badge ${styles.badge}`}>
              <Sparkles style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              {SITE_CONFIG.hero.badge}
            </span>
          </div>
          
          <h1 className={`heading-hero mb-lg ${styles.heroTitle}`}>
            <span>Kawepla - La plateforme complète</span>
            <br />
            <span className={styles.heroTitleAccent}>pour organiser vos événements</span>
          </h1>
          
          <p className={`text-large mb-xl ${styles.heroDescription}`}>
            Invitations numériques, gestion des invités, albums photos, messagerie, prestataires... 
            <strong>Tout ce dont vous avez besoin pour un événement parfait en un seul endroit.</strong>
          </p>

          {/* Social Proof Immédiat */}
          <div className={`mb-xl ${styles.socialProof}`}>
            <div className={styles.statsRow}>
              {stats.map((stat, index) => (
                <div key={index} className={styles.statItem}>
                  <div className={styles.statIcon}>{stat.icon}</div>
                  <div className={styles.statNumber}>{stat.number}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={`flex flex-center gap-lg mb-xl ${styles.heroButtons}`}>
            <a href="/auth/login" className={`btn ${styles.ctaPrimary}`}>
              <Rocket style={{ marginRight: '8px', width: '20px', height: '20px' }} />
              Organiser mon événement gratuitement
            </a>
            <PWAInstallButton />
          </div>

          <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
            <img 
              src="/images/events.jpg"
              alt="Exemple d'invitation d'événement numérique Kawepla"
              className={styles.heroImage}
              onError={(e) => {
                e.currentTarget.src = '/images/hero.png';
              }}
            />
          </div>
        </div>
      </section>

      {/* Section Problème/Solution */}
      <section className={`section ${styles.problemSolutionSection}`}>
        <div className="container">
          <div className="text-center mb-xl">
            <h2 className={`heading-2 ${styles.sectionTitle}`}>
              Fini le <span className={styles.sectionTitleAccent}>stress</span> de l'organisation !
            </h2>
            <p className={`text-large ${styles.sectionDescription}`}>
              Découvrez comment Kawepla révolutionne l'organisation d'événements avec une solution tout-en-un
            </p>
          </div>

          <div className={`grid grid-2 ${styles.problemSolutionGrid}`}>
            <div className={styles.problemsColumn}>
              <h3 className={`heading-3 mb-lg ${styles.columnTitle}`}>
                <X className="w-6 h-6" style={{ marginRight: '8px' }} />
                Les problèmes traditionnels
              </h3>
              {problems.map((problem, index) => (
                <div key={index} className={styles.problemCard}>
                  <div className={styles.problemIcon}>
                    {problem.icon}
                  </div>
                  <div>
                    <h4 className={styles.problemTitle}>{problem.title}</h4>
                    <p className={styles.problemDescription}>{problem.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.solutionsColumn}>
              <h3 className={`heading-3 mb-lg ${styles.columnTitle}`}>
                <CheckCircle className="w-6 h-6" style={{ marginRight: '8px' }} />
                La solution Kawepla
              </h3>
              {solutions.map((solution, index) => (
                <div key={index} className={styles.solutionCard}>
                  <div className={styles.solutionIcon}>
                    {solution.icon}
                    </div>
                  <div>
                    <h4 className={styles.solutionTitle}>{solution.title}</h4>
                    <p className={styles.solutionDescription}>{solution.description}</p>
                  </div>
                </div>
              ))}
              </div>
          </div>
        </div>
      </section>
      
      {/* Types d'événements supportés */}
      <section className={`section ${styles.eventTypesSection}`}>
        <div className="container">
          <div className="text-center mb-xl">
            <h2 className={`heading-2 ${styles.sectionTitle}`}>
              Pour tous types d'<span className={styles.sectionTitleAccent}>événements</span>
            </h2>
            <p className={`text-large ${styles.sectionDescription}`}>
              Mariages, anniversaires, événements corporatifs... Kawepla s'adapte à vos besoins
            </p>
          </div>

          <div className="grid grid-3">
            {[
              {
                icon: <Heart className="w-12 h-12" />,
                title: "Mariages",
                description: "Le jour le plus important de votre vie mérite une organisation parfaite",
                features: ["Invitations élégantes", "Réponses détaillées", "Albums photos", "Coordination prestataires"]
              },
              {
                icon: <Gift className="w-12 h-12" />,
                title: "Anniversaires",
                description: "Célébrez vos moments spéciaux avec style et simplicité",
                features: ["Designs festifs", "Gestion VIP", "Photos partagées", "Messages personnalisés"]
              },
              {
                icon: <Building2 className="w-12 h-12" />,
                title: "Événements corporatifs",
                description: "Professionnalisme et efficacité pour vos événements d'entreprise",
                features: ["Interface professionnelle", "Statistiques détaillées", "Gestion de groupes", "Rapports automatiques"]
              }
            ].map((eventType, index) => (
              <div key={index} className={styles.eventTypeCard}>
                <div className={styles.eventTypeIcon}>
                  {eventType.icon}
                </div>
                <h3 className={`heading-3 ${styles.eventTypeTitle}`}>{eventType.title}</h3>
                <p className={`text-body ${styles.eventTypeDescription}`}>
                  {eventType.description}
                </p>
                <ul className={styles.eventTypeFeatures}>
                  {eventType.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className={styles.eventTypeFeature}>
                      <Check className={styles.checkIcon} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnalités - Version Minimaliste */}
      <section id="fonctionnalites" className={`section ${styles.featuresSection}`}>
        <div className="container">
          <div className="text-center mb-xl">
            <h2 className={`heading-2 ${styles.sectionTitle}`}>
              Tout ce dont vous avez besoin
            </h2>
            <p className={`text-large ${styles.sectionDescription}`}>
              Une plateforme complète pour organiser vos événements
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {featuresWithIcons.map((feature, index) => (
              <div key={index} className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  {feature.icon}
                </div>
                <div className={styles.featureContent}>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages avec photos */}
      <section id="témoignages" className={`section ${styles.testimonialsSection}`}>
        <div className="container">
          <div className="text-center mb-xl">
            <h2 className={`heading-2 ${styles.sectionTitle}`}>
              {SITE_CONFIG.testimonials.titre} <span className={styles.sectionTitleAccent}>confiance</span>
            </h2>
            <p className={`text-large ${styles.sectionDescription}`}>
              {SITE_CONFIG.testimonials.sousTitre}
            </p>
          </div>

          <div className="grid grid-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className={`card animate-fade-in-up ${styles.testimonialCard}`} style={{
                animationDelay: `${index * 0.2}s`
              }}>
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
                    <div className={styles.testimonialName}>
                      {testimonial.name}
                    </div>
                    <div className={styles.testimonialLocation}>
                      {testimonial.location}
                    </div>
                    <div className={styles.testimonialStats}>
                      <span>{testimonial.guests} invités</span>
                      <span>•</span>
                      <span>Économie: {testimonial.savings}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className={styles.starIcon} />
                  ))}
                </div>
                <p className={`text-body ${styles.testimonialText}`}>
                  "{testimonial.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Optimisé */}
      <section id="tarifs" className={`section ${styles.pricingSection}`}>
        <div className={styles.pricingBackground}></div>
        <div className={`container ${styles.pricingContent}`}>
          <div className="text-center mb-xl">
            <h2 className={`heading-2 ${styles.sectionTitle}`}>
              Des tarifs <span className={styles.sectionTitleAccent}>adaptés</span>
            </h2>
            <p className={`text-large ${styles.sectionDescription}`}>
              Commencez gratuitement, payez seulement quand vous êtes prêt
            </p>
          </div>

          <div className={`grid grid-5 ${styles.pricingGrid}`}>
            {realPlans.map((plan, index) => (
              <div key={index} className={`card animate-scale-in ${styles.pricingCard} ${plan.popular ? styles.popular : ''}`} style={{
                animationDelay: `${index * 0.1}s`
              }}>
                {plan.popular && (
                  <div className={styles.popularBadge}>
                    {plan.badge}
                  </div>
                )}
                
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
                  <div className={styles.pricingIcon}>
                    {plan.icon}
                  </div>
                  <h3 className={`heading-3 ${styles.pricingTitle}`}>{plan.name}</h3>
                  <div style={{ marginBottom: 'var(--space-sm)' }}>
                    <span className={styles.pricingPrice}>
                      {plan.price}
                    </span>
                    <span className={styles.pricingPeriod}>
                      /{plan.period}
                    </span>
                  </div>
                  <p className={`text-body ${styles.pricingDescription}`}>
                    {plan.description}
                  </p>
                </div>

                <div style={{ flex: 1 }}>
                  <ul className={styles.pricingFeatures}>
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className={styles.pricingFeature}>
                        <Check className={styles.checkIcon} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginTop: 'var(--space-lg)' }}>
                  <a 
                    href={plan.current ? "/auth/login" : "#"} 
                    className={`${plan.current ? "btn btn-primary" : "btn btn-outline"} ${styles.pricingButton}`}
                  >
                    {plan.current ? "Commencer gratuitement" : "Choisir ce plan"}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* ROI Calculator */}
          <div className={`card ${styles.roiCalculator}`}>
            <h3 className={`heading-3 text-center mb-lg ${styles.roiTitle}`}>
              <Calculator className="w-6 h-6" style={{ marginRight: '8px' }} />
              Calculez vos économies
            </h3>
            <div className={styles.roiContent}>
              <div className={styles.roiItem}>
                <span>Organisation traditionnelle complète:</span>
                <span className={styles.roiPrice}>{SITE_CONFIG.roi.organisationTraditionnelle}</span>
              </div>
              <div className={styles.roiSubItems}>
                <div className={styles.roiSubItem}>
                  <span>• Invitations papier + impression</span>
                  <span>{SITE_CONFIG.roi.details.invitationsPapier}</span>
                </div>
                <div className={styles.roiSubItem}>
                  <span>• Photographe pour album</span>
                  <span>{SITE_CONFIG.roi.details.photographe}</span>
                </div>
                <div className={styles.roiSubItem}>
                  <span>• Coordinateur événement</span>
                  <span>{SITE_CONFIG.roi.details.coordinateur}</span>
                </div>
                <div className={styles.roiSubItem}>
                  <span>• Recherche prestataires</span>
                  <span>{SITE_CONFIG.roi.details.prestataires}</span>
                </div>
              </div>
              <div className={styles.roiItem}>
                <span>Avec Kawepla (plan Élégant):</span>
                <span className={styles.roiPrice}>{SITE_CONFIG.roi.avecKawepla}</span>
              </div>
              <div className={styles.roiTotal}>
                <span>Économies totales:</span>
                <span className={styles.roiSavings}>{SITE_CONFIG.roi.economies}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Anti-objections */}
      <section id="faq" className={`section ${styles.faqSection}`}>
        <div className="container">
          <div className="text-center mb-xl">
            <h2 className={`heading-2 ${styles.sectionTitle}`}>
              Questions <span className={styles.sectionTitleAccent}>fréquentes</span>
            </h2>
            <p className={`text-large ${styles.sectionDescription}`}>
              Tout ce que vous devez savoir sur Kawepla
            </p>
          </div>

          <div className={`grid grid-2 ${styles.faqGrid}`}>
            {faqs.map((faq, index) => (
              <div key={index} className={`card animate-fade-in-up ${styles.faqCard}`} style={{
                animationDelay: `${index * 0.1}s`
              }}>
                <h3 className={`heading-3 ${styles.faqQuestion}`}>
                  {faq.question}
                </h3>
                <p className={`text-body ${styles.faqAnswer}`}>
                  {faq.reponse}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final Simple */}
      <section className={`section ${styles.ctaSection}`}>
        <div className={`container text-center ${styles.ctaContent}`}>
          <h2 className={`heading-2 mb-lg ${styles.ctaTitle}`}>
            Prêt à organiser votre événement ?
          </h2>
          <p className={`text-large mb-xl ${styles.ctaDescription}`}>
            Créez votre première invitation gratuitement
          </p>
          
          <div className={`flex flex-center gap-lg ${styles.ctaButtons}`}>
            <a href="/auth/login" className={`btn ${styles.ctaPrimaryButton}`}>
              <Rocket style={{ marginRight: '8px', width: '20px', height: '20px' }} />
              Commencer gratuitement
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}