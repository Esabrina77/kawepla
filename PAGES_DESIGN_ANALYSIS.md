# Analyse des Pages Design Existantes

## 📋 Pages Identifiées

### 1. `/super-admin/design/page.tsx` - **Gestion des Designs (Super-admin)**
**Rôle actuel :**
- Liste tous les designs (modèles + personnalisés)
- Permet de créer, modifier, supprimer, activer/désactiver des designs
- Affiche un aperçu avec `TemplateEngine` (ancien système)
- Filtres par catégorie, premium, statut actif/inactif
- Bouton "Créer un design" → `/super-admin/design/create` (ancien) ou `/super-admin/design/create-canva` (nouveau)

**Problèmes identifiés :**
- ❌ Utilise `design.category` (n'existe plus)
- ❌ Utilise `design.template`, `design.styles`, `design.variables` (obsolètes pour nouveaux designs)
- ❌ Utilise `design.isPremium` (remplacé par `priceType`)
- ❌ Affiche l'aperçu avec `TemplateEngine` (ne fonctionne pas pour les designs Canva)
- ❌ Filtres basés sur `category` (n'existe plus)

**Modifications nécessaires :**
- ✅ Utiliser `design.isTemplate` pour distinguer modèles vs personnalisés
- ✅ Utiliser `design.priceType` au lieu de `isPremium`
- ✅ Afficher `design.thumbnail` ou `design.previewImage` pour les designs Canva
- ✅ Pour les designs legacy, garder le rendu avec `TemplateEngine`
- ✅ Pour les designs Canva, afficher une image de prévisualisation ou un canvas statique
- ✅ Filtres par `isTemplate`, `priceType`, `isActive`
- ✅ Bouton "Créer avec Canva" → `/super-admin/design/create-canva`
- ✅ Bouton "Créer (Legacy)" → `/super-admin/design/create` (pour compatibilité)

---

### 2. `/client/design/page.tsx` - **Galerie de Designs (Client)**
**Rôle actuel :**
- Liste les designs disponibles pour les clients
- Permet de prévisualiser et choisir un design
- Redirige vers `/client/invitations?designId=...` ou `/client/design/[id]`
- Affiche un aperçu avec `TemplateEngine`

**Problèmes identifiés :**
- ❌ Utilise `design.category` (n'existe plus)
- ❌ Utilise `design.template`, `design.styles`, `design.variables` (obsolètes)
- ❌ Utilise `design.isPremium` (remplacé par `priceType`)
- ❌ Affiche l'aperçu avec `TemplateEngine` (ne fonctionne pas pour les designs Canva)
- ⚠️ **CONFLIT** : Cette page fait la même chose que `/designs` (nouvelle galerie créée)

**Modifications nécessaires :**
- ✅ **Option 1** : Remplacer cette page par `/designs` (recommandé)
- ✅ **Option 2** : Adapter cette page pour utiliser les nouveaux champs
- ✅ Utiliser `design.thumbnail` ou `design.previewImage` pour les designs Canva
- ✅ Filtrer uniquement les modèles (`isTemplate=true`)
- ✅ Rediriger vers `/invitations/create?designId=...` (nouveau workflow)
- ✅ Utiliser `design.priceType` au lieu de `isPremium`

---

### 3. `/client/design/[id]/page.tsx` - **Détail d'un Design (Client)**
**Rôle actuel :**
- Affiche le détail d'un design spécifique
- Permet de prévisualiser le design complet
- Bouton "Utiliser ce design" → `/client/invitations?designId=...`
- Affiche un aperçu avec `TemplateEngine`

**Problèmes identifiés :**
- ❌ Utilise `design.category` (n'existe plus)
- ❌ Utilise `design.template`, `design.styles`, `design.variables` (obsolètes)
- ❌ Utilise `design.isPremium` (remplacé par `priceType`)
- ❌ Affiche l'aperçu avec `TemplateEngine` (ne fonctionne pas pour les designs Canva)

**Modifications nécessaires :**
- ✅ Afficher `design.previewImage` ou un canvas statique pour les designs Canva
- ✅ Pour les designs legacy, garder le rendu avec `TemplateEngine`
- ✅ Utiliser `design.priceType` au lieu de `isPremium`
- ✅ Bouton "Utiliser ce design" → `/invitations/create?designId=...` (nouveau workflow)
- ✅ Afficher les tags au lieu de la catégorie

---

### 4. `/super-admin/invitations/[id]/design/page.tsx` - **Aperçu Design d'une Invitation (Super-admin)**
**Rôle actuel :**
- Affiche l'aperçu du design d'une invitation spécifique
- Utilise les données de l'invitation pour rendre le design
- Affiche le statut de l'invitation
- Utilise `TemplateEngine` pour le rendu

**Problèmes identifiés :**
- ❌ Utilise `invitation.design.template`, `styles`, `variables` (obsolètes)
- ❌ Ne gère pas `customDesignId` ou `customFabricData` (design personnalisé)
- ❌ Affiche uniquement avec `TemplateEngine` (ne fonctionne pas pour les designs Canva)

**Modifications nécessaires :**
- ✅ **Priorité 1** : Vérifier si l'invitation a un `customDesignId` ou `customFabricData`
  - Si `customDesignId` existe → charger le `Design` personnalisé
  - Sinon si `customFabricData` existe → utiliser ce JSON Fabric.js
  - Sinon → utiliser `invitation.design.fabricData` (modèle de base)
- ✅ Pour les designs Canva (`fabricData`), afficher un canvas statique ou une image
- ✅ Pour les designs legacy (`template/styles/variables`), garder le rendu avec `TemplateEngine`
- ✅ Afficher un indicateur si c'est un design personnalisé vs modèle

---

## 🎯 Plan d'Action

### Phase 1 : Pages Client (Priorité Haute)
1. **Remplacer `/client/design` par `/designs`** (nouvelle galerie)
   - ✅ Déjà créée : `/designs/page.tsx`
   - ⚠️ Supprimer ou rediriger `/client/design` vers `/designs`

2. **Adapter `/client/design/[id]`**
   - Afficher les designs Canva avec `previewImage` ou canvas statique
   - Rediriger vers `/invitations/create?designId=...`

### Phase 2 : Pages Super-admin (Priorité Moyenne)
3. **Adapter `/super-admin/design/page.tsx`**
   - Filtrer par `isTemplate` au lieu de `category`
   - Afficher `thumbnail`/`previewImage` pour les designs Canva
   - Garder le rendu `TemplateEngine` pour les designs legacy
   - Ajouter bouton "Créer avec Canva"

4. **Adapter `/super-admin/invitations/[id]/design/page.tsx`**
   - Gérer `customDesignId` et `customFabricData`
   - Afficher les designs Canva correctement
   - Indicateur design personnalisé vs modèle

### Phase 3 : Compatibilité Legacy (Priorité Basse)
5. **Maintenir la compatibilité**
   - Les designs legacy continuent de fonctionner avec `TemplateEngine`
   - Migration progressive vers le nouveau format si nécessaire

---

## 📝 Notes Importantes

1. **Conflit de Routes** :
   - `/client/design` et `/designs` font la même chose
   - **Recommandation** : Rediriger `/client/design` → `/designs`

2. **Rendu des Designs Canva** :
   - Les designs Canva utilisent `fabricData` (JSON Fabric.js)
   - Pour l'aperçu, utiliser `thumbnail` ou `previewImage`
   - Pour le rendu complet, il faudra un composant qui charge le canvas Fabric.js

3. **Designs Personnalisés** :
   - Les invitations peuvent avoir un `customDesignId` (réutilisable)
   - Ou un `customFabricData` (non réutilisable)
   - Toujours vérifier dans cet ordre

4. **Compatibilité Legacy** :
   - Les anciens designs avec `template/styles/variables` continuent de fonctionner
   - Identifier via `editorVersion === 'legacy'` ou absence de `fabricData`

---

## 🔧 Composants à Créer

1. **`DesignPreview.tsx`** : Composant qui affiche un design (Canva ou Legacy)
   - Détecte automatiquement le type de design
   - Affiche `thumbnail`/`previewImage` pour Canva
   - Utilise `TemplateEngine` pour Legacy

2. **`DesignCard.tsx`** : Carte réutilisable pour afficher un design
   - Affiche `thumbnail` ou aperçu
   - Badge `priceType`
   - Tags au lieu de catégorie

3. **`InvitationDesignRenderer.tsx`** : Rendu du design d'une invitation
   - Gère `customDesignId`, `customFabricData`, ou `design.fabricData`
   - Affiche canvas Fabric.js ou rendu Legacy

