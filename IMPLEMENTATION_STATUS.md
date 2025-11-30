# Statut d'Implémentation - Nouvelle Logique Design

## ✅ Backend (wedding-back) - TERMINÉ

### 1. Migration Prisma ✅
- ✅ Migration créée : `20250116000000_simplify_design_schema/migration.sql`
- ✅ Ajout des champs : `userId`, `isTemplate`, `originalDesignId`, `thumbnail`, `previewImage`
- ✅ Ajout des champs dans `Invitation` : `customDesignId`, `customFabricData`, `customCanvasWidth`, `customCanvasHeight`
- ✅ Relations ajoutées : `Design` ↔ `User`, `Design` ↔ `Design` (personalizations)

### 2. Types TypeScript ✅
- ✅ `CreateDesignDto` simplifié (plus de template/styles/variables)
- ✅ `DesignResponse` mis à jour avec nouveaux champs
- ✅ Suppression des interfaces obsolètes (`TextMapping`, etc.)

### 3. Services ✅
- ✅ `designService.ts` mis à jour :
  - `createDesign()` accepte maintenant `userId` optionnel
  - `getDesignsByFilter()` utilise `isTemplate` au lieu de `category`
  - Nouvelles méthodes : `getTemplates()`, `getUserDesigns()`
  - `formatDesignResponse()` simplifié

### 4. Controllers & Routes ✅
- ✅ `designController.ts` mis à jour :
  - `getByFilter()` utilise nouveaux filtres
  - Nouvelles méthodes : `getTemplates()`, `getUserDesigns()`
  - `create()` gère automatiquement `userId` selon le rôle
- ✅ Routes ajoutées :
  - `GET /designs/templates` - Récupérer les modèles
  - `GET /designs/my-designs` - Récupérer les designs personnalisés de l'utilisateur
  - `POST /designs/personalize` - Créer un design personnalisé

---

## ✅ Frontend (wedding-front) - EN COURS

### 1. Types & Hooks ✅
- ✅ `CreateDesignData` simplifié dans `useDesigns.ts`
- ✅ `Design` type mis à jour dans `types/index.ts`
- ✅ `useDesigns` hook mis à jour :
  - Nouvelles méthodes : `fetchTemplates()`, `fetchUserDesigns()`, `createPersonalizedDesign()`

### 2. API Client ✅
- ✅ `designsApi.ts` mis à jour :
  - `getTemplates()` - Récupérer les modèles
  - `getUserDesigns()` - Récupérer les designs personnalisés
  - `createPersonalized()` - Créer un design personnalisé
  - `getByFilter()` utilise `isTemplate` au lieu de `category`

### 3. Composants Canva ✅
- ✅ **Toolbar** : Onglet "invitation" supprimé (plus de placeholders)
- ✅ **fabricToKaweplaAdapter** : Simplifié, plus de gestion de placeholders
- ✅ **create-canva page** : Mise à jour pour la nouvelle structure

### 4. Formulaire Modal ✅
- ✅ `InvitationEventFormModal` créé
- ✅ Collecte les données événement obligatoires :
  - `eventTitle` (obligatoire)
  - `eventDate` (obligatoire)
  - `eventTime` (optionnel)
  - `location` (obligatoire)
  - `eventType` (WEDDING, BIRTHDAY, etc.)
  - `customText`, `moreInfo`, `description` (optionnels)
- ✅ Validation des champs obligatoires
- ✅ Design moderne avec icônes

---

## 🚧 À FAIRE

### 1. Page Galerie de Modèles (`/designs`)
- [ ] Créer la page avec affichage des modèles
- [ ] Filtres par tags, prix
- [ ] Prévisualisation des modèles
- [ ] Sélection d'un modèle → redirection vers personnalisation

### 2. Page de Personnalisation (`/invitations/create`)
- [ ] Workflow complet :
  1. Sélection du modèle (si pas déjà sélectionné)
  2. Formulaire modal obligatoire (données événement)
  3. Création de l'`Invitation` en DRAFT
  4. Chargement du modèle dans le canvas
  5. Personnalisation libre
  6. Sauvegarde du design personnalisé
- [ ] Intégration avec `InvitationEventFormModal`
- [ ] Gestion de la création de `Design` personnalisé
- [ ] Lien avec l'`Invitation` via `customDesignId`

### 3. Services Backend - Invitation
- [ ] Mettre à jour `invitationService.ts` pour gérer `customDesignId`
- [ ] Créer route pour créer une invitation avec données événement

### 4. Tests & Validation
- [ ] Tester la création de modèles (super-admin)
- [ ] Tester la sélection de modèle
- [ ] Tester le formulaire modal
- [ ] Tester la personnalisation
- [ ] Tester la sauvegarde du design personnalisé
- [ ] Tester la réutilisation d'un design personnalisé

---

## 📝 Notes Importantes

1. **Migration Prisma** : La migration doit être appliquée avec `npx prisma migrate dev` ou `npx prisma db push`
2. **Compatibilité Legacy** : Les anciens designs avec `template/styles/variables` sont toujours supportés via les champs optionnels
3. **Workflow Client** : Le formulaire modal doit s'afficher AVANT l'accès au canvas
4. **Designs Personnalisés** : Créer un nouveau `Design` avec `isTemplate=false` permet la réutilisation

