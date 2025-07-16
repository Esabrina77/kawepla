# Système de Tutoriel Interactif

Ce système de tutoriel interactif permet de créer des guides d'onboarding personnalisés pour votre application Next.js/React.

## 🎯 Fonctionnalités

- **Surbrillance d'éléments** : Met en évidence les éléments de l'interface avec des effets visuels
- **Bulles d'explication** : Affiche des informations contextuelles avec des flèches directionnelles
- **Navigation étape par étape** : Boutons Précédent/Suivant pour naviguer dans le tutoriel
- **Persistance** : Mémorise si l'utilisateur a déjà vu le tutoriel
- **Accessibilité** : Support clavier (Échap pour quitter) et préférences de mouvement réduit
- **Responsive** : Adapté aux différentes tailles d'écran
- **Personnalisable** : Configuration flexible des étapes et comportements

## 🚀 Installation et Configuration

### 1. Composants principaux

```typescript
import { 
  TutorialGuide, 
  TutorialTrigger, 
  useTutorial,
  type TutorialConfig 
} from '@/components/Tutorial';
```

### 2. Configuration d'un tutoriel

```typescript
const myTutorialConfig: TutorialConfig = {
  id: 'my-tutorial',
  title: 'Mon Tutoriel',
  autoStart: true,
  showProgress: true,
  allowSkip: true,
  steps: [
    {
      id: 'step1',
      title: 'Étape 1',
      description: 'Description de l\'étape...',
      targetSelector: '[data-tutorial="element1"]',
      position: 'bottom',
      nextButtonText: 'Suivant'
    },
    // ... autres étapes
  ],
  onComplete: () => console.log('Tutoriel terminé'),
  onSkip: () => console.log('Tutoriel passé'),
};
```

### 3. Intégration dans un layout

```typescript
export default function MyLayout({ children }: { children: React.ReactNode }) {
  return (
    <TutorialGuide config={myTutorialConfig}>
      <div>
        {children}
      </div>
    </TutorialGuide>
  );
}
```

## 📋 Configuration des Étapes

### Propriétés d'une étape

```typescript
interface TutorialStep {
  id: string;                    // Identifiant unique
  title: string;                 // Titre de l'étape
  description: string;           // Description/instruction
  targetSelector: string;        // Sélecteur CSS de l'élément cible
  position: 'top' | 'bottom' | 'left' | 'right'; // Position de la bulle
  showSkipButton?: boolean;      // Afficher le bouton "Passer"
  showBackButton?: boolean;      // Afficher le bouton "Précédent"
  nextButtonText?: string;       // Texte du bouton suivant
  prevButtonText?: string;       // Texte du bouton précédent
  action?: () => void;           // Action à exécuter lors du passage à l'étape
}
```

### Attributs data-tutorial

Ajoutez des attributs `data-tutorial` aux éléments que vous voulez cibler :

```html
<button data-tutorial="create-invitation">
  Créer une invitation
</button>

<nav data-tutorial="navigation">
  <!-- Navigation -->
</nav>
```

## 🎨 Personnalisation des Styles

Les styles sont dans `Tutorial.module.css` et incluent :

- Variables CSS pour les couleurs et animations
- Support du mode sombre automatique
- Animations personnalisables
- Styles responsive

### Exemple de personnalisation

```css
/* Variables personnalisées */
:root {
  --tutorial-primary: #4F46E5;
  --tutorial-overlay: rgba(0, 0, 0, 0.7);
  --tutorial-border-radius: 16px;
}

/* Surbrillance personnalisée */
.spotlight {
  border-color: var(--tutorial-primary);
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.3);
}
```

## 🔧 Utilisation du Hook useTutorial

```typescript
const MyComponent = () => {
  const tutorial = useTutorial(myTutorialConfig);

  return (
    <div>
      <button onClick={tutorial.startTutorial}>
        Démarrer le tutoriel
      </button>
      
      <button onClick={tutorial.restartTutorial}>
        Redémarrer le tutoriel
      </button>
      
      {tutorial.hasSeen() && (
        <p>Vous avez déjà vu ce tutoriel</p>
      )}
    </div>
  );
};
```

## 💾 Persistance des Données

Le système utilise localStorage pour mémoriser les tutoriels vus :

```typescript
// Clé de stockage
const TUTORIAL_STORAGE_KEY = 'kawepla_tutorial_seen';

// Format des données
const seenTutorials = ['tutorial-1', 'tutorial-2'];
```

### Réinitialisation

```typescript
// Réinitialiser tous les tutoriels
localStorage.removeItem('kawepla_tutorial_seen');

// Réinitialiser un tutoriel spécifique
const restartSpecificTutorial = (tutorialId: string) => {
  const seen = localStorage.getItem('kawepla_tutorial_seen');
  if (seen) {
    const seenTutorials = JSON.parse(seen);
    const updated = seenTutorials.filter(id => id !== tutorialId);
    localStorage.setItem('kawepla_tutorial_seen', JSON.stringify(updated));
  }
};
```

## 🎯 Exemples d'Usage

### Tutoriel d'onboarding automatique

```typescript
const onboardingConfig: TutorialConfig = {
  id: 'onboarding',
  title: 'Bienvenue !',
  autoStart: true,  // Se lance automatiquement
  showProgress: true,
  allowSkip: true,
  steps: [
    {
      id: 'welcome',
      title: 'Bienvenue sur notre app !',
      description: 'Ce tutoriel vous guide...',
      targetSelector: '[data-tutorial="logo"]',
      position: 'bottom',
    },
    // ... autres étapes
  ],
};
```

### Tutoriel de fonctionnalité spécifique

```typescript
const featureTutorialConfig: TutorialConfig = {
  id: 'feature-tutorial',
  title: 'Nouvelle fonctionnalité',
  autoStart: false,  // Déclenché manuellement
  showProgress: true,
  allowSkip: false,  // Obligation de terminer
  steps: [
    // ... étapes
  ],
};
```

### Bouton de déclenchement

```typescript
const TutorialTrigger = () => {
  const tutorial = useTutorial(featureTutorialConfig);
  
  return (
    <button onClick={tutorial.startTutorial}>
      🎯 Découvrir cette fonctionnalité
    </button>
  );
};
```

## 📱 Responsive Design

Le système s'adapte automatiquement aux différentes tailles d'écran :

- **Desktop** : Bulles positionnées selon la configuration
- **Mobile** : Ajustement automatique des positions et tailles
- **Tablette** : Adaptation intermédiaire

## ♿ Accessibilité

- **Clavier** : Échap pour fermer, Tab pour naviguer
- **Préférences** : Respect de `prefers-reduced-motion`
- **Contraste** : Support du mode sombre
- **Sémantique** : Attributs ARIA appropriés

## 🔍 Débogage

### Composant de démonstration

```typescript
import { TutorialDemo } from '@/components/Tutorial/TutorialDemo';

// Ajouter dans votre page pour tester
<TutorialDemo />
```

### Logs de débogage

```typescript
const tutorialConfig: TutorialConfig = {
  // ... configuration
  onComplete: () => console.log('Tutoriel terminé'),
  onSkip: () => console.log('Tutoriel passé'),
  steps: [
    {
      // ... étape
      action: () => console.log('Action exécutée pour cette étape'),
    },
  ],
};
```

## 🚨 Bonnes Pratiques

1. **Sélecteurs stables** : Utilisez des attributs `data-tutorial` plutôt que des classes CSS
2. **Descriptions claires** : Écrivez des instructions simples et actionables
3. **Progression logique** : Organisez les étapes dans un ordre naturel
4. **Gestion des erreurs** : Vérifiez que les éléments cibles existent
5. **Performance** : Évitez trop d'étapes (max 8-10 recommandé)

## 🎨 Thèmes et Personnalisation

### Variables CSS disponibles

```css
:root {
  --tutorial-primary: #4F46E5;
  --tutorial-secondary: #7C3AED;
  --tutorial-overlay: rgba(0, 0, 0, 0.7);
  --tutorial-border-radius: 16px;
  --tutorial-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}
```

### Animations personnalisées

```css
.customPulse {
  animation: customPulse 2s infinite;
}

@keyframes customPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
```

## 🔄 Mises à jour et Maintenance

- **Versions** : Système de versioning pour les configurations
- **Migration** : Scripts pour migrer d'anciennes configurations
- **Analytics** : Intégration possible avec des outils d'analytics
- **A/B Testing** : Support pour tester différentes versions

## 📊 Métriques et Analytics

```typescript
const analyticsConfig: TutorialConfig = {
  // ... configuration
  onComplete: () => {
    // Envoyer métrique de completion
    analytics.track('tutorial_completed', { tutorial_id: 'onboarding' });
  },
  onSkip: () => {
    // Envoyer métrique de skip
    analytics.track('tutorial_skipped', { tutorial_id: 'onboarding' });
  },
};
```

---

Pour plus d'informations ou pour signaler des problèmes, consultez la documentation technique ou contactez l'équipe de développement. 