import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { ServiceTier, PurchaseStatus } from '@prisma/client';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    })
  : null;

export interface ServicePurchasePlan {
  id: ServiceTier;
  name: string;
  description: string;
  price: number;
  paymentLink: string; // URL du Payment Link Stripe
  features: string[];
  limits: {
    invitations: number;
    guests: number;
    photos: number;
    designs: number;
  };
}

// Services supplémentaires payants
export interface AdditionalService {
  id: string;
  name: string;
  description: string;
  price: number;
  paymentLink: string;
  type: 'guests' | 'photos' | 'designs';
  quantity: number;
}

export const ADDITIONAL_SERVICES: AdditionalService[] = [
  {
    id: 'GUESTS_30',
    name: 'Pack 30 invités supplémentaires',
    description: 'Ajoutez 30 invités supplémentaires à votre forfait',
    price: 15,
    paymentLink: process.env.STRIPE_PAYMENT_LINK_GUESTS_30 || 'https://buy.stripe.com/test_guests_30',
    type: 'guests',
    quantity: 30
  },
  {
    id: 'GUESTS_50',
    name: 'Pack 50 invités supplémentaires',
    description: 'Ajoutez 50 invités supplémentaires à votre forfait',
    price: 25,
    paymentLink: process.env.STRIPE_PAYMENT_LINK_GUESTS_50 || 'https://buy.stripe.com/test_guests_50',
    type: 'guests',
    quantity: 50
  },
  {
    id: 'PHOTOS_50',
    name: '50 photos supplémentaires',
    description: 'Ajoutez 50 photos supplémentaires à votre album',
    price: 15,
    paymentLink: process.env.STRIPE_PAYMENT_LINK_PHOTOS_50 || 'https://buy.stripe.com/test_photos_50',
    type: 'photos',
    quantity: 50
  },
  {
    id: 'DESIGN_ELEGANT',
    name: 'Design premium supplémentaire',
    description: 'Accédez à un design premium exclusif',
    price: 20,
    paymentLink: process.env.STRIPE_PAYMENT_LINK_DESIGN_ELEGANT || 'https://buy.stripe.com/test_design_premium',
    type: 'designs',
    quantity: 1
  }
];

export const SUBSCRIPTION_PLANS: ServicePurchasePlan[] = [
  {
    id: 'FREE',
    name: 'Découverte',
    description: 'Parfait pour tester',
    price: 0,
    paymentLink: '', // Pas de paiement pour le plan gratuit
    features: [
      '1 invitation personnalisable',
      'Jusqu\'à 10 invités',
      'RSVP basique',
      '1 design standard',
      'Support communautaire'
    ],
    limits: {
      invitations: 1,
      guests: 30,
      photos: 20,
      designs: 1
    }
  },
  {
    id: 'ESSENTIAL',
    name: 'Essentiel',
    description: 'Pour les petits mariages',
    price: 39,
    paymentLink: process.env.STRIPE_PAYMENT_LINK_ESSENTIAL || 'https://buy.stripe.com/test_essential',
    features: [
      '2 invitations personnalisables',
      'Jusqu\'à 75 invités',
      'RSVP avec préférences alimentaires',
      '5 designs premium',
      'Album photos (50 photos max)',
      'Support email'
    ],
    limits: {
      invitations: 2,
      guests: 75,
      photos: 50,
      designs: 5
    }
  },
  {
    id: 'ELEGANT',
    name: 'Élégant',
    description: 'Le plus populaire',
    price: 69,
    paymentLink: process.env.STRIPE_PAYMENT_LINK_ELEGANT || 'https://buy.stripe.com/test_elegant',
    features: [
      '3 invitations personnalisables',
      'Jusqu\'à 150 invités',
      'RSVP complet + messages',
      '10 designs premium',
      'Album photos (150 photos max)',
      'QR codes personnalisés',
      'Support prioritaire'
    ],
    limits: {
      invitations: 3,
      guests: 150,
      photos: 150,
      designs: 10
    }
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    description: 'Pour les grands mariages',
    price: 99,
    paymentLink: process.env.STRIPE_PAYMENT_LINK_PREMIUM || 'https://buy.stripe.com/test_premium',
    features: [
      '5 invitations personnalisables',
      'Jusqu\'à 300 invités',
      'Toutes les fonctionnalités RSVP',
      'Tous les designs premium',
      'Album photos (500 photos max)',
      'Analytics détaillées',
      'Support VIP'
    ],
    limits: {
      invitations: 5,
      guests: 300,
      photos: 500,
      designs: 20
    }
  },
  {
    id: 'LUXE',
    name: 'Luxe',
    description: 'L\'expérience ultime',
    price: 149,
    paymentLink: process.env.STRIPE_PAYMENT_LINK_LUXE || 'https://buy.stripe.com/test_luxe',
    features: [
      '10 invitations personnalisables',
      'Jusqu\'à 500 invités',
      'Album photos (1000 photos max)',
      'Tous les designs + personnalisations',
      'Accès bêta aux nouvelles fonctionnalités'
    ],
    limits: {
      invitations: 10,
      guests: 500,
      photos: 1000,
      designs: 50
    }
  }
];

export class StripeService {
  /**
   * Créer une session de checkout Stripe
   */
  static async createCheckoutSession(
    userId: string,
    planId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan non trouvé');
      }

      if (plan.price === 0) {
        // Plan gratuit - changement direct
        await this.changePlanDirectly(userId, planId);
        return {
          url: successUrl,
          sessionId: null
        };
      }

      // Vérifier que Stripe est configuré
      if (!stripe) {
        throw new Error('Stripe n\'est pas configuré. Veuillez définir STRIPE_SECRET_KEY dans les variables d\'environnement.');
      }

      // Créer une session de checkout Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Forfait ${plan.name}`,
                description: plan.description,
              },
              unit_amount: plan.price * 100, // Stripe utilise les centimes
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${successUrl}?success=true&plan=${planId}`,
        cancel_url: `${cancelUrl}?canceled=true`,
        metadata: {
          userId,
          planId,
        },
      });

      return {
        url: session.url,
        sessionId: session.id
      };
    } catch (error) {
      console.error('Erreur lors de la création de la session Stripe:', error);
      throw new Error('Erreur lors de la création de la session de paiement');
    }
  }

  /**
   * Créer une session de checkout pour un service supplémentaire
   */
  static async createAdditionalServiceCheckoutSession(
    userId: string,
    serviceId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    try {
      const service = ADDITIONAL_SERVICES.find(s => s.id === serviceId);
      if (!service) {
        throw new Error('Service non trouvé');
      }

      // Vérifier que Stripe est configuré
      if (!stripe) {
        throw new Error('Stripe n\'est pas configuré. Veuillez définir STRIPE_SECRET_KEY dans les variables d\'environnement.');
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: service.name,
                description: service.description,
              },
              unit_amount: service.price * 100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${successUrl}?success=true&service=${serviceId}`,
        cancel_url: `${cancelUrl}?canceled=true`,
        metadata: {
          userId,
          serviceId,
          type: 'additional_service'
        },
      });

      return {
        url: session.url,
        sessionId: session.id
      };
    } catch (error) {
      console.error('Erreur lors de la création de la session pour service supplémentaire:', error);
      throw new Error('Erreur lors de la création de la session de paiement');
    }
  }

  /**
   * Appliquer un service supplémentaire à un utilisateur
   * TODO: Implémenter la table additionalService dans Prisma
   */
  static async applyAdditionalService(userId: string, serviceId: string) {
    try {
      const service = ADDITIONAL_SERVICES.find(s => s.id === serviceId);
      if (!service) {
        throw new Error('Service non trouvé');
      }

      // Créer la table si elle n'existe pas
      await this.ensureAdditionalServicesTable();

      // Insérer le service acheté
      await prisma.$executeRaw`
        INSERT INTO user_additional_services (id, "userId", "serviceId", quantity, type, "createdAt")
        VALUES (${this.generateId()}, ${userId}, ${serviceId}, ${service.quantity}, ${service.type}, NOW())
      `;

      console.log(`Service supplémentaire appliqué: ${service.name} pour l'utilisateur ${userId}`);
      
      return { success: true, service };
    } catch (error) {
      console.error('Erreur lors de l\'application du service supplémentaire:', error);
      throw new Error('Erreur lors de l\'application du service supplémentaire');
    }
  }

  /**
   * Créer la table des services supplémentaires si elle n'existe pas
   */
  private static async ensureAdditionalServicesTable() {
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS user_additional_services (
          id TEXT PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "serviceId" TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          type TEXT NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
          FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
        );
      `;
    } catch (error) {
      console.error('Erreur lors de la création de la table:', error);
    }
  }

  /**
   * Générer un ID unique
   */
  private static generateId(): string {
    return `cm${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtenir les services supplémentaires d'un utilisateur
   */
  static async getUserAdditionalServices(userId: string) {
    try {
      await this.ensureAdditionalServicesTable();
      
      const result = await prisma.$queryRaw`
        SELECT * FROM user_additional_services 
        WHERE "userId" = ${userId}
      ` as any[];

      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des services supplémentaires:', error);
      return [];
    }
  }

  /**
   * Calculer les limites totales d'un utilisateur (tous les achats + services supplémentaires)
   */
  static async getUserTotalLimits(userId: string) {
    try {
      // Récupérer tous les achats de l'utilisateur
      const userPurchases = await prisma.servicePurchase.findMany({
        where: { 
          userId: userId,
          status: 'ACTIVE'
        }
      });

      // Récupérer les services supplémentaires
      const additionalServices = await this.getUserAdditionalServices(userId);

      // TOUJOURS commencer avec les limites FREE de base
      const freeLimits = this.getPlanDetails('FREE')?.limits || {
        invitations: 1,
        guests: 30,
        photos: 20,
        designs: 1
      };

      let totalLimits = {
        invitations: freeLimits.invitations,
        guests: freeLimits.guests,
        photos: freeLimits.photos,
        designs: freeLimits.designs
      };

      // AJOUTER les limites de chaque achat payant
      for (const purchase of userPurchases) {
        const planLimits = this.getPlanDetails(purchase.tier)?.limits;
        if (planLimits) {
          totalLimits.invitations += planLimits.invitations * purchase.quantity;
          totalLimits.guests += planLimits.guests * purchase.quantity;
          totalLimits.photos += planLimits.photos * purchase.quantity;
          totalLimits.designs += planLimits.designs * purchase.quantity;
        }
      }

      // Ajouter les services supplémentaires
      for (const service of additionalServices) {
        switch (service.type) {
          case 'guests':
            totalLimits.guests += service.quantity;
            break;
          case 'photos':
            totalLimits.photos += service.quantity;
            break;
          case 'designs':
            totalLimits.designs += service.quantity;
            break;
        }
      }

      return totalLimits;
    } catch (error) {
      console.error('Erreur lors du calcul des limites totales:', error);
      // Retourner les limites gratuites en cas d'erreur
      return this.getPlanDetails('FREE')?.limits || {
        invitations: 1,
        guests: 30,
        photos: 20,
        designs: 1
      };
    }
  }

  /**
   * Obtenir le tier actuel basé sur les achats
   */
  static async getUserCurrentTier(userId: string): Promise<ServiceTier> {
    try {
      const userPurchases = await prisma.servicePurchase.findMany({
        where: { 
          userId: userId,
          status: 'ACTIVE'
        },
        orderBy: { purchasedAt: 'desc' }
      });

      if (userPurchases.length === 0) {
        return 'FREE';
      }

      // Retourner le tier le plus élevé acheté
      const tiers = userPurchases.map(p => p.tier);
      if (tiers.includes('LUXE')) return 'LUXE';
      if (tiers.includes('PREMIUM')) return 'PREMIUM';
      if (tiers.includes('ELEGANT')) return 'ELEGANT';
      if (tiers.includes('ESSENTIAL')) return 'ESSENTIAL';
      
      return 'FREE';
    } catch (error) {
      console.error('Erreur lors de la récupération du tier:', error);
      return 'FREE';
    }
  }

  /**
   * Obtenir les services supplémentaires disponibles
   */
  static getAdditionalServices() {
    return ADDITIONAL_SERVICES;
  }



  /**
   * Vérifier les limites d'un utilisateur
   */
  static async checkUserLimits(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        invitations: true,
        guests: true,
      }
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Utiliser le tier actuel basé sur les achats
    const currentTier = await this.getUserCurrentTier(userId);
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === currentTier);
    if (!plan) {
      throw new Error('Plan non trouvé');
    }

    return {
      plan,
      current: {
        invitations: user.invitations.length,
        guests: user.guests.length,
        photos: 0,
        designs: 0,
      },
      canCreate: {
        invitation: user.invitations.length < plan.limits.invitations,
        guest: user.guests.length < plan.limits.guests,
        photo: true,
        design: true,
      }
    };
  }

  /**
   * Obtenir les détails d'un plan
   */
  static getPlanDetails(tier: ServiceTier) {
    return SUBSCRIPTION_PLANS.find(p => p.id === tier);
  }

  /**
   * Traiter les webhooks Stripe
   */
  static async handleWebhook(event: any) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          const { userId, planId, serviceId, type } = session.metadata;
          
                     if (userId && planId) {
             console.log(`✅ Paiement confirmé pour l'utilisateur ${userId}, pack ${planId}`);
             await this.changePlanDirectly(userId, planId);
           } else if (userId && serviceId && type === 'additional_service') {
            console.log(`✅ Paiement confirmé pour l'utilisateur ${userId}, service ${serviceId}`);
            await this.applyAdditionalService(userId, serviceId);
          }
          break;
        
        default:
          console.log(`Webhook non géré: ${event.type}`);
      }
    } catch (error) {
      console.error('Erreur lors du traitement du webhook:', error);
      throw error;
    }
  }

  /**
   * Obtenir tous les plans
   */
  static getAllPlans() {
    return SUBSCRIPTION_PLANS;
  }

  /**
   * Acheter un pack directement
   */
  static async changePlanDirectly(userId: string, newTier: string) {
    try {
      console.log(`🔍 ChangePlanDirectly - Début pour userId: ${userId}, newTier: ${newTier}`);
      
      const plan = this.getPlanDetails(newTier as any);
      if (!plan) {
        throw new Error('Plan non trouvé');
      }

      console.log(`🔍 Plan trouvé:`, plan);

      // Créer un nouvel achat (pas de mise à jour de l'utilisateur)
      // Générer un ID unique pour éviter les conflits de contrainte unique
      const testPaymentId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newServicePurchase = await prisma.servicePurchase.create({
        data: {
          userId: userId,
          tier: plan.id,
          status: 'ACTIVE',
          stripePaymentId: testPaymentId,
        }
      });

      console.log(`✅ Nouvel achat créé:`, newServicePurchase);

      // Créer une entrée dans l'historique des achats
      const purchaseHistoryEntry = await prisma.purchaseHistory.create({
        data: {
          userId: userId,
          tier: plan.id,
          quantity: 1,
          price: plan.price,
          currency: 'EUR',
          stripePaymentId: testPaymentId, // ID unique pour éviter les conflits
        }
      });

      console.log(`✅ Entrée d'historique créée:`, purchaseHistoryEntry);

      return { 
        success: true, 
        plan,
        purchase: newServicePurchase,
        message: `Pack ${plan.name} acheté avec succès`
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'achat du pack:', error);
      throw new Error('Erreur lors de l\'achat du pack');
    }
  }
} 