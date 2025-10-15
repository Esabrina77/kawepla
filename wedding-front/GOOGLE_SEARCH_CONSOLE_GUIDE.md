# 🔍 Guide : Configuration Google Search Console

## 📋 Étapes pour vérifier votre site avec Google Search Console

### Méthode 1 : Balise HTML (RECOMMANDÉE) ✅

#### 1. Se connecter à Google Search Console
- Allez sur : https://search.google.com/search-console
- Connectez-vous avec votre compte Google
- Cliquez sur **"Ajouter une propriété"**
- Choisissez **"Préfixe de l'URL"**
- Entrez : `https://kawepla.kaporelo.com`

#### 2. Choisir la méthode de vérification
- Sélectionnez **"Balise HTML"** dans les options de vérification
- Google vous donnera un code qui ressemble à ceci :
  ```html
  <meta name="google-site-verification" content="VOTRE_CODE_ICI" />
  ```

#### 3. Ajouter la balise dans votre site
Ajoutez cette balise dans le fichier : `wedding-front/src/app/layout.tsx`

Dans la section `<head>`, ajoutez :
```tsx
export const metadata: Metadata = {
  // ... autres métadonnées
  verification: {
    google: 'VOTRE_CODE_ICI', // Remplacez par votre code
  },
};
```

OU directement dans le composant RootLayout :
```tsx
<head>
  <meta name="google-site-verification" content="VOTRE_CODE_ICI" />
</head>
```

#### 4. Déployer et vérifier
1. Déployez votre site avec les modifications
2. Retournez sur Google Search Console
3. Cliquez sur **"Vérifier"**
4. ✅ Votre site est maintenant vérifié !

---

### Méthode 2 : Fichier HTML (ALTERNATIVE)

#### 1. Télécharger le fichier
- Google vous donnera un fichier à télécharger, par exemple :
  `google123abc456def.html`

#### 2. Placer le fichier
- Mettez ce fichier dans : `wedding-front/public/`
- Le fichier sera accessible à : `https://kawepla.kaporelo.com/google123abc456def.html`

#### 3. Vérifier
- Retournez sur Google Search Console
- Cliquez sur **"Vérifier"**

---

### Méthode 3 : Enregistrement DNS (AVANCÉE)

Si vous avez accès à votre hébergeur Hostinger :

1. Dans Google Search Console, choisissez **"Enregistrement DNS"**
2. Copiez l'enregistrement TXT fourni
3. Allez dans votre panneau Hostinger
4. Ajoutez un enregistrement TXT dans vos DNS
5. Attendez la propagation DNS (15 min - 1h)
6. Vérifiez sur Google Search Console

---

## 📊 Après la vérification : Actions importantes

### 1. Soumettre le sitemap
```
https://kawepla.kaporelo.com/sitemap.xml
```

Dans Google Search Console :
- Allez dans **"Sitemaps"**
- Entrez : `sitemap.xml`
- Cliquez sur **"Envoyer"**

### 2. Demander l'indexation des pages principales
Dans **"Inspection de l'URL"**, demandez l'indexation de :
- `https://kawepla.kaporelo.com`
- `https://kawepla.kaporelo.com/faq`
- `https://kawepla.kaporelo.com/mariage`

### 3. Activer les rapports
- Rapport de performances
- Rapport de couverture
- Rapport d'ergonomie mobile
- Core Web Vitals

---

## 🚀 Résultats attendus

- **24-48h** : Première indexation
- **1-2 semaines** : Apparition dans les recherches pour votre nom de marque
- **2-4 semaines** : Indexation complète de toutes les pages

---

## 📝 Note importante

Le fichier `google-site-verification.html` actuel est un placeholder.  
**Vous avez 2 options :**

1. ✅ **Méthode 1 (Balise HTML)** : Recommandée, plus simple
2. 🔄 **Méthode 2 (Fichier HTML)** : Remplacez `google-site-verification.html` par le fichier fourni par Google

---

## 🆘 Besoin d'aide ?

Contactez kawepla.kaporelo@gmail.com avec une capture d'écran de Google Search Console.

