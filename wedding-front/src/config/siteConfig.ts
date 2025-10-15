// Configuration centralisée du site Kawepla
// Modifiez ces valeurs pour mettre à jour tout le site

export const SITE_CONFIG = {
  // === STATISTIQUES SITE ===
  stats: {
    organisateursSatisfaits: "210+",
    invitationsEnvoyees: "3,000+",
    tauxReponse: "92%",
    economiesMoyennes: "200€"
  },

  // === TEXTE HERO ===
  hero: {
    badge: "Rejoignez 210 organisateurs heureux",
    titre: "Organisez votre événement de rêve en 10 minutes",
    description: "Plus jamais de stress avec vos invitations ! Créez des invitations numériques élégantes, gérez vos invités et suivez les réponses en temps réel.",
    economieHighlight: "Économisez +200€ en moyenne vs les invitations papier."
  },

  // === TÉMOIGNAGES ===
  testimonials: {
    titre: "Ils nous font confiance",
    sousTitre: "Plus de 210 organisateurs satisfaits à travers la France",
    cta: "Rejoignez 210 organisateurs qui ont dit OUI à Kawepla"
  },

  // === ROI CALCULATOR ===
  roi: {
    organisationTraditionnelle: "2000€ - 3500€",
    avecKawepla: "69€",
    economies: "1931€ - 3431€",
    details: {
      invitationsPapier: "300€ - 800€",
      photographe: "800€ - 1500€",
      coordinateur: "500€ - 800€",
      prestataires: "400€ - 400€"
    }
  },

  // === PLANS DE PRICING ===
  plans: {
    decouverte: {
      nom: "Découverte",
      prix: "0€",
      periode: "Gratuit à vie",
      description: "Parfait pour tester",
      badge: "Version actuelle",
      features: [
        "1 invitation personnalisable",
        "Jusqu'à 30 invités",
        "Réponse de base",
        "Album photos (20 photos max)",
        "1 design standard",
        "Support communautaire"
      ],
      limits: {
        invitations: 1,
        guests: 30,
        photos: 20,
        designs: 1
      }
    },
    essentiel: {
      nom: "Essentiel",
      prix: "39€",
      periode: "pack",
      description: "Pour les petits événements",
      features: [
        "2 invitations personnalisables",
        "Jusqu'à 75 invités",
        "Réponse avec préférences alimentaires",
        "5 designs premium",
        "Albums photos (50 photos max)",
        "Support email"
      ],
      limits: {
        invitations: 2,
        guests: 75,
        photos: 50,
        designs: 5
      }
    },
    elegant: {
      nom: "Élégant",
      prix: "69€",
      periode: "pack",
      description: "Le plus populaire",
      badge: "PLUS POPULAIRE",
      features: [
        "3 invitations personnalisables",
        "Jusqu'à 150 invités",
        "Réponse complète + messages",
        "10 designs premium",
        "Albums photos (150 photos max)",
        "QR codes personnalisés",
        "Support prioritaire"
      ],
      limits: {
        invitations: 3,
        guests: 150,
        photos: 150,
        designs: 10
      }
    },
    premium: {
      nom: "Premium",
      prix: "99€",
      periode: "pack",
      description: "Pour les grands événements",
      features: [
        "5 invitations personnalisables",
        "Jusqu'à 300 invités",
        "Toutes les fonctionnalités de réponse",
        "Tous les designs premium",
        "Albums photos (500 photos max)",
        "Analytics détaillées",
        "Support prioritaire"
      ],
      limits: {
        invitations: 5,
        guests: 300,
        photos: 500,
        designs: 20
      }
    },
    luxe: {
      nom: "Luxe",
      prix: "149€",
      periode: "pack",
      description: "L'expérience ultime",
      features: [
        "10 invitations personnalisables",
        "Jusqu'à 500 invités",
        "Albums photos (1000 photos max)",
        "Tous les designs + personnalisations",
        "Accès bêta aux nouvelles fonctionnalités",
        "Support dédié"
      ],
      limits: {
        invitations: 10,
        guests: 500,
        photos: 1000,
        designs: 50
      }
    }
  },

  // === FONCTIONNALITÉS ===
  features: [
    {
      titre: "Invitations numériques élégantes",
      description: "Créez des invitations personnalisées avec des designs professionnels, prévisualisation en temps réel et gestion complète."
    },
    {
      titre: "Gestion complète des invités",
      description: "Import en masse, suivi des réponses, préférences alimentaires, gestion des accompagnants et badges prioritaires."
    },
    {
      titre: "Réponses automatiques intelligentes",
      description: "Formulaire sécurisé, confirmation automatique, gestion des restrictions alimentaires et messages personnalisés."
    },
    {
      titre: "Albums photos partagés",
      description: "Partagez vos moments avec modération automatique, galeries sécurisées et accès contrôlé pour vos invités."
    },

    {
      titre: "Réseau de prestataires",
      description: "Trouvez et réservez les meilleurs prestataires pour votre événement directement sur la plateforme."
    },
    {
      titre: "Notifications en temps réel",
      description: "Recevez des notifications push pour chaque réponse, message ou mise à jour de votre événement."
    },
    {
      titre: "Application mobile",
      description: "Application web progressive installable, fonctionnement hors ligne et interface optimisée mobile."
    },
    {
      titre: "Statistiques détaillées",
      description: "Tableau de bord complet avec analytics, taux de réponse et suivi en temps réel de votre événement."
    }
  ],

  // === FAQ ===
  faq: [
    {
      question: "Mes invités ne sont pas très technologiques, est-ce un problème ?",
      reponse: "Pas du tout ! Nos invitations sont conçues pour être accessibles à tous. Vos invités cliquent simplement sur un lien et répondent en 30 secondes, même sur téléphone."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      reponse: "Absolument. Vos données sont chiffrées et stockées de manière sécurisée. Nous respectons le RGPD et ne partageons jamais vos informations personnelles."
    },
    {
      question: "Puis-je modifier mon invitation après l'avoir envoyée ?",
      reponse: "Oui ! Vous pouvez modifier votre invitation à tout moment. Les changements sont automatiquement mis à jour pour tous vos invités."
    },
    {
      question: "Que se passe-t-il après mon événement ?",
      reponse: "Vos données restent accessibles pendant 1 an après votre événement. Vous pouvez télécharger toutes vos informations ou les supprimer définitivement."
    },
    {
      question: "Combien de temps faut-il pour créer une invitation ?",
      reponse: "En moyenne, nos utilisateurs créent leur première invitation en moins de 10 minutes ! Notre interface intuitive guide chaque étape."
    },
    {
      question: "Puis-je tester gratuitement avant de payer ?",
      reponse: "Bien sûr ! Notre plan Découverte est entièrement gratuit et vous permet de tester toutes les fonctionnalités principales sans limite de temps."
    }
  ],

  // === MÉTADONNÉES SEO ===
  seo: {
    titre: "Kawepla - Plateforme complète pour organiser vos événements",
    description: "Plus de 210 organisateurs nous font confiance ! Organisez tous vos événements avec Kawepla : invitations numériques, gestion des invités, albums photos, messagerie et prestataires. Gratuit à tester.",
    keywords: "organisation événement, plateforme événement, invitation événement, événement numérique, RSVP événement, gestion invités événement, invitation mariage, invitation anniversaire, invitation baptême, invitation communion, prestataires événement, album photos événement, messagerie événement, organisation événement complète"
  }
};

// Fonction utilitaire pour formater les nombres
export const formatNumber = (number: number): string => {
  return number.toLocaleString('fr-FR');
};

// Fonction pour obtenir les stats formatées
export const getStats = () => SITE_CONFIG.stats;

// Fonction pour obtenir les plans
export const getPlans = () => SITE_CONFIG.plans;

// Fonction pour obtenir les fonctionnalités
export const getFeatures = () => SITE_CONFIG.features;

// Fonction pour obtenir la FAQ
export const getFAQ = () => SITE_CONFIG.faq;
