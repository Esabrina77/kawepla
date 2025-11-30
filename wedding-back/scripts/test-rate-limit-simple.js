/**
 * Script de test simple pour le rate limiting
 * Usage: node scripts/test-rate-limit-simple.js
 * 
 * Teste le rate limiter auth avec 8 tentatives de login
 */

const API_URL = process.env.API_URL || 'http://localhost:3013';

async function testAuthRateLimit() {
  console.log('🧪 Test du Rate Limiter Auth');
  console.log(`📍 API URL: ${API_URL}\n`);
  console.log('Limite attendue: 5 tentatives par 15 minutes\n');
  console.log('='.repeat(60));

  let successCount = 0;
  let rateLimitedCount = 0;

  // Faire 8 tentatives de login (devrait bloquer après 5)
  for (let i = 1; i <= 8; i++) {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 429) {
        rateLimitedCount++;
        console.log(`❌ Tentative ${i}: Rate limited (429)`);
        console.log(`   Message: ${data.error || 'Trop de requêtes'}`);
        if (data.retryAfter) {
          console.log(`   Réessayer dans: ${data.retryAfter}`);
        }
      } else if (response.status === 400 || response.status === 401) {
        successCount++;
        console.log(`✅ Tentative ${i}: Requête acceptée (${response.status}) - Mauvais identifiants`);
      } else {
        console.log(`⚠️  Tentative ${i}: Status ${response.status}`);
      }

      // Afficher les headers de rate limiting si disponibles
      const limitHeader = response.headers.get('ratelimit-limit');
      const remainingHeader = response.headers.get('ratelimit-remaining');
      const resetHeader = response.headers.get('ratelimit-reset');

      if (limitHeader) {
        console.log(`   Headers: Limit=${limitHeader}, Remaining=${remainingHeader}, Reset=${resetHeader}`);
      }

    } catch (error) {
      console.log(`❌ Tentative ${i}: Erreur - ${error.message}`);
    }

    // Petit délai entre les requêtes
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Résultats:');
  console.log(`   Requêtes acceptées: ${successCount}`);
  console.log(`   Requêtes bloquées (429): ${rateLimitedCount}`);
  console.log(`   Total: ${successCount + rateLimitedCount}`);

  if (successCount <= 5 && rateLimitedCount > 0) {
    console.log('\n✅ Test réussi ! Le rate limiting fonctionne correctement.');
  } else {
    console.log('\n⚠️  Le rate limiting pourrait ne pas fonctionner comme attendu.');
    console.log('   Note: Si le serveur vient de démarrer, les compteurs sont vides.');
  }
}

// Exécuter le test
testAuthRateLimit().catch(console.error);

