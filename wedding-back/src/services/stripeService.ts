import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export interface SubscriptionPlan {
  id: SubscriptionTier;
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
    id: 'DESIGN_PREMIUM',
    name: 'Design premium supplémentaire',
    description: 'Accédez à un design premium exclusif',
    price: 20,
    paymentLink: process.env.STRIPE_PAYMENT_LINK_DESIGN_PREMIUM || 'https://buy.stripe.com/test_design_premium',
    type: 'designs',
    quantity: 1
  }
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
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
      guests: 10,
      photos: 0,
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
   * Calculer les limites totales d'un utilisateur (plan + services supplémentaires)
   */
  static async getUserTotalLimits(userId: string, tier: string) {
    try {
      // Récupérer les limites de base du plan
      const baseLimits = this.getPlanDetails(tier as any)?.limits || {
        invitations: 1,
        guests: 10,
        photos: 0,
        designs: 1
      };

      // Récupérer les services supplémentaires
      const additionalServices = await this.getUserAdditionalServices(userId);

      // Calculer les bonus
      let bonusGuests = 0;
      let bonusPhotos = 0;
      let bonusDesigns = 0;

      for (const service of additionalServices) {
        switch (service.type) {
          case 'guests':
            bonusGuests += service.quantity;
            break;
          case 'photos':
            bonusPhotos += service.quantity;
            break;
          case 'designs':
            bonusDesigns += service.quantity;
            break;
        }
      }

      // Retourner les limites totales
      return {
        invitations: baseLimits.invitations,
        guests: baseLimits.guests + bonusGuests,
        photos: baseLimits.photos + bonusPhotos,
        designs: baseLimits.designs + bonusDesigns
      };
    } catch (error) {
      console.error('Erreur lors du calcul des limites totales:', error);
      // Retourner les limites de base en cas d'erreur
      return this.getPlanDetails(tier as any)?.limits || {
        invitations: 1,
        guests: 10,
        photos: 0,
        designs: 1
      };
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

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === user.subscriptionTier);
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
  static getPlanDetails(tier: SubscriptionTier) {
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
            console.log(`✅ Paiement confirmé pour l'utilisateur ${userId}, plan ${planId}`);
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
   * Changer de forfait directement
   */
  static async changePlanDirectly(userId: string, newTier: string) {
    try {
      console.log(`🔍 ChangePlanDirectly - Début pour userId: ${userId}, newTier: ${newTier}`);
      
      const plan = this.getPlanDetails(newTier as any);
      if (!plan) {
        throw new Error('Plan non trouvé');
      }

      console.log(`🔍 Plan trouvé:`, plan);

      // Mettre à jour l'utilisateur avec toutes les informations nécessaires
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: plan.id,
          subscriptionStatus: 'ACTIVE',
          subscriptionEndDate: null, // Pas de date d'expiration pour les paiements uniques
          updatedAt: new Date()
        },
        select: {
          id: true,
          email: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          subscriptionEndDate: true,
          updatedAt: true
        }
      });

      console.log(`✅ Utilisateur mis à jour:`, updatedUser);

      // Chercher la subscription existante
      const existingSubscription = await prisma.subscription.findFirst({
        where: { userId: userId }
      });

      if (existingSubscription) {
        const updatedSubscription = await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            tier: plan.id,
            status: 'ACTIVE',
            updatedAt: new Date()
          }
        });
        console.log(`✅ Subscription mise à jour:`, updatedSubscription);
      } else {
        const newSubscription = await prisma.subscription.create({
          data: {
            userId: userId,
            tier: plan.id,
            status: 'ACTIVE',
            stripeCustomerId: '',
          }
        });
        console.log(`✅ Nouvelle subscription créée:`, newSubscription);
      }

      // Vérifier que la mise à jour a bien eu lieu
      const verificationUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          subscriptionEndDate: true
        }
      });

      console.log(`🔍 Vérification finale - Utilisateur après mise à jour:`, verificationUser);

      return { 
        success: true, 
        plan,
        user: verificationUser,
        message: `Forfait changé avec succès vers ${plan.name}`
      };
    } catch (error) {
      console.error('❌ Erreur lors du changement de forfait:', error);
      throw new Error('Erreur lors du changement de forfait');
    }
  }
} 