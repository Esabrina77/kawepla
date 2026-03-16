# 🧪 Test du Rate Limiting - Guide Rapide

## Prérequis

1. **Démarrer le serveur backend** :
```bash
cd wedding-back
npm run dev
```

Le serveur doit démarrer sur `http://localhost:3013`

## Test Rapide avec PowerShell

### Test 1: Rate Limiter Auth (5 tentatives max)

Ouvrez un nouveau terminal PowerShell et exécutez :

```powershell
# Test du rate limiter auth avec 8 tentatives de login
for ($i=1; $i -le 8; $i++) {
    Write-Host "`n=== Tentative $i ===" -ForegroundColor Cyan
    $response = Invoke-RestMethod -Uri "http://localhost:3013/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"email":"test@example.com","password":"wrong"}' `
        -ErrorAction SilentlyContinue
    
    if ($LASTEXITCODE -eq 429 -or $response.error) {
        Write-Host "❌ Rate Limited (429)" -ForegroundColor Red
        Write-Host "   Message: $($response.error)" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Requête acceptée" -ForegroundColor Green
    }
    Start-Sleep -Milliseconds 300
}
```

**Résultat attendu** :
- ✅ Les 5 premières requêtes sont acceptées (même avec mauvais identifiants)
- ❌ Les requêtes 6, 7, 8 retournent `429 Too Many Requests`

### Test 2: Rate Limiter Général (100 requêtes max)

```powershell
# Tester avec une route simple (nécessite authentification)
$token = "VOTRE_TOKEN_JWT_ICI" # Remplacez par un vrai token

for ($i=1; $i -le 105; $i++) {
    Write-Host "Requête $i" -NoNewline
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3013/api/designs" `
            -Method GET `
            -Headers @{"Authorization"="Bearer $token"} `
            -ErrorAction Stop
        Write-Host " ✅" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode -eq 429) {
            Write-Host " ❌ Rate Limited" -ForegroundColor Red
        } else {
            Write-Host " ⚠️  Erreur: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    if ($i % 10 -eq 0) {
        Write-Host "   Pause de 1 seconde..." -ForegroundColor Gray
        Start-Sleep -Seconds 1
    } else {
        Start-Sleep -Milliseconds 50
    }
}
```

### Test 3: Rate Limiter Public RSVP (50 requêtes max)

```powershell
# Test sans authentification
for ($i=1; $i -le 55; $i++) {
    Write-Host "Requête RSVP $i" -NoNewline
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3013/api/rsvp/invalid-token" `
            -Method GET `
            -ErrorAction Stop
        Write-Host " ✅ ($($response.StatusCode))" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode -eq 429) {
            Write-Host " ❌ Rate Limited (429)" -ForegroundColor Red
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "   $responseBody" -ForegroundColor Yellow
        } else {
            Write-Host " ⚠️  ($($_.Exception.Response.StatusCode))" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Milliseconds 100
}
```

## Test avec le Script Automatisé

### Option 1: Script Node.js simple

```bash
npm run test:rate-limit:simple
```

### Option 2: Script TypeScript complet

```bash
npm run test:rate-limit
```

## Vérification des Headers

Les réponses incluent des headers de rate limiting. Pour les voir :

```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3013/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"email":"test@example.com","password":"wrong"}'

$response.Headers['ratelimit-limit']
$response.Headers['ratelimit-remaining']
$response.Headers['ratelimit-reset']
```

## Test avec Postman/Thunder Client

1. Créez une collection avec 8 requêtes POST vers `/api/auth/login`
2. Utilisez "Run Collection" avec un délai de 200ms entre les requêtes
3. Vérifiez que les requêtes 6-8 retournent `429`

## Résultats Attendus

### Rate Limiter Auth
- ✅ 5 premières requêtes : Acceptées (même avec erreur de validation)
- ❌ Requêtes suivantes : `429 Too Many Requests`

### Rate Limiter Général  
- ✅ 100 premières requêtes : Acceptées
- ❌ Requêtes suivantes : `429 Too Many Requests`

### Rate Limiter Public
- ✅ 50 premières requêtes : Acceptées
- ❌ Requêtes suivantes : `429 Too Many Requests`

## Réinitialisation

Les compteurs se réinitialisent automatiquement après :
- **Auth** : 15 minutes
- **Général** : 15 minutes  
- **Public** : 15 minutes
- **AI** : 1 minute

## Dépannage

Si les tests ne fonctionnent pas :

1. **Vérifier que le serveur est démarré** :
   ```bash
   curl http://localhost:3013/api/designs
   ```

2. **Vérifier les logs du serveur** pour voir les requêtes bloquées

3. **Redémarrer le serveur** pour réinitialiser les compteurs en mémoire

4. **Vérifier que le rate limiter est bien appliqué** dans `app.ts`

