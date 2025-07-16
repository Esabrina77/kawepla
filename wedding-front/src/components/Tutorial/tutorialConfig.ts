import { TutorialConfig } from '@/hooks/useTutorial';

export const mainTutorialConfig: TutorialConfig = {
  id: 'main-tutorial',
  title: 'Découverte de KaWePla',
  autoStart: false,
  showProgress: true,
  allowSkip: true,
  steps: [
    {
      id: 'welcome',
      title: 'Bienvenue sur KaWePla ! 🎉',
      description: 'Nous allons vous faire découvrir les principales fonctionnalités de votre espace personnel pour organiser votre mariage.',
      targetSelector: '.desktopMenu [href="/client/dashboard"]',
      position: 'bottom',
      showSkipButton: true,
      nextButtonText: 'Commencer la visite'
    },
    {
      id: 'dashboard',
      title: 'Tableau de bord',
      description: 'Voici votre tableau de bord principal où vous pouvez voir un aperçu de tous vos éléments de mariage.',
      targetSelector: '.desktopMenu [href="/client/dashboard"]',
      position: 'bottom'
    },
    {
      id: 'invitations',
      title: 'Invitations',
      description: 'Créez et gérez vos invitations de mariage. Vous pouvez choisir parmi différents designs et personnaliser vos messages.',
      targetSelector: '.desktopMenu [href="/client/invitations"]',
      position: 'bottom'
    },
    {
      id: 'guests',
      title: 'Invités',
      description: 'Gérez votre liste d\'invités, ajoutez leurs informations et suivez leurs réponses.',
      targetSelector: '.desktopMenu [href="/client/guests"]',
      position: 'bottom'
    },
    {
      id: 'design',
      title: 'Design',
      description: 'Explorez notre collection de designs pour vos invitations et autres éléments visuels.',
      targetSelector: '.desktopMenu [href="/client/design"]',
      position: 'bottom'
    },
    {
      id: 'messages',
      title: 'Messages',
      description: 'Communiquez avec vos invités et recevez leurs messages directement dans cette section.',
      targetSelector: '.desktopMenu [href="/client/messages"]',
      position: 'bottom'
    },
    {
      id: 'accessibility',
      title: 'Accessibilité',
      description: 'Ajustez les paramètres d\'accessibilité selon vos besoins : taille du texte, contraste, police.',
      targetSelector: '[data-tutorial="accessibility"]',
      position: 'left'
    },
    {
      id: 'settings',
      title: 'Paramètres',
      description: 'Gérez vos informations personnelles et les paramètres de votre compte.',
      targetSelector: '.desktopMenu [href="/client/settings"]',
      position: 'bottom'
    },
    {
      id: 'complete',
      title: 'Visite terminée ! ✨',
      description: 'Vous connaissez maintenant les principales fonctionnalités de KaWePla. Bon mariage !',
      targetSelector: '.desktopMenu [href="/client/dashboard"]',
      position: 'bottom',
      nextButtonText: 'Terminer'
    }
  ]
};

export const dashboardTutorialConfig: TutorialConfig = {
  id: 'dashboard-details',
  title: 'Découvrez votre tableau de bord',
  autoStart: false,
  showProgress: true,
  allowSkip: true,
  steps: [
    {
      id: 'stats-overview',
      title: 'Statistiques en temps réel',
      description: 'Ces cartes vous donnent un aperçu rapide : nombre d\'invitations envoyées, confirmations reçues, et taux de réponse. Elles se mettent à jour automatiquement.',
      targetSelector: '[data-tutorial="stats-cards"]',
      position: 'bottom',
    },
    {
      id: 'recent-activity',
      title: 'Activité récente',
      description: 'Ici, vous voyez les dernières réponses de vos invités et les actions importantes. C\'est pratique pour rester informé des nouveautés.',
      targetSelector: '[data-tutorial="recent-activity"]',
      position: 'top',
    },
    {
      id: 'quick-actions',
      title: 'Actions rapides',
      description: 'Ces boutons vous permettent d\'effectuer rapidement les actions les plus courantes : créer une invitation, ajouter un invité, consulter les réponses.',
      targetSelector: '[data-tutorial="quick-actions"]',
      position: 'top',
    },
  ],
};

export const invitationsTutorialConfig: TutorialConfig = {
  id: 'invitations-guide',
  title: 'Créer vos invitations',
  autoStart: false,
  showProgress: true,
  allowSkip: true,
  steps: [
    {
      id: 'create-invitation',
      title: 'Créer une nouvelle invitation',
      description: 'Cliquez sur ce bouton pour créer votre première invitation. Vous pourrez définir les détails de votre mariage : date, lieu, horaires, etc.',
      targetSelector: '[data-tutorial="create-invitation"]',
      position: 'bottom',
    },
    {
      id: 'invitation-list',
      title: 'Vos invitations',
      description: 'Toutes vos invitations apparaissent ici. Vous pouvez les modifier, les prévisualiser et générer des liens partageables pour vos invités.',
      targetSelector: '[data-tutorial="invitation-list"]',
      position: 'top',
    },
    {
      id: 'shareable-links',
      title: 'Liens partageables',
      description: 'Pour chaque invitation, vous pouvez générer des liens uniques à envoyer à vos invités. Ils pourront répondre directement sans créer de compte.',
      targetSelector: '[data-tutorial="shareable-links"]',
      position: 'left',
    },
  ],
};

export const guestsTutorialConfig: TutorialConfig = {
  id: 'guests-guide',
  title: 'Gérer vos invités',
  autoStart: false,
  showProgress: true,
  allowSkip: true,
  steps: [
    {
      id: 'welcome-guests',
      title: 'Bienvenue dans la gestion des invités ! 👥',
      description: 'Cette page vous permet de gérer tous vos invités, suivre leurs réponses RSVP et envoyer des invitations. Découvrons ensemble les principales fonctionnalités.',
      targetSelector: '[data-tutorial="subscription-limits"], [data-tutorial="guest-tabs"], .guestsPage',
      position: 'bottom',
      showSkipButton: true,
      nextButtonText: 'Découvrir',
    },
    {
      id: 'subscription-limits',
      title: 'Limites d\'abonnement',
      description: 'Cette section vous indique combien d\'invités vous pouvez ajouter selon votre abonnement. Vous pouvez voir vos limites actuelles et les utiliser.',
      targetSelector: '[data-tutorial="subscription-limits"]',
      position: 'bottom',
      showBackButton: true,
    },
    {
      id: 'guest-tabs',
      title: 'Onglets de gestion',
      description: 'Utilisez ces onglets pour naviguer entre la gestion des invités par email et par liens partageables. Chaque méthode a ses avantages.',
      targetSelector: '[data-tutorial="guest-tabs"]',
      position: 'bottom',
      showBackButton: true,
    },
    {
      id: 'add-guest',
      title: 'Ajouter un invité',
      description: 'Cliquez ici pour ajouter un nouvel invité. Vous pouvez saisir ses informations : nom, email, téléphone, préférences alimentaires, etc.',
      targetSelector: '[data-tutorial="add-guest"]',
      position: 'bottom',
      showBackButton: true,
    },
    {
      id: 'import-guests',
      title: 'Importer des invités',
      description: 'Pour gagner du temps, vous pouvez importer vos invités depuis un fichier CSV, JSON ou texte. Téléchargez le modèle pour voir le format.',
      targetSelector: '[data-tutorial="import-guests"]',
      position: 'left',
      showBackButton: true,
    },
    {
      id: 'guest-statistics',
      title: 'Statistiques des invités',
      description: 'Consultez ici un résumé de vos invités : nombre total, confirmations, refus, en attente. C\'est pratique pour suivre l\'avancement.',
      targetSelector: '[data-tutorial="guest-statistics"]',
      position: 'top',
      showBackButton: true,
    },
    {
      id: 'guests-list',
      title: 'Liste des invités',
      description: 'Tous vos invités apparaissent ici avec leur statut de réponse. Vous pouvez les modifier, les supprimer ou leur envoyer des invitations individuelles.',
      targetSelector: '[data-tutorial="guests-list"], .guestsGrid',
      position: 'top',
      showBackButton: true,
    },
    {
      id: 'shareable-links',
      title: 'Liens partageables',
      description: 'Changez d\'onglet pour découvrir les liens partageables. Générez des liens uniques à partager avec vos invités sur les réseaux sociaux !',
      targetSelector: '[data-tutorial="shareable-links"], [data-tutorial="guest-tabs"] button:last-child',
      position: 'top',
      showBackButton: true,
    },
    {
      id: 'completion-guests',
      title: 'Vous maîtrisez la gestion des invités ! 🎉',
      description: 'Parfait ! Vous savez maintenant comment ajouter, importer et gérer vos invités. N\'hésitez pas à explorer les différentes fonctionnalités.',
      targetSelector: '[data-tutorial="guest-tabs"], [data-tutorial="guests-list"], .guestsPage',
      position: 'bottom',
      showBackButton: true,
      nextButtonText: 'Commencer à gérer',
    },
  ],
  onComplete: () => {
    console.log('Tutoriel invités terminé !');
  },
  onSkip: () => {
    console.log('Tutoriel invités passé');
  },
}; 