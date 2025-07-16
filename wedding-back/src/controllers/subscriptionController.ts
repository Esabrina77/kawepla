import { Request, Response } from 'express';
import { StripeService } from '../services/stripeService';

export class SubscriptionController {
  /**
   * Obtenir tous les plans disponibles
   */
  static async getPlans(req: Request, res: Response) {
    try {
      const plans = StripeService.getAllPlans();
      res.json(plans);
    } catch (error) {
      console.error('Erreur lors de la récupération des plans:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des plans' });
    }
  }

  /**
   * Créer une session de checkout (retourne l'URL de la session)
   */
  static async createCheckoutSession(req: Request, res: Response) {
    try {
      const { planId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }

      if (!planId) {
        return res.status(400).json({ error: 'Plan ID requis' });
      }

      const successUrl = `${process.env.FRONTEND_URL}/client/billing`;
      const cancelUrl = `${process.env.FRONTEND_URL}/client/billing`;

      const session = await StripeService.createCheckoutSession(
        userId,
        planId,
        successUrl,
        cancelUrl
      );

      res.json(session);
    } catch (error) {
      console.error('Erreur lors de la création de la session:', error);
      res.status(500).json({ error: 'Erreur lors de la création de la session de paiement' });
    }
  }

  /**
   * Confirmer le paiement
   */
  static async confirmPayment(req: Request, res: Response) {
    try {
      const { planId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }

      if (!planId) {
        return res.status(400).json({ error: 'Plan ID requis' });
      }

      const result = await StripeService.changePlanDirectly(userId, planId);
      res.json(result);
    } catch (error) {
      console.error('Erreur lors de la confirmation du paiement:', error);
      res.status(500).json({ error: 'Erreur lors de la confirmation du paiement' });
    }
  }

  /**
   * Obtenir les services supplémentaires
   */
  static async getAdditionalServices(req: Request, res: Response) {
    try {
      const services = StripeService.getAdditionalServices();
      res.json(services);
    } catch (error) {
      console.error('Erreur lors de la récupération des services supplémentaires:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des services supplémentaires' });
    }
  }

  /**
   * Créer une session de checkout pour un service supplémentaire
   */
  static async createAdditionalServiceCheckoutSession(req: Request, res: Response) {
    try {
      const { serviceId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }

      if (!serviceId) {
        return res.status(400).json({ error: 'Service ID requis' });
      }

      const successUrl = `${process.env.FRONTEND_URL}/client/billing`;
      const cancelUrl = `${process.env.FRONTEND_URL}/client/billing`;

      const session = await StripeService.createAdditionalServiceCheckoutSession(
        userId,
        serviceId,
        successUrl,
        cancelUrl
      );

      res.json(session);
    } catch (error) {
      console.error('Erreur lors de la création de la session pour le service supplémentaire:', error);
      res.status(500).json({ error: 'Erreur lors de la création de la session de paiement' });
    }
  }

  /**
   * Gérer les webhooks Stripe
   */
  static async handleWebhook(req: Request, res: Response) {
    try {
      const payload = req.body;
      
      await StripeService.handleWebhook(payload);
      res.json({ received: true });
    } catch (error) {
      console.error('Erreur lors du traitement du webhook:', error);
      res.status(400).json({ error: 'Erreur lors du traitement du webhook' });
    }
  }

  /**
   * Changer de plan
   */
  static async changePlan(req: Request, res: Response) {
    try {
      const { planId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }

      if (!planId) {
        return res.status(400).json({ error: 'Plan ID requis' });
      }

      const result = await StripeService.changePlanDirectly(userId, planId);
      res.json(result);
    } catch (error) {
      console.error('Erreur lors du changement de plan:', error);
      res.status(500).json({ error: 'Erreur lors du changement de plan' });
    }
  }
} 