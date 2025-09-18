/**
 * Jobs de nettoyage automatique
 */
import { ShareableInvitationService } from '../services/shareableInvitationService';

export class CleanupJobs {
  /**
   * Nettoyer les liens partageables expirés
   * À exécuter toutes les 5 minutes
   */
  static async cleanupExpiredShareableLinks() {
    try {
      const deletedCount = await ShareableInvitationService.cleanupUnusedLinks();
      
      if (deletedCount > 0) {
        console.log(`🧹 Cleanup job: ${deletedCount} liens partageables expirés supprimés`);
      }
      
      return deletedCount;
    } catch (error) {
      console.error('❌ Erreur lors du cleanup des liens partageables:', error);
      return 0;
    }
  }

  /**
   * Exécuter tous les jobs de nettoyage
   */
  static async runAllCleanupJobs() {
    console.log('🔄 Démarrage des jobs de nettoyage...');
    
    const results = await Promise.allSettled([
      this.cleanupExpiredShareableLinks()
    ]);

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ Jobs de nettoyage terminés: ${successCount} succès, ${failureCount} échecs`);
    
    return {
      success: successCount,
      failures: failureCount,
      results
    };
  }
}
