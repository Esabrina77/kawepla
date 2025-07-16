# Configuration Firebase pour les Photos de Profil

## 1. Configuration Firebase Console

### Règles de sécurité Storage
Dans Firebase Console > Storage > Règles, copiez cette configuration :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true; // Lecture publique des photos de profil
      allow write: if request.auth != null; // Upload réservé aux utilisateurs connectés
    }
  }
}
```

### Récupérer les clés de configuration
1. Allez dans Firebase Console > Paramètres du projet > Général
2. Faites défiler jusqu'à "Vos applications" > "Configuration du SDK"
3. Copiez les valeurs de configuration

## 2. Variables d'environnement

Créez un fichier `.env.local` dans `wedding-front/` :

```env
# Production: 
NEXT_PUBLIC_API_URL=https://kaweplay-api.kaporelo.com

# Firebase Configuration - Kawepla Project
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key_ici
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=kawepla-6be10.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=kawepla-6be10
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=kawepla-6be10.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

## 3. Test de la fonctionnalité

### Étapes de test :
1. **Démarrer les serveurs** :
   ```bash
   # Backend
   cd wedding-back
   npm run dev
   
   # Frontend
   cd wedding-front
   npm run dev
   ```

2. **Tester l'upload** :
   - Allez sur la page des invités
   - Cliquez sur "Ajouter" ou "Changer" sur une photo de profil
   - Sélectionnez une image (max 5MB)
   - Vérifiez que l'image est compressée et uploadée
   - Vérifiez que l'URL est sauvegardée en base

3. **Vérifier la compression** :
   - Uploadez une image > 1MB
   - Vérifiez dans Firebase Storage que l'image fait ~200Ko
   - Vérifiez que les dimensions sont 256x256px max

4. **Tester la suppression** :
   - Cliquez sur "Supprimer" sur une photo existante
   - Vérifiez que l'image est supprimée de Firebase Storage
   - Vérifiez que l'URL est supprimée de la base de données

## 4. Dépannage

### Erreurs courantes :
- **"Firebase app not initialized"** : Vérifiez vos variables d'environnement
- **"Permission denied"** : Vérifiez les règles de sécurité Storage
- **"Image too large"** : La compression se fait côté client, vérifiez la console

### Vérifications :
- Firebase Console > Storage : voir les images uploadées
- Base de données : vérifier que `profilePhotoUrl` est rempli
- Console navigateur : vérifier les erreurs JavaScript

## 5. Optimisations

### Performances :
- Images compressées à 200Ko max
- Format JPEG forcé pour optimiser la taille
- Dimensions limitées à 256x256px

### Coûts :
- Stockage Firebase : ~0.10$/Go après 5Go gratuits
- Avec compression : ~5000 photos de profil = 1Go
- Lecture gratuite et illimitée 