# 📋 Inventaire Technique Exhaustif des Pages Implémentées (Kawepla)

> **Rapport Factualisé :** Analyse technique unitaire de chaque route d'interface Next.js (Frontend) basée sur les composants, états (`useState`) et flux codés, sans enrobage marketing.

---

## 👨‍💼 1. Espace Client (Organisateur / Hôte)

### 📂 Gestion & Facturation

#### 📍 `/client/billing`

- **Composant :** `BillingPage`
- **États Internes :** `userLimits`, `activePurchases`, `availablePlans`, `additionalServices`, `loading`, `upgrading`, `purchasingService`, `confirmModal`, `serviceModal`, `successModal`, `errorModal`
- **Fonctionnalités codées :**
  - Affichage du statut utilisateur actuel et des limites consommées/restantes.
  - Vue des forfaits disponibles (`availablePlans`) et des packs d’extensions (`additionalServices`).
  - Modaux de confirmation d’achats et de résolution de succès/échec de paiement.

#### 📍 `/client/billing/history`

- **Composant :** `PurchaseHistoryPage`
- **États Internes :** `purchaseHistory`, `loading`, `error`
- **Fonctionnalités codées :**
  - Historique tableur des achats cumulés avec icônes de succès (`CheckCircle`).
  - Somme du montant total dépensé.

---

### 📊 Tableau de Bord & Pilotage

#### 📍 `/client/dashboard`

- **Composant :** `DashboardPage`
- **États Internes :** `selectedInvitationId`, `limits`, `todosStats`
- **Fonctionnalités codées :**
  - Barre de progression d’avancement de l’événement général.
  - Statuts de quota invités et trigger d'invitations.

#### 📍 `/client/profile`

- **Composant :** `ProfilePage`
- **États Internes :** `formData`, `isSaving`, `showDeleteModal`, `isDeleting`
- **Fonctionnalités codées :**
  - Modification des informations personnels de l'Hôte.
  - Gestionnaires de Toggles de notifications actifs/passifs.
  - Zone de suppression de compte définitive sécurisée par modal de confirmation.

---

### 🖌️ Studio Design & Invitations

#### 📍 `/client/design`

- **Composant :** `DesignsGalleryPage`
- **États Internes :** `activeTab`, `importLoading`, `showImportBanner`, `templates`, `personalDesigns`, `favoriteIds`, `searchQuery`, `selectedTags`, `selectedPriceType`
- **Fonctionnalités codées :**
  - Onglets galeries divisés `Templates` globaux vs `PersonalDesigns`.
  - Recherche textuelle par mots clés ou tags de couleurs.
  - Mise en favoris de croquis.

#### 📍 `/client/design/editor`

- **Composant :** `ClientDesignEditorPage`
- **États Internes :** `name`, `canvas`, `loading`, `saving`, `showSaveDialog`, `currentDesign`
- **Appels API :** Enregistrement de blueprints JSON (`saveDesign`).
- **Fonctionnalités codées :** Éditeur Drag-and-drop (`Canvas`), panneau d'outils (`Toolbar`), barre de propriétés contextuelles, avertisseur de sauvegarde.

#### 📍 `/client/invitations`

- **Composant :** `InvitationsPage`
- **États Internes :** `limits`, `showCreateForm`, `formData`, `creating`
- **Fonctionnalités codées :**
  - Formulaire d’initialisation structuré (Type d'événement, Titre indispensable, Message personnalisé optionnel, Date/Heure, Lieu).
  - Grid de prévisualisation des cartons d'accès.

#### 📍 `/client/invitations/[id]/edit`

- **Composant :** `InvitationEditPage`
- **États Internes :** `invitation`, `formData`, `showDesignModal`
- **Fonctionnalités codées :** Modification des variables d'heures/lieux, pointage vers d'autres palettes graphiques pour mise à jour.

---

### 🧑‍🤝‍🧑 Centre de Gestion d’Invités

#### 📍 `/client/guests`

- **Composant :** `GuestsPage`
- **États Internes :** `formData`, `step`, `file`, `preview`, `shareableLink`, `searchQuery`, `rsvpFilter`, `typeFilter`, `showAddModal`, `showImportModal`, `showExportModal`, `notification`
- **Fonctionnalités codées :**
  - Formulaire d’ajout de fiche unitaire.
  - Module d'importation massive via tableur (`FileSpreadsheet`).
  - Génération et Copie directe d'un lien d’invitation public WhatsApp/Email.
  - Téléchargement d'export global des réponses en tableur local.

#### 📍 `/client/guests/scan`

- **Composant :** `ScanPage`
- **États Internes :** `selectedInvitation`, `scannerActive`, `scanResult`, `guestDetails`, `isValidating`, `scanError`
- **Fonctionnalités codées :**
  - Liaison caméra via composant `<Html5Qrcode>`.
  - Système d'évaluation de validité du billet instantané.

---

 

#### 📍 `/client/tools/planning`

- **Composant :** `PlanningPage`
- **États Internes :** `tasks`, `selectedCategory`, `searchTerm`, `currentDate`, `viewMode`, `showAIModal`, `isGeneratingChecklist`, `showGoogleCalendarModal`
- **Fonctionnalités codées :**
  - To-Do list fragmentée (Tâches à faire, en retard, complétées).
  - Bouton d’appel d’IA Gemini pour création de checklist par anticipation.
  - Liaison vers export de calendrier.

#### 📍 `/client/messages`

- **Composant :** `MessagesPage`
- **États Internes :** `searchQuery`, `selectedMessage`
- **Fonctionnalités codées :** Historique de lecture des commentaires de RSVP laissés par les convives.

---

## 🏢 2. Espace Prestataire (Providers)

#### 📍 `/provider/dashboard`

- **Composant :** `ProviderDashboard`
- **États Internes :** `stats` (Statistiques agrégées).
- **Fonctionnalités codées :** Compteurs de CA gagné, raccourcis d’ajout de service.

#### 📍 `/provider/profile`

- **Composant :** `ProviderProfilePage`
- **États Internes :** `formData`, `uploading`, `showDeleteModal`
- **Fonctionnalités codées :** Édition fiches sociales (Site web, Instagram, TikTok, Facebook).

#### 📍 `/provider/services`

- **Composant :** `ProviderServicesPage`
- **États Internes :** `deletingServiceId`, `serviceToDelete`
- **Fonctionnalités codées :** Vue des prestations déjà publiées sous forme de Grid.

#### 📍 `/provider/services/create`

- **Composant :** `CreateServicePage`
- **États Internes :** `formData`, `uploading`, `newInclusion`, `newRequirement`
- **Fonctionnalités codées :**
  - Saisie tarif (prix unique ou plage d'honoraires).
  - Ajouts d'Inclusions et Prérequis textuels.
  - Trigger d'IA pour optimisation de texte.

#### 📍 `/provider/bookings`

- **Composant :** `ProviderBookingsPage`
- **États Internes :** `bookings`, `selectedFilter`, `stats`
- **Fonctionnalités codées :** Filtrage de dossiers contrats selon le statut d’en-cours financiers.

---

## 👑 3. Espace Administration (Super-Admin)

#### 📍 `/super-admin/dashboard`

- **Composant :** `SuperAdminDashboard`
- **Fonctionnalités codées :** Jauges d’activité générale des transactions et volume d'inscriptions.

#### 📍 `/super-admin/design/create-canva`

- **Composant :** `CreateCanvaDesignPage`
- **États Internes :** `name`, `description`, `category`, `priceType`, `canvas`, `backgroundImage`
- **Fonctionnalités codées :** Atelier de création de designs d'usine destinés à la librairie globale de template.

#### 📍 `/super-admin/newsletters`

- **Composant :** `NewslettersPage`
- **États Internes :** `searchQuery`, `statusFilter`, ` audienceFilter`
- **Fonctionnalités codées :** Centraliseur de campagnes mailings prêtes à l’envoi.

#### 📍 `/super-admin/newsletters/create`

- **Composant :** `CreateNewsletterPage`
- **États Internes :** `formData`, `userSearch`, `selectedUsers`, `previewMode`, `isScheduled`
- **Fonctionnalités codées :** Éditeur de lettres d'informations HTML avec visualisation d'aperçu dynamique avant push.

#### 📍 `/super-admin/providers`

- **Composant :** `AdminProvidersPage`
- **États Internes :** `statusFilter`, `searchQuery`, `selectedProvider`
- **Fonctionnalités codées :** Vue filtrée de listings de profils Pro pour validation admin ou mise en litige.

---

## 💌 4. Parcours Publics & Invités

#### 📍 `/auth/login` & `/auth/register`

- **Fonctionnalités codées :**
  - Formulaire de connexion/Création avec Switch type d'utilisateur (Hôte vs Prestataire).
  - Moteur de mot de passe égaré et code OTP Nodemailer.

#### 📍 `/rsvp/[token]`

- **Composant :** `RSVPPage`
- **États Internes :** `invitation`, `rsvpStatus`, `step`, `formData`, `showSecurityModal`
- **Fonctionnalités codées :**
  - Rendu visuel `<EnvelopeWrapper>`.
  - Step 1 : Identification du visiteur & Photo.
  - Step 2 : Validation présence, triggers de formulaires additionnels enfants (+1) et commentaires allergies.

#### 📍 `/share-album/[id]`

- **Composant :** `ShareAlbumPage`
- **États Internes :** `album`, `uploading`, `uploadProgress`, `previews`
- **Fonctionnalités codées :**
  - Galerie collaborative accessible par simple lien.
  - Téléversement simultané d'images avec suivi de barre de progression.

---

## ⚙️ 5. Échanges Métiers Backend (Services Factuels)

- **`designService.ts` / `fabricToKaweplaAdapter.ts` :** Parseur de données Canva JSON vers styles responsives.
- **`aiController.ts` :** Routage de prompt vers Gemini pour extraction structurelle de To-Do listes.
- **`stripeService.ts` :** Dispatcher Webhooks Stripe Checkout sessions et liaison de plans tarifaires.
- **`photoAlbumService.ts` :** Prise en charge de la compression temps réel structure Sharp d’images.
- **`cleanupJobs.ts` :** Scripts cycliques de vidage de caches Firebase items abandonnés.

---

_Fin de l'Inventaire Factuel des Pages & Composants._
