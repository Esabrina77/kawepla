/**
 * Jobs de gestion des newsletters
 */
import { NewsletterStatus } from '@prisma/client';
import { NewsletterService } from '../services/newsletterService';
import { prisma } from '../lib/prisma';

export class NewsletterJobs {
  /**
   * Vérifier et envoyer les newsletters programmées
   * À exécuter chaque minute
   */
  static async processScheduledNewsletters() {
    try {
      // Trouver les newsletters programmées dont la date est passée
      const now = new Date();
      const scheduledNewsletters = await prisma.newsletter.findMany({
        where: {
          status: NewsletterStatus.SCHEDULED,
          scheduledAt: {
            lte: now,
          },
        },
      });

      if (scheduledNewsletters.length === 0) {
        return 0;
      }

      console.log(`📧 Newsletter job: ${scheduledNewsletters.length} newsletters programmées à envoyer`);

      // Envoyer chaque newsletter
      for (const newsletter of scheduledNewsletters) {
        try {
          console.log(`📤 Envoi de la newsletter programmée: ${newsletter.title} (ID: ${newsletter.id})`);
          await NewsletterService.sendNewsletter(newsletter.id);
        } catch (error) {
          console.error(`❌ Erreur lors de l'envoi de la newsletter programmée ${newsletter.id}:`, error);
        }
      }

      return scheduledNewsletters.length;
    } catch (error) {
      console.error('❌ Erreur lors du traitement des newsletters programmées:', error);
      return 0;
    }
  }
}
