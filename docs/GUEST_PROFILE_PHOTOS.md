# Photos de Profil des Invités

## Vue d'ensemble

Les invités peuvent maintenant ajouter leur propre photo de profil directement depuis les formulaires RSVP. Cette fonctionnalité permet aux mariés de reconnaître facilement leurs invités.

## Fonctionnalités

### Pour les Invités

1. **Upload de Photo sur RSVP** : Les invités peuvent ajouter leur photo lors de la confirmation de leur présence
2. **Compression Automatique** : Les photos sont automatiquement compressées (200KB max, 256x256px)
3. **Stockage Sécurisé** : Les photos sont stockées sur Firebase Storage
4. **Modification Possible** : Les invités peuvent changer ou supprimer leur photo

### Pour les Mariés

1. **Visualisation** : Les photos des invités apparaissent dans la liste des invités
2. **Reconnaissance** : Aide à identifier les invités lors de l'événement
3. **Confidentialité** : Les photos ne sont visibles que par les mariés

## Implémentation Technique

### Frontend

#### Composant `GuestProfilePhotoUpload`
- Gestion de l'upload avec prévisualisation
- Compression d'image côté client
- Interface utilisateur intuitive
- Gestion d'erreurs complète

#### Intégration RSVP
- Ajouté dans les deux formulaires RSVP :
  - RSVP avec token individuel (`/rsvp/[token]`)
  - RSVP avec lien partageable (`/rsvp/shared/[shareableToken]`)

### Backend

#### Base de Données
- Ajout du champ `profilePhotoUrl` dans le modèle `RSVP`
- Migration automatique créée

#### API
- Support du champ `profilePhotoUrl` dans les endpoints RSVP
- Validation et traitement des URLs de photos

### Firebase Storage

#### Configuration
- Stockage des photos dans le dossier `guest-photos/profile/`
- Noms de fichiers uniques avec timestamp
- Format JPEG pour optimisation

#### Sécurité
- Règles d'accès : lecture publique, écriture authentifiée
- Suppression automatique des anciennes photos lors du remplacement

## Utilisation

### Pour les Invités

1. **Accès au Formulaire RSVP**
   - Via lien individuel ou lien partageable
   - Section "Votre photo (optionnel)" disponible

2. **Ajout de Photo**
   - Cliquer sur "📷 Ajouter"
   - Sélectionner une image (max 10MB)
   - Compression automatique
   - Prévisualisation immédiate

3. **Modification/Suppression**
   - Bouton "📷 Changer" pour remplacer
   - Bouton "🗑️ Supprimer" pour enlever

### Pour les Mariés

1. **Visualisation**
   - Accès à `/client/guests`
   - Photos visibles dans les cartes d'invités
   - Affichage uniquement si photo présente

2. **Gestion**
   - Pas d'action requise
   - Photos gérées automatiquement par les invités

## Avantages

### Expérience Utilisateur
- **Simple** : Ajout de photo en quelques clics
- **Rapide** : Compression automatique
- **Sécurisé** : Stockage Firebase fiable

### Gestion d'Événement
- **Reconnaissance** : Identifier facilement les invités
- **Organisation** : Meilleure gestion des arrivées
- **Souvenir** : Photos conservées pour l'événement

## Considérations Techniques

### Performance
- Compression côté client pour réduire la bande passante
- Stockage optimisé sur Firebase
- Chargement paresseux des images

### Coût
- Estimation : 5000 photos = 1GB de stockage
- Coût Firebase très réduit
- Compression efficace pour minimiser l'espace

### Sécurité
- Photos visibles uniquement par les mariés
- Pas de partage public
- Suppression automatique des anciennes versions

## Support

### Formats Supportés
- JPEG, PNG, WebP
- Taille maximale : 10MB
- Compression automatique vers JPEG

### Compatibilité
- Tous navigateurs modernes
- Support mobile complet
- Interface responsive

### Gestion d'Erreurs
- Messages d'erreur clairs
- Validation côté client et serveur
- Récupération automatique en cas d'échec

## Évolutions Futures

### Fonctionnalités Possibles
- Galerie de photos d'invités pour les mariés
- Export des photos pour création d'un trombinoscope
- Intégration avec système de badges/étiquettes
- Reconnaissance faciale automatique (avec consentement)

### Optimisations
- Cache intelligent des images
- Génération de miniatures multiples
- Synchronisation offline
- Backup automatique 