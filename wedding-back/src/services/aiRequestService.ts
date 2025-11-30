import { prisma } from '../lib/prisma';
import { StripeService } from './stripeService';
import { AIRequestType } from '@prisma/client';

export class AIRequestService {
  /**
   * Enregistrer une requête AI utilisée
   */
  static async recordAIRequest(userId: string, type: AIRequestType): Promise<void> {
    try {
      await prisma.aIRequest.create({
        data: {
          userId,
          type
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la requête AI:', error);
      // Ne pas bloquer si l'enregistrement échoue
    }
  }

  /**
   * Compter le nombre de requêtes AI utilisées par un utilisateur
   */
  static async getAIRequestCount(userId: string): Promise<number> {
    try {
      const count = await prisma.aIRequest.count({
        where: {
          userId
        }
      });
      return count;
    } catch (error) {
      console.error('Erreur lors du comptage des requêtes AI:', error);
      return 0;
    }
  }

  /**
   * Vérifier si l'utilisateur peut utiliser une requête AI
   */
  static async canUseAIRequest(userId: string): Promise<{ canUse: boolean; limit: number; used: number; remaining: number }> {
    try {
      // Récupérer les limites totales de l'utilisateur
      const totalLimits = await StripeService.getUserTotalLimits(userId);
      const limit = totalLimits.aiRequests || 0;

      // Compter les requêtes utilisées
      const used = await this.getAIRequestCount(userId);

      // Calculer le reste
      const remaining = Math.max(0, limit - used);

      return {
        canUse: remaining > 0,
        limit,
        used,
        remaining
      };
    } catch (error) {
      console.error('Erreur lors de la vérification des limites AI:', error);
      // En cas d'erreur, autoriser par défaut (pour ne pas bloquer l'utilisateur)
      return {
        canUse: true,
        limit: 0,
        used: 0,
        remaining: 0
      };
    }
  }
}

