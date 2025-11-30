# Configuration Stripe Checkout

## Vue d'ensemble

Kawepla utilise **Stripe Checkout** pour gérer tous les paiements. Cette approche est dynamique et ne nécessite pas de créer des Payment Links manuellement dans le dashboard Stripe.

## Avantages de Stripe Checkout

✅ **Dynamique** : Les sessions de checkout sont créées à la volée via l'API  
✅ **Pas de configuration manuelle** : Plus besoin de créer des Payment Links pour chaque forfait  
✅ **Flexible** : Facile d'ajouter/modifier des forfaits sans toucher au dashboard Stripe  
✅ **Métadonnées** : Possibilité de passer des informations (userId, planId) dans chaque session  
✅ **Webhooks** : Gestion automatique des confirmations de paiement  

## Configuration

### 1. Obtenir votre clé API Stripe

1. Allez sur [Dashboard Stripe](https://dashboard.stripe.com)
2. **Developers** → **API keys**
3. Copiez votre **Secret key** (commence par `sk_test_` en mode test)

### 2. Configurer les variables d'environnement

Ajoutez dans votre fichier `.env` :

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Votre clé secrète Stripe
```

**C'est tout !** Plus besoin de créer des Payment Links ou d'autres variables.

### 3. Configurer les webhooks (recommandé)

Pour une gestion automatique des paiements :

1. **Developers** → **Webhooks** → **Add endpoint**
2. URL : `https://votre-domaine.com/api/subscriptions/webhook`
3. Sélectionnez l'événement : `checkout.session.completed`
4. Copiez le **Webhook signing secret** (commence par `whsec_`)
5. Ajoutez-le dans `.env` :

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Comment ça fonctionne

### Flux de paiement

1. **Utilisateur clique sur "Acheter [Forfait]"**
2. **Backend crée une session Checkout** via `createCheckoutSession()`
   - Prix dynamique depuis le code
   - Métadonnées (userId, planId)
   - URLs de succès/annulation
3. **Stripe retourne une URL de checkout unique**
4. **Redirection vers Stripe Checkout**
5. **Utilisateur paie** sur la page Stripe
6. **Redirection vers votre site** (success ou cancel)
7. **Webhook confirme le paiement** et active le forfait

### Exemple de session créée

```typescript
// Backend crée automatiquement :
{
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'eur',
      product_data: {
        name: 'Forfait Essentiel',
        description: 'Pour les petits mariages'
      },
      unit_amount: 3900 // 39€ en centimes
    },
    quantity: 1
  }],
  mode: 'payment',
  success_url: 'https://kawepla.com/client/billing?success=true&plan=ESSENTIAL',
  cancel_url: 'https://kawepla.com/client/billing?canceled=true',
  metadata: {
    userId: 'user_123',
    planId: 'ESSENTIAL'
  }
}
```

## Cartes de test Stripe

Pour tester les paiements, utilisez ces cartes :

- **Paiement réussi** : `4242 4242 4242 4242`
- **Paiement refusé** : `4000 0000 0000 0002`
- **Authentification 3D Secure** : `4000 0025 0000 3155`

**Autres infos** :
- **Date d'expiration** : N'importe quelle date future
- **CVC** : N'importe quel code à 3 chiffres
- **Code postal** : N'importe quel code postal

## Ajouter un nouveau forfait

Avec Checkout, c'est très simple :

1. Connectez-vous en Super Admin → `Packs & Tarifs`
2. Créez ou éditez un pack (prix, limites, features)
3. Le forfait est disponible instantanément côté client

**Exemple** :

```typescript
{
  id: 'NEW_PLAN',
  name: 'Nouveau Forfait',
  description: 'Description du forfait',
  price: 199, // Prix en euros
  features: [...],
  limits: {...}
}
```

Aucune configuration Stripe nécessaire !

## Production

Pour la production :

1. **Activez votre compte Stripe** (mode Live)
2. **Récupérez votre clé Live** (`sk_live_...`)
3. **Mettez à jour** `STRIPE_SECRET_KEY` avec la clé Live
4. **Configurez les webhooks** avec l'URL de production
5. **C'est tout !** Le même code fonctionne en test et production

## Gestion des webhooks

Les webhooks sont gérés automatiquement dans `stripeService.ts` :

- `checkout.session.completed` : Active le forfait après paiement
- `payment_intent.succeeded` : Confirme le paiement

Le webhook met à jour automatiquement :
- Le forfait de l'utilisateur
- L'historique des achats
- Les limites disponibles

## Avantages vs Payment Links

| Payment Links | Stripe Checkout |
|---------------|----------------|
| ❌ Création manuelle pour chaque forfait | ✅ Création automatique via API |
| ❌ Modification dans le dashboard | ✅ Modification dans le code |
| ❌ Pas de métadonnées personnalisées | ✅ Métadonnées par session |
| ❌ URLs fixes | ✅ URLs dynamiques |
| ❌ Configuration complexe | ✅ Configuration simple |

## Support

Pour toute question sur Stripe Checkout :
- [Documentation Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [API Reference](https://stripe.com/docs/api/checkout/sessions)
