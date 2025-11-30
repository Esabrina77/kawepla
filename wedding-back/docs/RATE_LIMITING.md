# Système de Rate Limiting

## Vue d'ensemble

Le système de rate limiting protège l'API contre les abus et les attaques par force brute en limitant le nombre de requêtes qu'un utilisateur ou une adresse IP peut effectuer dans une période donnée.

## Middlewares disponibles

### 1. `generalRateLimiter`
**Limite** : 100 requêtes par 15 minutes  
**Application** : Toutes les routes API (`/api/*`)  
**Clé** : Par utilisateur authentifié (ID) ou par IP  
**Skip : Super admins

### 2. `authRateLimiter`
**Limite** : 5 tentatives par 15 minutes  
**Application** : Routes d'authentification (`/api/auth/*`)  
**Clé** : Par IP uniquement  
**Protection** : Contre les attaques par force brute sur login/register

### 3. `createRateLimiter`
**Limite** : 20 requêtes par 15 minutes  
**Application** : Routes de création/modification (POST, PUT, PATCH, DELETE)  
**Clé** : Par utilisateur authentifié ou par IP  
**Protection** : Contre le spam de création

### 4. `aiRateLimiter`
**Limite** : 10 requêtes par minute  
**Application** : Routes IA (`/api/ai/*`)  
**Clé** : Par utilisateur authentifié ou par IP  
**Protection** : Contre l'abus des requêtes IA coûteuses

### 5. `searchRateLimiter`
**Limite** : 30 requêtes par minute  
**Application** : Routes de recherche  
**Clé** : Par utilisateur authentifié ou par IP  
**Protection** : Contre l'abus des recherches

### 6. `publicRateLimiter`
**Limite** : 50 requêtes par 15 minutes  
**Application** : Routes publiques (RSVP, partage)  
**Clé** : Par IP uniquement  
**Protection** : Protection modérée pour les routes publiques

## Routes protégées

### Authentification (`/api/auth/*`)
- ✅ Toutes les routes utilisent `authRateLimiter`
- Routes : `/register`, `/login`, `/forgot-password`, `/reset-password`, `/send-verification-code`, `/verify-email`

### IA (`/api/ai/*`)
- ✅ Toutes les routes utilisent `aiRateLimiter` + `checkAILimit`
- Routes : `/generate-checklist`, `/improve-description`

### RSVP (`/api/rsvp/*`)
- ✅ Toutes les routes utilisent `publicRateLimiter`
- Routes publiques pour les invités

### Invitations (`/api/invitations/*`)
- ✅ Routes de création/modification utilisent `createRateLimiter`
- Routes : `POST /`, `POST /:id/publish`, `POST /:id/archive`, `PUT /:id`, `DELETE /:id`
- Routes de création d'invités : `POST /:id/guests/*`

### Providers (`/api/providers/*`)
- ✅ Routes de création/modification utilisent `createRateLimiter`
- ✅ Route de recherche utilise `searchRateLimiter`
- Routes : `POST /profile`, `PUT /profile`, `POST /services`, `PUT /services/:id`

### Routes générales
- ✅ Toutes les routes `/api/*` utilisent `generalRateLimiter` par défaut

## Réponses d'erreur

Lorsqu'une limite est dépassée, l'API retourne :

```json
{
  "error": "Message d'erreur explicite",
  "retryAfter": "Durée avant de pouvoir réessayer",
  "code": "CODE_ERREUR" // Pour certaines routes spécifiques
}
```

**Status HTTP** : `429 Too Many Requests`

## Headers de réponse

Le rate limiter ajoute automatiquement les headers suivants :

- `RateLimit-Limit` : Nombre maximum de requêtes autorisées
- `RateLimit-Remaining` : Nombre de requêtes restantes
- `RateLimit-Reset` : Timestamp de réinitialisation de la fenêtre

## Exemptions

Les **Super Admins** sont exemptés de la plupart des rate limiters (sauf `authRateLimiter` et `publicRateLimiter`) pour permettre la gestion administrative sans restrictions.

## Configuration

Les limites peuvent être ajustées dans `src/middleware/rateLimiter.ts` :

```typescript
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Fenêtre de temps
  max: 100, // Nombre maximum de requêtes
  // ...
});
```

## Tests

Pour tester le rate limiting :

1. **Auth Rate Limiter** : Essayer de se connecter 6 fois en moins de 15 minutes
2. **AI Rate Limiter** : Faire 11 requêtes IA en moins d'une minute
3. **General Rate Limiter** : Faire 101 requêtes API en moins de 15 minutes

## Notes importantes

- Les rate limiters sont appliqués **avant** les autres middlewares d'authentification
- Les clés de rate limiting utilisent l'ID utilisateur si authentifié, sinon l'IP
- Les rate limiters sont en mémoire par défaut (redémarrer le serveur réinitialise les compteurs)
- Pour la production, considérer l'utilisation d'un store Redis pour le rate limiting distribué

