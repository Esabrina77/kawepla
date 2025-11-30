# Alternatives à Stripe Connect pour Kawepla

## 🎯 Problème avec Stripe Connect

Si vous n'arrivez pas à créer un compte Stripe Connect, voici les meilleures alternatives pour gérer les paiements de marketplace.

---

## 📊 Comparaison des alternatives

| Solution | Frais | Complexité | Support FR | KYC | Transferts |
|----------|-------|------------|------------|-----|------------|
| **Mangopay** | 1.4% + 0.25€ | ⭐⭐ Facile | ✅ Excellent | ✅ Auto | ✅ Auto |
| **PayPal Payouts** | 2.9% + 0.30€ | ⭐⭐⭐ Moyen | ✅ Bon | ⚠️ Manuel | ✅ Auto |
| **Lemonway** | 1.4% + 0.25€ | ⭐⭐⭐ Moyen | ✅ Excellent | ✅ Auto | ✅ Auto |
| **Adyen Marketplace** | 1.4% + 0.25€ | ⭐⭐⭐⭐ Difficile | ⚠️ Moyen | ✅ Auto | ✅ Auto |
| **Mollie Connect** | 1.4% + 0.25€ | ⭐⭐ Facile | ✅ Bon | ✅ Auto | ✅ Auto |
| **Square Connect** | 2.6% + 0.10€ | ⭐⭐ Facile | ⚠️ Limité | ✅ Auto | ✅ Auto |

---

## 🥇 1. Mangopay (RECOMMANDÉ pour la France)

### ✅ Avantages
- **Spécialisé marketplace** : Conçu pour les plateformes
- **Support français excellent** : Équipe basée en France
- **KYC automatique** : Vérification d'identité intégrée
- **Transferts instantanés** : Paiements en 24h
- **API simple** : Documentation claire
- **Conformité européenne** : Licence bancaire européenne

### ❌ Inconvénients
- Moins connu que Stripe
- Interface moins moderne

### 💰 Frais
- **Carte EU** : 1.4% + 0.25€
- **Carte non-EU** : 2.9% + 0.25€
- **Transferts** : Gratuits

### 📝 Configuration
```bash
# .env
MANGOPAY_API_URL=https://api.sandbox.mangopay.com
MANGOPAY_CLIENT_ID=your_client_id
MANGOPAY_PASSPHRASE=your_passphrase
```

### 🔗 Documentation
- [Mangopay Marketplace](https://docs.mangopay.com/endpoints/v2.01/marketplace)
- [API Reference](https://docs.mangopay.com/api-references)

---

## 🥈 2. PayPal Payouts / PayPal for Marketplaces

### ✅ Avantages
- **Reconnu mondialement** : Confiance des utilisateurs
- **Intégration facile** : SDK JavaScript disponible
- **Support multi-devises** : International
- **Pas de frais de setup** : Gratuit à activer

### ❌ Inconvénients
- **Frais plus élevés** : 2.9% + 0.30€
- **KYC manuel** : Moins automatisé
- **Délais de transfert** : 3-5 jours
- **Support moins réactif**

### 💰 Frais
- **Transaction** : 2.9% + 0.30€
- **Payout** : Gratuit (mais délais)

### 📝 Configuration
```bash
# .env
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox # ou live
```

### 🔗 Documentation
- [PayPal Payouts](https://developer.paypal.com/docs/payouts/)
- [Marketplace Guide](https://developer.paypal.com/docs/marketplaces/)

---

## 🥉 3. Lemonway

### ✅ Avantages
- **Français** : Basé en France
- **Licence bancaire** : Conformité européenne
- **KYC automatique** : Vérification intégrée
- **Support français** : Équipe locale
- **API REST** : Moderne et documentée

### ❌ Inconvénients
- Moins connu que Stripe
- Interface moins intuitive
- Processus d'onboarding plus long

### 💰 Frais
- **Carte** : 1.4% + 0.25€
- **Prélèvement** : 0.8€
- **Transferts** : Gratuits

### 📝 Configuration
```bash
# .env
LEMONWAY_API_URL=https://sandbox-api.lemonway.fr
LEMONWAY_WALLET_ID=your_wallet_id
LEMONWAY_API_LOGIN=your_login
LEMONWAY_API_PASSWORD=your_password
```

### 🔗 Documentation
- [Lemonway Marketplace](https://documentation.lemonway.com/marketplace)
- [API Docs](https://documentation.lemonway.com/api)

---

## 4. Mollie Connect

### ✅ Avantages
- **Néerlandais** : Support européen
- **API simple** : Très facile à intégrer
- **Multi-méthodes** : Cartes, SEPA, iDEAL, etc.
- **Documentation claire** : Exemples nombreux

### ❌ Inconvénients
- Moins adapté aux marketplaces complexes
- Support principalement en anglais/néerlandais

### 💰 Frais
- **Carte EU** : 1.4% + 0.25€
- **SEPA** : 0.8€
- **Transferts** : Gratuits

### 📝 Configuration
```bash
# .env
MOLLIE_API_KEY=test_... # ou live_...
```

### 🔗 Documentation
- [Mollie Connect](https://docs.mollie.com/connect)
- [Marketplace Guide](https://docs.mollie.com/connect/marketplace)

---

## 5. Adyen Marketplace

### ✅ Avantages
- **Très puissant** : Utilisé par Uber, eBay
- **Multi-méthodes** : Cartes, wallets, etc.
- **KYC automatique** : Très avancé
- **Support international** : Excellent

### ❌ Inconvénients
- **Complexe** : Nécessite une équipe dédiée
- **Onboarding long** : Processus strict
- **Support moins accessible** : Pour petites entreprises

### 💰 Frais
- **Carte EU** : 1.4% + 0.25€
- **Négociable** : Selon volume

### 📝 Configuration
```bash
# .env
ADYEN_API_KEY=your_api_key
ADYEN_MERCHANT_ACCOUNT=your_merchant_account
ADYEN_ENVIRONMENT=test # ou live
```

---

## 6. Square Connect

### ✅ Avantages
- **Simple** : API intuitive
- **Transferts rapides** : 1-2 jours
- **Point of Sale** : Si besoin physique

### ❌ Inconvénients
- **Limité en Europe** : Principalement US/UK
- **Support FR limité**
- **Frais plus élevés** : 2.6% + 0.10€

### 💰 Frais
- **Transaction** : 2.6% + 0.10€
- **Transferts** : Gratuits

---

## 🎯 Recommandation pour Kawepla

### Option 1 : Mangopay (RECOMMANDÉ)
**Pourquoi ?**
- ✅ Spécialisé marketplace
- ✅ Support français excellent
- ✅ KYC automatique
- ✅ Frais compétitifs (1.4% + 0.25€)
- ✅ Transferts rapides (24h)
- ✅ Conformité européenne

**Idéal si** : Vous voulez une solution française, simple, et adaptée aux marketplaces.

### Option 2 : Lemonway
**Pourquoi ?**
- ✅ Français
- ✅ Licence bancaire
- ✅ Support local
- ✅ Frais similaires

**Idéal si** : Vous préférez une solution 100% française.

### Option 3 : PayPal Payouts
**Pourquoi ?**
- ✅ Reconnu
- ✅ Facile à intégrer
- ✅ Pas de setup complexe

**Idéal si** : Vous voulez démarrer rapidement avec une solution connue.

---

## 📋 Checklist d'intégration

### Pour n'importe quelle solution :

1. **Créer un compte** sur la plateforme
2. **Activer l'API marketplace** (si disponible)
3. **Obtenir les clés API** (test + production)
4. **Configurer les webhooks** pour les événements
5. **Tester en sandbox** avant production
6. **Implémenter l'onboarding** des prestataires
7. **Gérer les paiements** avec commission
8. **Gérer les remboursements** partiels/totaux

---

## 🔧 Exemple d'intégration Mangopay

### Installation
```bash
npm install mangopay2-nodejs-sdk
```

### Service de base
```typescript
// wedding-back/src/services/mangopayService.ts
import { MangoPay } from 'mangopay2-nodejs-sdk';

const mangopay = new MangoPay({
  clientId: process.env.MANGOPAY_CLIENT_ID!,
  clientApiKey: process.env.MANGOPAY_PASSPHRASE!,
  baseUrl: process.env.MANGOPAY_API_URL!,
});

// Créer un utilisateur prestataire
export async function createProviderUser(providerData: {
  email: string;
  firstName: string;
  lastName: string;
  birthday: number;
  nationality: string;
  countryOfResidence: string;
}) {
  const user = await mangopay.Users.create({
    PersonType: 'NATURAL',
    Email: providerData.email,
    FirstName: providerData.firstName,
    LastName: providerData.lastName,
    Birthday: providerData.birthday,
    Nationality: providerData.nationality,
    CountryOfResidence: providerData.countryOfResidence,
  });
  
  return user;
}

// Créer un wallet pour le prestataire
export async function createProviderWallet(userId: string) {
  const wallet = await mangopay.Wallets.create({
    Owners: [userId],
    Description: `Wallet for provider ${userId}`,
    Currency: 'EUR',
  });
  
  return wallet;
}

// Créer un paiement avec commission
export async function createPaymentWithCommission(
  amount: number, // en centimes
  commissionAmount: number, // en centimes
  providerWalletId: string,
  clientCardId: string
) {
  const payment = await mangopay.PayIns.create({
    PaymentType: 'CARD',
    ExecutionType: 'DIRECT',
    AuthorId: clientCardId,
    CreditedUserId: providerWalletId,
    DebitedFunds: {
      Currency: 'EUR',
      Amount: amount,
    },
    Fees: {
      Currency: 'EUR',
      Amount: commissionAmount, // Commission Kawepla
    },
    CreditedFunds: {
      Currency: 'EUR',
      Amount: amount - commissionAmount, // Montant pour prestataire
    },
    CardType: 'CB_VISA_MASTERCARD',
  });
  
  return payment;
}
```

---

## 🚨 Points d'attention

### 1. Conformité KYC
- Toutes les solutions nécessitent une vérification d'identité
- Certaines sont plus automatisées que d'autres
- Vérifiez les délais de validation

### 2. Délais de transfert
- Mangopay : 24h
- PayPal : 3-5 jours
- Lemonway : 2-3 jours
- Stripe : 2-7 jours

### 3. Support multi-devises
- Vérifiez les devises supportées
- Taux de change appliqués

### 4. Remboursements
- Gestion des remboursements partiels
- Frais de remboursement
- Délais de traitement

---

## 📞 Contacts pour démarrer

### Mangopay
- Site : https://www.mangopay.com
- Contact : sales@mangopay.com
- Support : support@mangopay.com

### Lemonway
- Site : https://www.lemonway.com
- Contact : contact@lemonway.com
- Support : support@lemonway.com

### PayPal
- Site : https://www.paypal.com
- Developer Portal : https://developer.paypal.com

---

## ✅ Conclusion

**Pour Kawepla, je recommande Mangopay** car :
1. Spécialisé marketplace
2. Support français excellent
3. KYC automatique
4. Frais compétitifs
5. Transferts rapides
6. Conformité européenne

**Alternative** : Lemonway si vous préférez 100% français.

**Démarrage rapide** : PayPal si vous voulez tester rapidement.

