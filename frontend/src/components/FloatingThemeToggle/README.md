# Système de Mode Sombre avec Icône Flottante

## 🎨 Fonctionnalités

### Mode Sombre
- **Basculement automatique** entre mode clair et sombre
- **Sauvegarde persistante** du thème dans localStorage
- **Détection automatique** des préférences système
- **Transitions fluides** entre les modes
- **Palette de couleurs adaptée** pour chaque mode

### Icône Flottante Déplaçable
- **Position déplaçable** par glisser-déposer
- **Sauvegarde automatique** de la position
- **Limitation aux zones visibles** de l'écran
- **Design responsive** (plus petit sur mobile)
- **Animations fluides** et effets hover
- **Accessibilité** avec focus et tooltips

## 🚀 Utilisation

### Composant Principal
```tsx
import { FloatingThemeToggle } from '@/components/FloatingThemeToggle';

// Dans votre layout principal
<FloatingThemeToggle />
```

### Hook useTheme
```tsx
import { useTheme } from '@/hooks/useTheme';

const { theme, isDark, toggleTheme, setTheme } = useTheme();
```

## 🎯 Variables CSS

### Mode Clair
```css
--bg-primary: #dedede;        /* Fond principal */
--bg-secondary: #f8f8f8;      /* Fond secondaire */
--bg-card: white;             /* Fond des cartes */
--text-primary: #1A1A1A;      /* Texte principal */
--text-secondary: #72706d;    /* Texte secondaire */
--border-color: #e5e5e5;      /* Couleurs de bordure */
```

### Mode Sombre
```css
--bg-primary: #1a1a1a;        /* Fond principal sombre */
--bg-secondary: #2a2a2a;      /* Fond secondaire sombre */
--bg-card: #333333;           /* Fond des cartes sombre */
--text-primary: #f5f5f5;      /* Texte principal clair */
--text-secondary: #cccccc;    /* Texte secondaire clair */
--border-color: #444444;      /* Bordures sombres */
```

## 📱 Responsive

- **Desktop** : Icône 56x56px
- **Mobile** : Icône 48x48px
- **Position** : Sauvegardée par appareil
- **Limites** : Respecte les dimensions de l'écran

## 🔧 Personnalisation

### Couleurs
Modifiez les variables CSS dans `globals.css` pour adapter les couleurs à votre design.

### Taille de l'icône
Ajustez les dimensions dans `FloatingThemeToggle.module.css` :
```css
.floatingIcon {
  width: 56px;  /* Taille desktop */
  height: 56px;
}

@media (max-width: 768px) {
  .floatingIcon {
    width: 48px;  /* Taille mobile */
    height: 48px;
  }
}
```

### Position par défaut
Modifiez la position initiale dans le composant :
```tsx
const [position, setPosition] = useState<Position>({ x: 20, y: 20 });
```

## 🎨 Test

Visitez `/test-theme` pour voir une démonstration complète du système.

## 📦 Dépendances

- `lucide-react` : Icônes Moon/Sun
- `localStorage` : Sauvegarde des préférences
- CSS Modules : Styles encapsulés
