# Stripe Connect Express - Guide Complet pour Kawepla

## 🎯 Qu'est-ce que Stripe Connect Express ?

Stripe Connect Express permet à **Kawepla** (la plateforme) de recevoir des paiements pour les **prestataires** et de leur reverser automatiquement leur part, tout en gardant une commission.

### Flux simplifié :

```
Client paie 1000€ pour un service
    ↓
Stripe reçoit 1000€
    ↓
Stripe répartit automatiquement :
  • 850€ → Compte bancaire du prestataire (transfert auto)
  • 150€ → Compte Kawepla (commission 15%)
```

---

## 💰 Frais Stripe (2024)

### Frais de base Stripe :
- **Carte européenne** : **1.4% + 0.25€** par transaction
- **Carte non-européenne** : **2.9% + 0.25€** par transaction
- **Prélèvement SEPA** : **0.8€** par transaction

### Frais Connect Express :
- **Aucun frais supplémentaire** pour Connect Express
- Vous payez uniquement les frais de transaction normaux
- Les transferts vers les prestataires sont **gratuits**

### Exemple concret (paiement 1000€) :

```
Paiement client : 1000€
    ↓
Frais Stripe (carte EU) : -14.25€ (1.4% + 0.25€)
    ↓
Montant net : 985.75€
    ↓
Commission Kawepla (15%) : -147.86€
    ↓
Montant prestataire : 837.89€
```

**Note** : Les frais Stripe sont déduits **avant** la répartition commission/prestataire.

---

## ⚙️ Configuration dans Stripe Dashboard

### Étape 1 : Activer Stripe Connect

1. Allez sur [Stripe Dashboard](https://dashboard.stripe.com)
2. **Settings** → **Connect** → **Get started**
3. Choisissez **Express** comme type de compte
4. Remplissez les informations de votre plateforme

### Étape 2 : Configurer les webhooks

1. **Developers** → **Webhooks** → **Add endpoint**
2. URL : `https://votre-domaine.com/api/webhooks/stripe-connect`
3. Événements à écouter :
   - `account.updated` (statut onboarding)
   - `payment_intent.succeeded` (paiement réussi)
   - `transfer.created` (transfert vers prestataire)
   - `charge.refunded` (remboursement)

### Étape 3 : Variables d'environnement

Ajoutez dans `.env` :

```bash
# Stripe Connect
STRIPE_SECRET_KEY=sk_test_... # Votre clé secrète
STRIPE_WEBHOOK_SECRET=whsec_... # Secret du webhook
STRIPE_CONNECT_CLIENT_ID=ca_... # Client ID Connect (optionnel)
```

---

## 🔄 Flux d'onboarding d'un prestataire

### 1. Créer un compte Connect Express

```typescript
// wedding-back/src/services/stripeConnectService.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Créer un compte Express pour le prestataire
const account = await stripe.accounts.create({
  type: 'express',
  country: 'FR',
  email: provider.email,
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true },
  },
  metadata: {
    providerId: provider.id,
    userId: provider.userId,
  },
});
```

### 2. Générer le lien d'onboarding

```typescript
// Créer le lien d'onboarding
const accountLink = await stripe.accountLinks.create({
  account: account.id,
  refresh_url: 'https://kawepla.com/provider/onboarding/refresh',
  return_url: 'https://kawepla.com/provider/onboarding/success',
  type: 'account_onboarding',
});

// Rediriger le prestataire vers accountLink.url
```

### 3. Le prestataire complète son profil

- Informations personnelles
- Coordonnées bancaires
- Documents d'identité (KYC automatique)
- Tout géré par Stripe dans leur interface

### 4. Vérifier le statut

```typescript
const account = await stripe.accounts.retrieve(accountId);

if (account.details_submitted && account.charges_enabled) {
  // Prestataire prêt à recevoir des paiements !
}
```

---

## 💳 Créer un paiement avec commission

### Exemple : Client réserve un service à 1000€

```typescript
// Créer un Payment Intent avec application_fee
const paymentIntent = await stripe.paymentIntents.create({
  amount: 100000, // 1000€ en centimes
  currency: 'eur',
  application_fee_amount: 15000, // 150€ commission (15%)
  transfer_data: {
    destination: providerStripeAccountId, // ID du compte Express
  },
  metadata: {
    bookingId: booking.id,
    providerId: provider.id,
    clientId: client.id,
  },
});

// Le client paie via Stripe Checkout ou Elements
// Une fois payé :
// - 850€ va automatiquement au prestataire
// - 150€ reste sur votre compte Stripe
```

---

## 📊 Gestion des transferts

### Transferts automatiques (Express)

Les transferts sont **automatiques** avec Express :
- Le prestataire reçoit son argent en **2-7 jours** (selon son pays)
- Aucune action requise de votre part
- Stripe gère tout

### Transferts manuels (si besoin)

```typescript
// Créer un transfert manuel
const transfer = await stripe.transfers.create({
  amount: 85000, // 850€
  currency: 'eur',
  destination: providerStripeAccountId,
  metadata: {
    bookingId: booking.id,
  },
});
```

---

## 🔔 Webhooks à gérer

### Événements importants

```typescript
// wedding-back/src/controllers/stripeConnectWebhookController.ts

switch (event.type) {
  case 'account.updated':
    // Prestataire a complété son onboarding
    const account = event.data.object;
    await updateProviderOnboardingStatus(account.id, account.details_submitted);
    break;

  case 'payment_intent.succeeded':
    // Paiement réussi, confirmer la réservation
    const paymentIntent = event.data.object;
    await confirmBooking(paymentIntent.metadata.bookingId);
    break;

  case 'transfer.created':
    // Transfert vers prestataire effectué
    const transfer = event.data.object;
    await logTransfer(transfer);
    break;

  case 'charge.refunded':
    // Remboursement demandé
    const charge = event.data.object;
    await handleRefund(charge);
    break;
}
```

---

## 📝 Schéma Prisma à ajouter

```prisma
model Provider {
  // ... champs existants
  stripeAccountId      String?   @unique // ID du compte Express
  stripeOnboarded      Boolean   @default(false)
  stripeAccountStatus  String?   // "pending", "active", "restricted"
  commissionRate       Float     @default(0.15) // 15%
}

model Booking {
  // ... champs existants
  stripePaymentIntentId String?   @unique
  stripeTransferId      String?
  applicationFee        Float?    // Commission Kawepla
  providerAmount        Float?    // Montant reversé au prestataire
}
```

---

## 🚀 Implémentation pour Kawepla

### Structure recommandée

```
wedding-back/src/
  ├── services/
  │   ├── stripeConnectService.ts    # Service principal Connect
  │   └── stripeService.ts            # Service Stripe existant
  ├── controllers/
  │   ├── stripeConnectController.ts  # Onboarding, paiements
  │   └── stripeConnectWebhookController.ts # Webhooks
  └── routes/
      └── stripeConnectRoutes.ts      # Routes API
```

### Endpoints à créer

```
POST   /api/stripe-connect/onboard        # Créer compte + lien onboarding
GET    /api/stripe-connect/status          # Statut onboarding prestataire
POST   /api/stripe-connect/create-payment  # Créer paiement avec commission
POST   /api/webhooks/stripe-connect       # Webhooks Stripe
```

---

## ✅ Avantages Express Connect

1. **Conformité KYC** : Stripe gère la vérification d'identité
2. **Transferts automatiques** : Pas de gestion manuelle
3. **Dashboard prestataire** : Chaque prestataire a son dashboard Stripe
4. **Gestion des remboursements** : Automatique
5. **Support multi-pays** : Prestataires internationaux
6. **Sécurité** : Stripe gère PCI-DSS

---

## ⚠️ Points d'attention

1. **Frais Stripe déduits avant commission** : Calculez bien votre marge
2. **Délais de transfert** : 2-7 jours selon le pays
3. **Remboursements** : Gérer les remboursements partiels
4. **Taxes** : Vérifier les obligations fiscales selon les pays
5. **KYC** : Certains prestataires peuvent être refusés par Stripe

---

## 📚 Ressources

- [Documentation Stripe Connect](https://stripe.com/docs/connect)
- [Guide Express Connect](https://stripe.com/docs/connect/express-accounts)
- [Calculateur de frais](https://stripe.com/pricing)
- [Dashboard Stripe](https://dashboard.stripe.com)

---

## 💡 Exemple de calcul de commission

```typescript
function calculateCommission(totalPrice: number, commissionRate: number = 0.15) {
  // Frais Stripe (carte EU) : 1.4% + 0.25€
  const stripeFee = (totalPrice * 0.014) + 0.25;
  
  // Montant net après frais Stripe
  const netAmount = totalPrice - stripeFee;
  
  // Commission Kawepla (15% du montant net)
  const commission = netAmount * commissionRate;
  
  // Montant pour le prestataire
  const providerAmount = netAmount - commission;
  
  return {
    totalPrice,
    stripeFee,
    netAmount,
    commission,
    providerAmount,
  };
}

// Exemple : 1000€
// {
//   totalPrice: 1000,
//   stripeFee: 14.25,
//   netAmount: 985.75,
//   commission: 147.86,
//   providerAmount: 837.89
// }
```

