# KaWePla

Plateforme de création et gestion d'invitations de mariage digitales.

## 🎯 Fonctionnalités principales

- Création d'invitations digitales personnalisées
- Gestion des invités et RSVP
- Communication avec les invités
- Statistiques et suivi

## 💰 Plans tarifaires

### Gratuit
- 1 design d'invitation simple
- Jusqu'à 50 invités
- RSVP basique
- Pas d'export

### Standard (9.99€/mois)
- Tous les designs basiques
- Jusqu'à 200 invités
- Personnalisation avancée
- Import/export CSV
- Notifications et rappels
- Messages personnalisés

### Premium (19.99€/mois)
- Designs premium exclusifs
- Invités illimités
- Personnalisation complète
- Statistiques avancées
- Support prioritaire
- Album photo partagé

## 🚀 Démarrage rapide

```bash
# Installation des dépendances
npm install

# Lancement en mode développement
npm run dev

# Construction pour la production
npm run build

# Lancement en production
npm start
```

## 🛠️ Technologies utilisées

- Next.js
- React
- TypeScript
- Prisma
- PostgreSQL

## 📁 Structure du projet

```
wedding-front/
├── src/
│   ├── app/
│   │   ├── (site)/           # Pages publiques
│   │   └── (extranet)/       # Pages authentifiées
│   ├── components/           # Composants réutilisables
│   ├── lib/                  # Utilitaires et configurations
│   └── styles/              # Styles globaux
```

## 🔒 Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
DATABASE_URL=
NEXT_PUBLIC_API_URL=
```

## 📝 Licence

Copyright © 2024 WeddInvite. Tous droits réservés.
