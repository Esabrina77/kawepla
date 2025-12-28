# 🔍 Diagnostic Service Worker en Production

## Problème identifié

Le service worker `sw-notifications.js` est enregistré mais devient **"redundant"** en production, ce qui signifie qu'il n'est pas actif.

## Causes possibles

1. **Erreur lors de l'import de `sw.js`** : Le service worker essaie d'importer `sw.js` qui peut ne pas exister en production
2. **Conflit avec next-pwa** : next-pwa peut générer son propre service worker qui entre en conflit
3. **Erreur JavaScript dans le service worker** : Une erreur non gérée peut faire échouer l'activation
4. **Problème de cache** : Le navigateur peut utiliser une version en cache du service worker

## Solutions appliquées

### 1. Import optionnel de `sw.js`
- L'import de `sw.js` est maintenant dans un try/catch qui ne fait pas échouer le service worker
- Message d'information au lieu d'avertissement

### 2. Amélioration de l'activation
- Utilisation de `event.waitUntil()` pour garantir l'activation
- Meilleure gestion des erreurs avec logs détaillés
- `clients.claim()` pour prendre le contrôle immédiatement

### 3. Amélioration de l'enregistrement côté client
- Vérification de l'accessibilité du fichier avant l'enregistrement
- Désinscription forcée des anciens service workers
- Meilleure gestion des états (installing, waiting, active)

## Actions à effectuer en production

### 1. Vérifier les erreurs dans la console du service worker

1. Ouvrir DevTools (F12)
2. Aller dans **Application** → **Service Workers**
3. Cliquer sur le lien "sw-notifications.js" (avec le X rouge)
4. Vérifier les erreurs dans la console

### 2. Vérifier l'accessibilité du fichier

Tester l'URL directement :
```bash
curl -I https://kawepla.kaporelo.com/sw-notifications.js
```

Vous devriez voir :
- `HTTP/1.1 200 OK`
- `Content-Type: application/javascript`

### 3. Vérifier les logs de la console du navigateur

Ouvrir la console et chercher :
- `🔄 Début enregistrement service worker...`
- `✅ Fichier service worker accessible: /sw-notifications.js`
- `✅ Service Worker de notifications enregistré`
- `✅ Service worker prêt et actif !`

### 4. Vérifier les logs du service worker

Dans DevTools → Application → Service Workers, cliquer sur "sw-notifications.js" et vérifier :
- `📱 Service Worker de notifications chargé`
- `✅ Service Worker de notifications installé`
- `✅ Service Worker de notifications activé`
- `✅ clients.claim() exécuté`

### 5. Forcer la réinstallation

1. Dans DevTools → Application → Service Workers
2. Cocher "Update on reload"
3. Cliquer sur "Unregister" sur tous les service workers
4. Recharger la page (Ctrl+Shift+R)
5. Vérifier que le service worker s'enregistre correctement

## Si le problème persiste

### Vérifier la configuration next-pwa

Le fichier `next.config.ts` doit avoir :
```typescript
register: false, // Important : désactiver l'auto-enregistrement
```

### Vérifier que le fichier est bien dans le build

Le fichier `sw-notifications.js` doit être dans :
- `wedding-front/public/sw-notifications.js` (source)
- Copié automatiquement dans `.next/static/` lors du build

### Vérifier les headers HTTP

Le fichier doit être servi avec :
- `Content-Type: application/javascript`
- `Service-Worker-Allowed: /`

Ces headers sont configurés dans `next.config.ts`.

## Test manuel

1. Ouvrir la console du navigateur
2. Exécuter :
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service workers enregistrés:', regs);
  regs.forEach(reg => {
    console.log('Scope:', reg.scope);
    console.log('Active:', reg.active?.scriptURL);
    console.log('Installing:', reg.installing?.scriptURL);
    console.log('Waiting:', reg.waiting?.scriptURL);
  });
});
```

3. Vérifier qu'il n'y a qu'un seul service worker avec `sw-notifications.js` comme scriptURL

## Prochaines étapes

1. Déployer les corrections
2. Vérifier les logs de la console
3. Vérifier les erreurs du service worker
4. Tester l'enregistrement manuel si nécessaire

