/**
 * Script de nettoyage automatique des liens partageables non utilisés
 * Supprime les liens avec le statut SHARED après 10 minutes
 */
import { ShareableInvitationService } from '../services/shareableInvitationService';

async function cleanupUnusedShareableLinks() {
  console.log('🧹 Nettoyage des liens partageables non utilisés...');
  
  try {
    const deletedCount = await ShareableInvitationService.cleanupUnusedLinks();
    
    if (deletedCount > 0) {
      console.log(`✅ ${deletedCount} lien(s) partageable(s) supprimé(s)`);
    } else {
      console.log('ℹ️  Aucun lien à nettoyer');
    }
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
}

// Exécuter le nettoyage toutes les 10 minutes
const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes en millisecondes

console.log('🚀 Démarrage du service de nettoyage des liens partageables');
console.log(`⏱️  Intervalle de nettoyage: ${CLEANUP_INTERVAL / 1000 / 60} minutes`);

// Exécuter immédiatement puis répéter
cleanupUnusedShareableLinks();
setInterval(cleanupUnusedShareableLinks, CLEANUP_INTERVAL);

// Gérer l'arrêt propre du script
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du service de nettoyage');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du service de nettoyage');
  process.exit(0);
}); 