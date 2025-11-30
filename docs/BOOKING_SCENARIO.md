# Scénario de Réservation Client-Provider

## 📋 Vue d'ensemble du flux

### État actuel
- ✅ Backend : Système de booking avec statuts (PENDING, CONFIRMED, CANCELLED, COMPLETED, DISPUTED)
- ✅ Provider : Page pour voir et gérer les réservations
- ❌ Client : Pas de page pour créer ou voir ses réservations
- ❌ Client : Le bouton "Demander un devis" redirige vers les messages au lieu de créer une réservation

## 🔄 Scénario complet proposé

### 1. **Découverte du service (Client)**
```
Client → /client/providers/all
      → /client/providers/[id]
      → Voir les services disponibles
      → Intéressé par un service
```

### 2. **Contact initial (Client) - OBLIGATOIRE AVANT RÉSERVATION**
```
Client → Cliquer sur "Contacter" ou "Demander un devis"
      → /client/providers/[id]/messages
      → Ouvrir une conversation avec le provider
      → Envoyer un message initial :
        - Présentation du projet
        - Date souhaitée
        - Type d'événement
        - Nombre d'invités
        - Budget approximatif
        - Questions spécifiques
```

### 3. **Discussion et négociation (Client ↔ Provider)**
```
Provider → Reçoit notification de nouveau message
         → /provider/messages ou /provider/bookings
         → Répond au client :
           - Confirme disponibilité
           - Propose un devis personnalisé
           - Négocie les détails
           - Répond aux questions
         
Client → Reçoit réponse
       → Continue la discussion
       → Finalise les détails
       → Se met d'accord sur :
         - Date et heure
         - Prix final
         - Conditions
         - Spécifications
```

### 4. **Création de la réservation (Client) - APRÈS ACCORD**
```
Client → Dans la conversation, bouton "Créer la réservation"
      → OU directement depuis /client/providers/[id]/book/[serviceId]
      → Formulaire pré-rempli avec les infos de la conversation :
        - Date de l'événement (depuis discussion)
        - Heure (depuis discussion)
        - Type d'événement (depuis discussion)
        - Nombre d'invités (depuis discussion)
        - Prix (validé dans la discussion)
        - Message/Spécifications (depuis discussion)
      → Validation et création → Statut: PENDING
      → La réservation est liée à la conversation
```

### 5. **Notification au Provider**
```
Provider → Reçoit une notification
         → Voir dans /provider/bookings (nouvelle réservation en haut)
         → Badge "Nouveau" sur les réservations PENDING
```

### 6. **Réponse du Provider**
```
Provider → /provider/bookings
        → Voir les détails de la réservation
        → Voir l'historique de la conversation liée
        → Actions possibles :
          - ✅ Confirmer → Statut: CONFIRMED
            → Notification au client
            → Message automatique dans la conversation
          - ❌ Refuser → Statut: CANCELLED (avec raison optionnelle)
            → Notification au client
            → Message automatique dans la conversation
          - 💬 Contacter le client (ouvrir chat)
            → Continuer la discussion si besoin de clarifications
```

### 7. **Notification au Client**
```
Client → Reçoit une notification
       → Voir dans /client/bookings
       → Statut mis à jour :
         - CONFIRMED → Réservation confirmée
         - CANCELLED → Réservation refusée
```

### 8. **Gestion post-confirmation**

#### Côté Provider :
- Marquer comme terminé après l'événement → Statut: COMPLETED
- Gérer les litiges si nécessaire → Statut: DISPUTED

#### Côté Client :
- Voir le statut de sa réservation
- Contacter le provider
- Annuler (si autorisé selon les conditions)
- Laisser un avis après COMPLETED

## 📱 Pages à créer/modifier

### Client
1. **`/client/providers/[id]/messages`** (NOUVEAU - PRIORITAIRE)
   - Interface de messagerie avec le provider
   - Créer une nouvelle conversation ou continuer une existante
   - Chat en temps réel
   - Bouton "Créer la réservation" (apparaît après discussion)

2. **`/client/providers/[id]/book/[serviceId]`** (NOUVEAU)
   - Formulaire de réservation
   - Pré-rempli avec les infos de la conversation (si existe)
   - Récapitulatif du service
   - Validation et création
   - Lien vers la conversation

3. **`/client/bookings`** (NOUVEAU)
   - Liste des réservations du client
   - Filtres par statut
   - Détails de chaque réservation
   - Lien vers la conversation avec le provider
   - Actions possibles (annuler, contacter)

4. **`/client/providers/[id]`** (MODIFIER)
   - Garder "Contacter" comme action principale
   - Ajouter "Réserver" (mais désactivé si pas de conversation)
   - Indicateur visuel : "Contactez d'abord le provider"

### Provider
1. **`/provider/messages`** (NOUVEAU - PRIORITAIRE)
   - Liste des conversations avec les clients
   - Chat en temps réel
   - Voir les demandes de réservation en attente
   - Bouton "Créer une réservation" depuis la conversation

2. **`/provider/bookings`** (DÉJÀ EXISTANTE - AMÉLIORER)
   - ✅ Ajouter badge "Nouveau" pour les PENDING récents
   - ✅ Améliorer l'affichage des détails
   - ✅ Lien vers la conversation avec le client
   - ✅ Voir l'historique de discussion avant réservation

3. **`/provider/bookings/[id]`** (NOUVEAU - OPTIONNEL)
   - Page de détail d'une réservation
   - Historique des changements
   - Chat intégré avec le client
   - Toutes les informations de la conversation

## 🔔 Notifications

### Client
- Nouvelle réservation créée → Confirmation
- Réservation confirmée par le provider
- Réservation refusée par le provider
- Message du provider

### Provider
- Nouvelle demande de réservation
- Message du client
- Rappel pour les réservations à venir (24h avant)

## 📊 Statuts et transitions

```
PENDING (Créé par le client)
  ↓
  ├─→ CONFIRMED (Provider confirme)
  │     ↓
  │     └─→ COMPLETED (Provider marque comme terminé)
  │
  └─→ CANCELLED (Provider refuse ou Client annule)
  
CONFIRMED
  ↓
  └─→ DISPUTED (En cas de problème)
```

## 💡 Améliorations UX

### Pour le Client
- **Réservation rapide** : Formulaire simple et intuitif
- **Suivi en temps réel** : Voir l'état de sa demande
- **Communication facilitée** : Chat intégré avec le provider
- **Rappels** : Notifications pour les événements à venir

### Pour le Provider
- **Vue d'ensemble** : Dashboard avec toutes les réservations
- **Actions rapides** : Boutons pour confirmer/refuser rapidement
- **Gestion du calendrier** : Voir les réservations par date
- **Statistiques** : Revenus, taux de confirmation, etc.

## 🎯 Priorités d'implémentation

### Phase 1 (Essentiel - Contact d'abord)
1. ✅ **Système de messagerie client-provider**
   - Page `/client/providers/[id]/messages`
   - Page `/provider/messages`
   - Backend : Conversations client-provider (séparées des conversations admin)
   - WebSocket pour chat en temps réel

2. ✅ **Page de création de réservation client**
   - Accessible depuis la conversation
   - Pré-remplie avec les infos discutées

3. ✅ **Page de visualisation des réservations client**
   - Avec lien vers la conversation

4. ✅ **Amélioration de la page provider/bookings**
   - Lien vers la conversation
   - Historique de discussion

### Phase 2 (Amélioration)
1. Notifications en temps réel
2. Chat intégré
3. Calendrier des réservations
4. Système d'avis après réservation

### Phase 3 (Avancé)
1. Système de paiement intégré
2. Gestion des disponibilités
3. Réservations récurrentes
4. Export des données

## 🔐 Règles métier

1. **Contact obligatoire** : 
   - Le client DOIT avoir une conversation active avec le provider avant de réserver
   - Exception : Réservation directe possible si le provider a activé "Réservation instantanée"

2. **Création** : 
   - Seul le client peut créer une réservation
   - La réservation est liée à une conversation existante
   - Les détails de la conversation sont utilisés pour pré-remplir le formulaire

3. **Confirmation** : 
   - Seul le provider peut confirmer/refuser
   - Notification automatique dans la conversation

4. **Annulation** :
   - Client peut annuler si PENDING (avec notification au provider)
   - Provider peut annuler à tout moment (avec notification au client)
   - Annulation automatiquement visible dans la conversation

5. **Modification** : 
   - Possible uniquement si PENDING
   - Doit passer par la conversation pour négocier les changements

6. **Avis** : 
   - Possible uniquement si COMPLETED
   - Peut être laissé depuis la page de réservation ou la conversation

## 📝 Données nécessaires

### Pour créer une conversation client-provider
- `clientId` (depuis auth)
- `providerId` (depuis l'URL)
- `serviceId` (optionnel - si discussion autour d'un service spécifique)
- `initialMessage` (premier message du client)
- `subject` (sujet de la conversation, ex: "Demande de devis - Mariage")

### Pour créer une réservation
- `clientId` (depuis auth)
- `providerId` (depuis l'URL)
- `serviceId` (depuis l'URL)
- `conversationId` (ID de la conversation liée - REQUIS)
- `eventDate` (requis)
- `eventTime` (optionnel)
- `eventType` (requis)
- `guestCount` (optionnel)
- `message` (optionnel - peut être copié depuis la conversation)
- `totalPrice` (validé dans la conversation ou calculé depuis le service)
- `clientName`, `clientEmail`, `clientPhone` (depuis le profil)

### Pour afficher une réservation
- Toutes les données de création
- `conversationId` (lien vers la conversation)
- Statut actuel
- Dates de confirmation/annulation/completion
- Informations du service et du provider
- Historique complet de la conversation
- Messages automatiques (création, confirmation, annulation, etc.)

## 💬 Structure de conversation

### Types de conversations
1. **Conversation client-provider** (nouveau type)
   - `type: 'CLIENT_PROVIDER'`
   - `clientId` + `providerId`
   - `serviceId` (optionnel)
   - Peut être liée à une réservation

2. **Conversation client-admin** (existant)
   - `type: 'CLIENT_ADMIN'`
   - `clientId` + `adminId`
   - `invitationId`

### Messages automatiques
- "Réservation créée" (quand le client crée une réservation)
- "Réservation confirmée" (quand le provider confirme)
- "Réservation refusée" (quand le provider refuse)
- "Réservation annulée" (quand quelqu'un annule)
- "Réservation terminée" (quand le provider marque comme completed)

