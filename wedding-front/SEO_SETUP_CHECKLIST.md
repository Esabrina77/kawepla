# ✅ Checklist SEO & Google Search Console - Kawepla

## 🎯 État actuel (15 octobre 2025)

### ✅ Complété

- [x] Sitemap.xml mis à jour avec toutes les pages
- [x] Pages légales créées (Mentions légales, Politique de confidentialité, CGU)
- [x] Pages de contenu créées (FAQ, Mariage, Contact)
- [x] Metadata optimisées sur toutes les pages
- [x] Guide Google Search Console créé
- [x] Guide Sitemap créé
- [x] Footer mis à jour avec liens légaux
- [x] Header mis à jour avec navigation

### 🔄 À faire (Par vous)

- [ ] **Vérifier le site sur Google Search Console**
- [ ] Soumettre le sitemap
- [ ] Demander l'indexation des pages principales
- [ ] Créer un compte Google Analytics (optionnel)
- [ ] Partager sur les réseaux sociaux

---

## 📍 Où trouver le code de vérification Google

### Méthode recommandée : Balise HTML

#### Étape 1 : Se connecter à Google Search Console
1. Allez sur : **https://search.google.com/search-console**
2. Connectez-vous avec votre compte Google
3. Cliquez sur le bouton **"Ajouter une propriété"** (en haut à gauche)

#### Étape 2 : Ajouter votre site
1. Choisissez **"Préfixe de l'URL"** (et non "Domaine")
2. Entrez : `https://kawepla.kaporelo.com`
3. Cliquez sur **"Continuer"**

#### Étape 3 : Choisir la méthode de vérification
1. Vous verrez plusieurs options de vérification
2. Cliquez sur **"Balise HTML"** (ou "HTML Tag")
3. Vous verrez une ligne de code comme celle-ci :

```html
<meta name="google-site-verification" content="abc123def456ghi789jkl012mno345" />
```

#### Étape 4 : Copier le code
1. Copiez UNIQUEMENT la partie **après "content="** et **avant le dernier "**
2. Par exemple, si vous avez :
   ```html
   <meta name="google-site-verification" content="abc123def456ghi789jkl012mno345" />
   ```
   Copiez : `abc123def456ghi789jkl012mno345`

#### Étape 5 : Ajouter le code dans votre site
Ouvrez le fichier : `wedding-front/src/app/layout.tsx`

Trouvez la section `metadata` et ajoutez :

```typescript
export const metadata: Metadata = {
  title: 'Kawepla - Plateforme complète pour organiser vos événements',
  description: 'Plus de 210 organisateurs nous font confiance...',
  // ... autres métadonnées
  
  // 👇 AJOUTEZ CETTE LIGNE 👇
  verification: {
    google: 'abc123def456ghi789jkl012mno345', // Remplacez par VOTRE code
  },
};
```

#### Étape 6 : Déployer et vérifier
1. Déployez votre site (avec `npm run build` puis upload sur Hostinger)
2. Retournez sur Google Search Console
3. Cliquez sur le bouton **"Vérifier"** (en bas de la page)
4. ✅ Vous verrez : **"Propriété vérifiée"**

---

## 📊 Après la vérification : Actions immédiates

### 1. Soumettre le sitemap (Obligatoire)

Dans Google Search Console :
1. Cliquez sur **"Sitemaps"** dans le menu de gauche
2. Dans le champ, entrez : `sitemap.xml`
3. Cliquez sur **"Envoyer"**
4. ✅ Vous devriez voir : "Sitemap envoyé avec succès"

**Résultat attendu :**
- 9 URLs découvertes
- Statut : "Réussite"

### 2. Demander l'indexation des pages importantes

Dans **"Inspection de l'URL"** :

Testez et demandez l'indexation pour :
- `https://kawepla.kaporelo.com` (Page d'accueil)
- `https://kawepla.kaporelo.com/faq`
- `https://kawepla.kaporelo.com/mariage`
- `https://kawepla.kaporelo.com/auth/register`

Pour chaque URL :
1. Collez l'URL dans le champ en haut
2. Cliquez sur Entrée
3. Attendez l'analyse (10-30 secondes)
4. Cliquez sur **"Demander l'indexation"**
5. ✅ Confirmez

**Résultat attendu :**
- Indexation demandée avec succès
- Délai : 24-48h pour apparaître dans Google

### 3. Activer les rapports

Explorez ces sections (menu de gauche) :
- **Vue d'ensemble** : statistiques générales
- **Performances** : clics, impressions, position moyenne
- **Couverture** : pages indexées vs. pages avec erreurs
- **Ergonomie mobile** : problèmes d'affichage mobile
- **Core Web Vitals** : vitesse et expérience utilisateur

---

## 🚀 Timeline attendue

| Délai | Événement |
|-------|-----------|
| **Maintenant** | Vérification du site |
| **24h** | Sitemap traité |
| **24-48h** | Premières pages indexées |
| **48-72h** | Apparition dans recherches de marque ("kawepla") |
| **1-2 semaines** | Toutes les pages indexées |
| **2-4 semaines** | Apparition pour mots-clés génériques |

---

## 📈 Optimisations supplémentaires (Optionnelles)

### Google Analytics (Gratuit)
1. Créez un compte sur https://analytics.google.com
2. Créez une propriété pour kawepla.kaporelo.com
3. Copiez l'ID de mesure (G-XXXXXXXXXX)
4. Ajoutez-le dans votre site

### Bing Webmaster Tools (Gratuit)
1. Importez directement depuis Google Search Console
2. Doublez votre visibilité (Bing + Yahoo)

### Schema.org Markup (Avancé)
- Ajoutez des données structurées pour les événements
- Améliorez l'affichage dans les résultats de recherche
- Rich snippets avec étoiles, prix, dates

---

## 🔍 Comment vérifier que tout fonctionne

### Test 1 : Vérifier l'indexation
Dans Google, tapez :
```
site:kawepla.kaporelo.com
```
Vous devriez voir vos pages apparaître.

### Test 2 : Vérifier la balise de vérification
1. Allez sur : https://kawepla.kaporelo.com
2. Faites **Clic droit > Afficher le code source de la page**
3. Cherchez (Ctrl+F) : `google-site-verification`
4. ✅ Vous devriez voir votre balise

### Test 3 : Vérifier le sitemap
Allez sur : https://kawepla.kaporelo.com/sitemap.xml

Vous devriez voir un fichier XML avec toutes vos URLs.

---

## 🆘 Problèmes courants

### "La vérification a échoué"
- Attendez 10-15 minutes après le déploiement
- Videz le cache de votre navigateur (Ctrl+Shift+R)
- Vérifiez que le code est bien dans le `<head>` de la page

### "Sitemap introuvable"
- Vérifiez que le fichier est bien dans `/public/`
- Testez l'URL directement dans le navigateur
- Vérifiez qu'il n'y a pas d'erreur de syntaxe XML

### "Aucune donnée dans Google Search Console"
- C'est normal les premières 24-48h
- Patientez avant de voir les premières données
- L'indexation prend du temps

---

## 📞 Support

**Email :** kawepla.kaporelo@gmail.com

**Guides disponibles :**
- `GOOGLE_SEARCH_CONSOLE_GUIDE.md` - Guide complet Google
- `SITEMAP_GUIDE.md` - Guide du sitemap
- `SEO_SETUP_CHECKLIST.md` - Cette checklist

---

**Bonne chance pour votre référencement ! 🚀**

*Dernière mise à jour : 15 octobre 2025*

