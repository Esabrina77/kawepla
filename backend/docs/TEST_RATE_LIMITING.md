# Guide de Test du Rate Limiting

## Tests Manuels

### 1. Test du Rate Limiter Auth (Login)

**Limite** : 5 tentatives par 15 minutes

```bash
# Tester avec curl (Windows PowerShell)
for ($i=1; $i -le 8; $i++) {
    Write-Host "Tentative $i"
    curl -X POST http://localhost:3013/api/auth/login `
        -H "Content-Type: application/json" `
        -d '{\"email\":\"test@example.com\",\"password\":\"wrong\"}'
    Start-Sleep -Milliseconds 200
}
```

**Résultat attendu** :
- Les 5 premières requêtes retournent `400` ou `401` (mauvais identifiants)
- Les requêtes suivantes retournent `429 Too Many Requests`

### 2. Test du Rate Limiter AI

**Limite** : 10 requêtes par minute

```bash
# Avec un token d'authentification valide
$token = "VOTRE_TOKEN_JWT"

for ($i=1; $i -le 12; $i++) {
    Write-Host "Requête IA $i"
    curl -X POST http://localhost:3013/api/ai/generate-checklist `
        -H "Content-Type: application/json" `
        -H "Authorization: Bearer $token" `
        -d '{\"invitationId\":\"test\",\"guestCount\":10,\"budget\":1000}'
    Start-Sleep -Milliseconds 100
}
```

**Résultat attendu** :
- Les 10 premières requêtes fonctionnent (ou retournent des erreurs de validation)
- Les requêtes suivantes retournent `429 Too Many Requests`

### 3. Test du Rate Limiter Général

**Limite** : 100 requêtes par 15 minutes

```bash
# Tester avec une route simple
for ($i=1; $i -le 105; $i++) {
    Write-Host "Requête $i"
    curl -X GET http://localhost:3013/api/designs `
        -H "Authorization: Bearer $token"
    Start-Sleep -Milliseconds 50
}
```

**Résultat attendu** :
- Les 100 premières requêtes fonctionnent
- Les requêtes suivantes retournent `429 Too Many Requests`

### 4. Test du Rate Limiter Public (RSVP)

**Limite** : 50 requêtes par 15 minutes

```bash
for ($i=1; $i -le 55; $i++) {
    Write-Host "Requête RSVP $i"
    curl -X GET http://localhost:3013/api/rsvp/invalid-token
    Start-Sleep -Milliseconds 100
}
```

## Test Automatisé

Utiliser le script de test :

```bash
npm run test:rate-limit
```

Le script teste automatiquement :
- Rate limiter général
- Rate limiter auth
- Rate limiter public

## Vérification des Headers

Les réponses incluent des headers de rate limiting :

```
RateLimit-Limit: 5
RateLimit-Remaining: 3
RateLimit-Reset: 1234567890
```

## Réinitialisation

Les compteurs se réinitialisent automatiquement après la fenêtre de temps :
- **Auth** : 15 minutes
- **AI** : 1 minute
- **Général** : 15 minutes
- **Public** : 15 minutes

## Notes

- Les Super Admins sont exemptés de la plupart des rate limiters
- Les rate limiters utilisent l'ID utilisateur si authentifié, sinon l'IP
- En développement, les compteurs sont en mémoire (redémarrer le serveur les réinitialise)

