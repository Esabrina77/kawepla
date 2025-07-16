# Configuration Stripe Payment Links

## Étapes de configuration

### 1. Créer les produits dans Stripe Dashboard

Allez sur [Dashboard Stripe](https://dashboard.stripe.com/products) → **Products** → **Add product**

Créez ces 4 produits :

#### Produit 1 : Essentiel
- **Nom** : Forfait Essentiel
- **Prix** : 39€ (paiement unique)
- **Description** : Pour les petits mariages

#### Produit 2 : Élégant  
- **Nom** : Forfait Élégant
- **Prix** : 69€ (paiement unique)
- **Description** : Le plus populaire

#### Produit 3 : Premium
- **Nom** : Forfait Premium
- **Prix** : 99€ (paiement unique)
- **Description** : Pour les grands mariages

#### Produit 4 : Luxe
- **Nom** : Forfait Luxe
- **Prix** : 149€ (paiement unique)
- **Description** : L'expérience ultime

### 2. Créer les Payment Links

Pour chaque produit :
1. Cliquez sur le produit
2. Cliquez sur **"Create payment link"**
3. Configurez :
   - **Collect customer information** : Email address
   - **After payment** : Redirect to a specific page
   - **Success URL** : `http://localhost:3012/client/billing?success=true&plan=PLAN_ID`
   - **Cancel URL** : `http://localhost:3012/client/billing?canceled=true`

Remplacez `PLAN_ID` par :
- `ESSENTIAL` pour le forfait Essentiel
- `ELEGANT` pour le forfait Élégant
- `PREMIUM` pour le forfait Premium
- `LUXE` pour le forfait Luxe

### 3. Ajouter les URLs dans .env

Copiez les URLs des Payment Links créés et ajoutez-les dans votre fichier `.env` :

```bash
# Stripe Payment Links
STRIPE_PAYMENT_LINK_ESSENTIAL=https://buy.stripe.com/test_XXXXX
STRIPE_PAYMENT_LINK_ELEGANT=https://buy.stripe.com/test_XXXXX
STRIPE_PAYMENT_LINK_PREMIUM=https://buy.stripe.com/test_XXXXX
STRIPE_PAYMENT_LINK_LUXE=https://buy.stripe.com/test_XXXXX
```

### 4. Cartes de test Stripe

Pour tester les paiements, utilisez ces cartes :

- **Paiement réussi** : `4242 4242 4242 4242`
- **Paiement refusé** : `4000 0000 0000 0002`
- **Authentification 3D Secure** : `4000 0025 0000 3155`

**Autres infos** :
- **Date d'expiration** : N'importe quelle date future
- **CVC** : N'importe quel code à 3 chiffres
- **Code postal** : N'importe quel code postal

### 5. Production

Pour la production :
1. Activez votre compte Stripe
2. Recréez les produits et Payment Links en mode Live
3. Mettez à jour les URLs dans les variables d'environnement de production
4. Changez les URLs de redirection pour pointer vers votre domaine de production

## Flux de paiement

1. **Utilisateur clique sur "Passer à [Plan]"**
2. **Modal de confirmation** s'ouvre
3. **Utilisateur confirme** → Redirection vers Stripe Payment Link
4. **Paiement sur Stripe** → Redirection vers success URL
5. **Vérification automatique** du statut du paiement
6. **Mise à jour du forfait** dans la base de données

## Avantages de cette approche

✅ **Sécurisé** : Stripe gère tout le processus de paiement
✅ **Simple** : Pas de gestion complexe de webhooks
✅ **Fiable** : Fonctionne même sans webhooks
✅ **Testable** : Cartes de test disponibles
✅ **Production ready** : Même code pour test et production 