# Intégration de l'éditeur Canva dans Wedding-Front

## 📋 État actuel

La page `/super-admin/design/create-canva` a été créée mais nécessite l'intégration des composants de l'éditeur Canva.

## 🔧 Options d'intégration

### Option 1 : Copier les composants (Recommandé pour le développement rapide)

Copier les composants suivants depuis `canva/src/components/Editor/` vers `wedding-front/src/components/CanvaEditor/` :

```
canva/src/components/Editor/
├── Canvas.tsx → wedding-front/src/components/CanvaEditor/Canvas.tsx
├── Canvas.module.css → wedding-front/src/components/CanvaEditor/Canvas.module.css
├── Toolbar.tsx → wedding-front/src/components/CanvaEditor/Toolbar.tsx
├── Toolbar.module.css → wedding-front/src/components/CanvaEditor/Toolbar.module.css
├── PropertiesPanel.tsx → wedding-front/src/components/CanvaEditor/PropertiesPanel.tsx
├── PropertiesPanel.module.css → wedding-front/src/components/CanvaEditor/PropertiesPanel.module.css
├── ContextToolbar.tsx → wedding-front/src/components/CanvaEditor/ContextToolbar.tsx
├── ContextToolbar.module.css → wedding-front/src/components/CanvaEditor/ContextToolbar.module.css
├── Navbar.tsx → wedding-front/src/components/CanvaEditor/Navbar.tsx
└── Navbar.module.css → wedding-front/src/components/CanvaEditor/Navbar.module.css
```

**Aussi copier :**
- `canva/src/store/useEditorStore.ts` → `wedding-front/src/store/useEditorStore.ts`
- `canva/src/utils/fonts.ts` → `wedding-front/src/utils/fonts.ts` (si nécessaire)

### Option 2 : Créer un package partagé (Recommandé pour la production)

1. Créer un package `@kawepla/canva-editor` dans un dossier `packages/canva-editor/`
2. Déplacer les composants Canva dans ce package
3. Installer le package dans `wedding-front` et `canva`

### Option 3 : Utiliser des imports relatifs (Temporaire)

Modifier les imports dans `create-canva/page.tsx` pour pointer vers le projet `canva` :

```typescript
const Canvas = dynamic(() => import('../../../../canva/src/components/Editor/Canvas'), {
  ssr: false
});
```

⚠️ **Note** : Cette approche ne fonctionne que si les deux projets sont dans le même workspace.

## 📦 Dépendances nécessaires

Assurez-vous que `wedding-front` a les dépendances suivantes dans `package.json` :

```json
{
  "dependencies": {
    "fabric": "^6.9.0",
    "zustand": "^5.0.8",
    "lucide-react": "^0.555.0"
  },
  "devDependencies": {
    "@types/fabric": "^5.3.10"
  }
}
```

## 🔄 Modifications nécessaires dans les composants

### 1. Canvas.tsx

Ajouter une prop `onCanvasReady` pour exposer le canvas au parent :

```typescript
interface CanvasProps {
  onCanvasReady?: (canvas: fabric.Canvas) => void;
}

const Canvas = ({ onCanvasReady }: CanvasProps) => {
  // ... code existant ...
  
  useEffect(() => {
    if (canvas && onCanvasReady) {
      onCanvasReady(canvas);
    }
  }, [canvas, onCanvasReady]);
  
  // ... reste du code ...
};
```

### 2. Navbar.tsx

Modifier le bouton "Save to Kawepla" pour accepter une prop `onSave` au lieu d'utiliser le hook directement :

```typescript
interface NavbarProps {
  onSave?: () => void;
}

const Navbar = ({ onSave }: NavbarProps) => {
  // Remplacer handleSaveToKawepla pour appeler onSave
  const handleSaveToKawepla = () => {
    if (onSave) {
      onSave();
    } else {
      // Comportement par défaut
    }
  };
  // ...
};
```

## ✅ Checklist d'intégration

- [ ] Copier les composants Canva dans wedding-front
- [ ] Installer les dépendances nécessaires (fabric, zustand, lucide-react)
- [ ] Modifier Canvas.tsx pour exposer le canvas
- [ ] Modifier Navbar.tsx pour accepter onSave
- [ ] Tester la sauvegarde d'un design
- [ ] Tester le chargement d'un design existant
- [ ] Tester les uploads d'images vers Firebase

## 🚀 Utilisation

Une fois l'intégration terminée, accédez à :
- `/super-admin/design/create-canva` pour créer un nouveau design avec l'éditeur Canva

## 📝 Notes

- L'éditeur Canva utilise Fabric.js pour la manipulation du canvas
- Le store Zustand gère l'état de l'éditeur
- Les designs sont sauvegardés avec `fabricData` pour permettre la réédition complète
- Les variables d'invitation sont mappées automatiquement lors de la conversion

