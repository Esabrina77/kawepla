# 📍 Guide du Sitemap XML - Kawepla

## 🎯 Qu'est-ce qu'un sitemap ?

Un sitemap XML est un fichier qui liste toutes les URLs importantes de votre site pour aider Google et les autres moteurs de recherche à mieux indexer vos pages.

---

## 📊 Structure actuelle (15 octobre 2025)

### Pages par priorité :

#### 🔴 **Priorité 1.0** (Maximale) - MAJ quotidienne
- `https://kawepla.kaporelo.com` - Page d'accueil

#### 🟠 **Priorité 0.9** (Très haute) - MAJ hebdomadaire
- `https://kawepla.kaporelo.com/faq` - Questions fréquentes
- `https://kawepla.kaporelo.com/mariage` - Page dédiée mariages

#### 🟡 **Priorité 0.8** (Haute) - MAJ hebdomadaire
- `https://kawepla.kaporelo.com/contact` - Page de contact
- `https://kawepla.kaporelo.com/auth/register` - Inscription

#### 🟢 **Priorité 0.7** (Moyenne-haute) - MAJ hebdomadaire
- `https://kawepla.kaporelo.com/auth/login` - Connexion

#### 🔵 **Priorité 0.5** (Moyenne) - MAJ mensuelle
- `https://kawepla.kaporelo.com/mentions-legales` - Mentions légales
- `https://kawepla.kaporelo.com/politique-confidentialite` - Politique de confidentialité
- `https://kawepla.kaporelo.com/conditions-utilisation` - CGU
- `https://kawepla.kaporelo.com/auth/forgot-password` - Mot de passe oublié

---

## 🔄 Fréquence de mise à jour

| Fréquence | Description | Pages concernées |
|-----------|-------------|------------------|
| **daily** | Mise à jour quotidienne | Page d'accueil |
| **weekly** | Mise à jour hebdomadaire | FAQ, Mariage, Contact, Auth |
| **monthly** | Mise à jour mensuelle | Pages légales |

---

## ⚙️ Comment mettre à jour le sitemap

### 1. Ajouter une nouvelle page

Dans `wedding-front/public/sitemap.xml`, ajoutez :

```xml
<url>
<loc>https://kawepla.kaporelo.com/VOTRE-NOUVELLE-PAGE</loc>
<lastmod>2025-10-15T10:10:00+02:00</lastmod>
<changefreq>weekly</changefreq>
<priority>0.8</priority>
</url>
```

### 2. Définir la priorité

| Priorité | Quand l'utiliser |
|----------|------------------|
| **1.0** | Page d'accueil uniquement |
| **0.9** | Pages principales importantes (FAQ, Pages par événement) |
| **0.8** | Pages secondaires importantes (Contact, Inscription) |
| **0.7** | Pages fonctionnelles (Login) |
| **0.5** | Pages de support, légales |
| **0.3** | Pages d'erreur, redirections |

### 3. Choisir la fréquence de MAJ

| Fréquence | Quand l'utiliser |
|-----------|------------------|
| **daily** | Contenu qui change tous les jours (blog, actualités) |
| **weekly** | Contenu mis à jour régulièrement (pages principales) |
| **monthly** | Contenu stable (pages légales, À propos) |
| **yearly** | Contenu très stable (archives) |

---

## 🚀 Après modification du sitemap

### 1. Soumettre à Google Search Console
1. Allez sur https://search.google.com/search-console
2. Cliquez sur **"Sitemaps"**
3. Entrez : `sitemap.xml`
4. Cliquez sur **"Envoyer"**

### 2. Vérifier l'indexation
- Attendez 24-48h
- Vérifiez dans Google Search Console > Couverture
- Toutes vos URLs doivent apparaître avec le statut "Valide"

### 3. Forcer la réindexation
Si besoin, dans **"Inspection de l'URL"** :
1. Entrez l'URL de votre sitemap : `https://kawepla.kaporelo.com/sitemap.xml`
2. Cliquez sur **"Demander l'indexation"**

---

## 📈 URLs ajoutées récemment (15 oct 2025)

✅ `/faq` - Page Questions Fréquentes  
✅ `/mariage` - Page dédiée aux mariages  
✅ `/contact` - Page de contact  

Ces 3 nouvelles pages ont été ajoutées avec une priorité haute (0.8-0.9) pour accélérer leur indexation.

---

## 🔧 Automatiser la mise à jour (Avancé)

Pour générer automatiquement votre sitemap lors du build :

1. Installez `next-sitemap` :
   ```bash
   npm install --save-dev next-sitemap
   ```

2. Créez `next-sitemap.config.js` :
   ```js
   module.exports = {
     siteUrl: 'https://kawepla.kaporelo.com',
     generateRobotsTxt: true,
     changefreq: 'weekly',
     priority: 0.8,
   };
   ```

3. Ajoutez dans `package.json` :
   ```json
   "scripts": {
     "postbuild": "next-sitemap"
   }
   ```

---

## 📞 Support

Pour toute question sur le sitemap : kawepla.kaporelo@gmail.com

---

**Dernière mise à jour du sitemap :** 15 octobre 2025 à 10:10  
**Nombre total d'URLs :** 9 pages

