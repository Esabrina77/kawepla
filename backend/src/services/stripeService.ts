import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { ServicePack, ServicePackType, ServiceTier } from '@prisma/client';
import { ServicePackService } from './servicePackService';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    })
  : null;

export interface ServicePurchasePlan {
  id: string;
  slug: string;
  tier?: ServiceTier | null;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  features: string[];
  isHighlighted?: boolean;
  limits: {
    invitations: number;
    guests: number;
    photos: number;
    designs: number;
    aiRequests: number;
  };
}

export interface AdditionalService {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: 'guests' | 'photos' | 'designs' | 'aiRequests' | 'invitations';
  quantity: number;
  unit?: string | null;
}

const mapPackToPlan = (pack: ServicePack): ServicePurchasePlan => ({
  id: pack.id,
  slug: pack.slug,
  tier: pack.tier,
  name: pack.name,
  description: pack.description,
  price: pack.price,
  currency: pack.currency,
  features: pack.features || [],
  isHighlighted: pack.isHighlighted,
  limits: {
    invitations: pack.invitations ?? 0,
    guests: pack.guests ?? 0,
    photos: pack.photos ?? 0,
    designs: pack.designs ?? 0,
    aiRequests: pack.aiRequests ?? 0
  }
});

const mapPackToAddon = (pack: ServicePack): AdditionalService => ({
  id: pack.id,
  slug: pack.slug,
  name: pack.name,
  description: pack.description || '',
  price: pack.price,
  currency: pack.currency,
    type: (pack.unit === 'PHOTO' ? 'photos'
      : pack.unit === 'INVITATION' ? 'invitations'
      : pack.unit === 'DESIGN' ? 'designs'
      : pack.unit === 'AI_REQUEST' ? 'aiRequests'
      : 'guests'),
  quantity: pack.quantity ?? 0,
  unit: pack.unit
});

const resolveBasePack = async (identifier: string): Promise<ServicePack | null> => {
  if (!identifier) return null;

  const byId = await ServicePackService.getById(identifier);
  if (byId && byId.type === ServicePackType.BASE) {
    return byId;
  }

  const normalized = identifier.toLowerCase();
  const bySlug = await ServicePackService.getBySlug(normalized);
  if (bySlug && bySlug.type === ServicePackType.BASE) {
    return bySlug;
  }

  if ((Object.values(ServiceTier) as string[]).includes(identifier)) {
    const byTier = await ServicePackService.getByTier(identifier as ServiceTier);
    if (byTier) {
      return byTier;
    }
  }

  return null;
};

const resolveAddonPack = async (identifier: string): Promise<ServicePack | null> => {
  if (!identifier) return null;

  const byId = await ServicePackService.getById(identifier);
  if (byId && byId.type === ServicePackType.ADDON) {
    return byId;
  }

  const normalized = identifier.toLowerCase();
  const bySlug = await ServicePackService.getBySlug(normalized);
  if (bySlug && bySlug.type === ServicePackType.ADDON) {
    return bySlug;
  }

  return null;
};

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
      const pack = await resolveBasePack(planId);
      if (!pack) {
        throw new Error('Plan non trouvé');
      }

      if (pack.price === 0) {
        // Plan gratuit - changement direct
        await this.changePlanDirectly(userId, pack.id);
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
                name: `Forfait ${pack.name}`,
                description: pack.description ?? undefined,
              },
              unit_amount: Math.round(pack.price * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${successUrl}?success=true&plan=${pack.id}`,
        cancel_url: `${cancelUrl}?canceled=true`,
        metadata: {
          userId,
          planId: pack.id,
          servicePackId: pack.id,
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
      const pack = await resolveAddonPack(serviceId);
      if (!pack) {
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
                name: pack.name,
                description: pack.description ?? undefined,
              },
              unit_amount: Math.round(pack.price * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${successUrl}?success=true&service=${pack.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${cancelUrl}?canceled=true`,
        metadata: {
          userId,
          serviceId: pack.id,
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
   */
  static async applyAdditionalService(userId: string, serviceId: string, stripeSessionId?: string) {
    try {
      const servicePack = await resolveAddonPack(serviceId);
      if (!servicePack) {
        throw new Error('Service non trouvé');
      }

      // Utiliser une transaction avec retry pour gérer les deadlocks
      let wasAlreadyApplied = false;
      let retries = 3;
      
      while (retries > 0) {
        try {
          wasAlreadyApplied = await prisma.$transaction(async (tx) => {
        // Vérifier si le service a déjà été appliqué récemment (dans les 30 dernières secondes)
        // Fenêtre très courte pour éviter les doublons entre webhook et confirmation manuelle
        const recentService = await tx.userAdditionalService.findFirst({
          where: {
            userId: userId,
            servicePackId: servicePack.id,
            createdAt: {
              gte: new Date(Date.now() - 30 * 1000) // 30 secondes seulement
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        if (recentService) {
          const secondsAgo = Math.round((Date.now() - recentService.createdAt.getTime()) / 1000);
          console.log(`⚠️ Service ${servicePack.name} déjà appliqué récemment (${secondsAgo}s) pour l'utilisateur ${userId}, évitement du doublon`);
          return true; // Déjà appliqué
        }

        // Vérifier aussi dans purchase_history pour être sûr
        // Si on a un stripeSessionId, vérifier avec celui-ci pour une détection plus précise
        const purchaseWhere: any = {
          userId: userId,
          servicePackId: servicePack.id,
          purchasedAt: {
            gte: new Date(Date.now() - 30 * 1000) // 30 secondes
          }
        };
        
        // Si on a un sessionId, vérifier aussi avec celui-ci
        if (stripeSessionId) {
          purchaseWhere.stripePaymentId = {
            contains: stripeSessionId
          };
        }
        
        const recentPurchase = await tx.purchaseHistory.findFirst({
          where: purchaseWhere
        });

        if (recentPurchase) {
          console.log(`⚠️ Achat déjà enregistré dans purchase_history pour ${servicePack.name} (${Math.round((Date.now() - recentPurchase.purchasedAt.getTime()) / 1000)}s), évitement du doublon`);
          return true; // Déjà appliqué
        }

        // Créer l'entrée dans user_additional_services
        // quantity = nombre de fois qu'on a acheté ce pack (1 par défaut)
        try {
          await tx.userAdditionalService.create({
            data: {
              userId: userId,
              serviceId: servicePack.slug,
              servicePackId: servicePack.id,
              quantity: 1, // Nombre de fois qu'on a acheté ce pack, pas la quantité du pack
              type: servicePack.unit ?? 'ADDON'
            }
          });
        } catch (error: any) {
          // Si erreur de contrainte unique ou doublon, considérer comme déjà appliqué
          if (error.code === 'P2002' || error.message?.includes('Unique constraint')) {
            console.log(`⚠️ Contrainte unique violée pour ${servicePack.name}, service déjà appliqué`);
            return true;
          }
          throw error;
        }

        // Créer une entrée dans purchase_history pour tracer l'achat
        // Inclure le sessionId dans stripePaymentId pour éviter les doublons
        const paymentId = stripeSessionId 
          ? `addon_${stripeSessionId}_${Date.now()}`
          : `addon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        try {
          await tx.purchaseHistory.create({
            data: {
              userId: userId,
              tier: null, // Les add-ons n'ont pas de tier
              servicePackId: servicePack.id,
              quantity: 1,
              price: servicePack.price,
              currency: servicePack.currency,
              stripePaymentId: paymentId
            }
          });
        } catch (error: any) {
          // Si erreur de contrainte unique ou doublon, considérer comme déjà appliqué
          if (error.code === 'P2002' || error.message?.includes('Unique constraint')) {
            console.log(`⚠️ Contrainte unique violée dans purchase_history pour ${servicePack.name}, achat déjà enregistré`);
            return true;
          }
          throw error;
        }

            return false; // Nouvellement appliqué
          }, {
            isolationLevel: 'ReadCommitted', // Isolation moins stricte pour éviter les deadlocks
            timeout: 5000 // 5 secondes de timeout
          });
          
          break; // Succès, sortir de la boucle
        } catch (error: any) {
          // Si erreur de deadlock (P2034), réessayer
          if (error.code === 'P2034' && retries > 1) {
            retries--;
            console.log(`⚠️ Deadlock détecté, nouvelle tentative (${retries} restantes)...`);
            await new Promise(resolve => setTimeout(resolve, 100 * (4 - retries))); // Délai exponentiel
            continue;
          }
          // Si autre erreur ou plus de retries, propager l'erreur
          throw error;
        }
      }

      // Si le service était déjà appliqué, retourner directement
      if (wasAlreadyApplied) {
        return { 
          success: true, 
          service: mapPackToAddon(servicePack), 
          alreadyApplied: true,
          message: `Le service "${servicePack.name}" a déjà été appliqué à votre compte.`
        };
      }

      console.log(`✅ Service supplémentaire appliqué: ${servicePack.name} pour l'utilisateur ${userId}`);
      console.log(`   Quantité ajoutée: ${servicePack.quantity} ${servicePack.unit}`);
      
      return { 
        success: true, 
        service: mapPackToAddon(servicePack),
        message: `Le service "${servicePack.name}" a été ajouté à votre compte avec succès.`
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'application du service supplémentaire:', error);
      throw new Error('Erreur lors de l\'application du service supplémentaire');
    }
  }


  /**
   * Obtenir les services supplémentaires d'un utilisateur
   */
  static async getUserAdditionalServices(userId: string) {
    try {
      return await prisma.userAdditionalService.findMany({
        where: { userId },
        include: {
          servicePack: true
        }
      });
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
      const [userPurchases, additionalServices, freePack] = await Promise.all([
        prisma.servicePurchase.findMany({
          where: {
            userId,
            status: 'ACTIVE'
          },
          include: {
            servicePack: true
          }
        }),
        this.getUserAdditionalServices(userId),
        ServicePackService.getByTier('FREE')
      ]);

      const defaultLimits = freePack
        ? mapPackToPlan(freePack).limits
        : { invitations: 1, guests: 30, photos: 20, designs: 1, aiRequests: 3 };

      const totalLimits = { ...defaultLimits };

      const applyBasePack = (pack: ServicePack, multiplier = 1) => {
        totalLimits.invitations += (pack.invitations ?? 0) * multiplier;
        totalLimits.guests += (pack.guests ?? 0) * multiplier;
        totalLimits.photos += (pack.photos ?? 0) * multiplier;
        totalLimits.designs += (pack.designs ?? 0) * multiplier;
        totalLimits.aiRequests += (pack.aiRequests ?? 0) * multiplier;
      };

      const applyAddonPack = (pack: ServicePack, multiplier = 1) => {
        const amount = (pack.quantity ?? 0) * multiplier;
        switch (pack.unit) {
          case 'GUEST':
            totalLimits.guests += amount;
            break;
          case 'PHOTO':
            totalLimits.photos += amount;
            break;
          case 'INVITATION':
            // INVITATION = nombre d'événements qu'on peut créer
            totalLimits.invitations += amount;
            break;
          case 'DESIGN':
            // DESIGN = modèles/templates (non utilisé pour les packs supplémentaires)
            totalLimits.designs += amount;
            break;
          case 'AI_REQUEST':
            totalLimits.aiRequests += amount;
            break;
        }
      };

      const missingTiers = Array.from(
        new Set(
          userPurchases
            .filter(p => !p.servicePack && p.tier)
            .map(p => p.tier as ServiceTier)
        )
      );
      const tierMap = new Map<ServiceTier, ServicePack | null>();
      await Promise.all(
        missingTiers.map(async tier => {
          const pack = await ServicePackService.getByTier(tier);
          tierMap.set(tier, pack ?? null);
        })
      );

      userPurchases.forEach(purchase => {
        const pack = purchase.servicePack
          ?? (purchase.tier ? tierMap.get(purchase.tier as ServiceTier) ?? null : null);
        if (!pack) {
          return;
        }

        if (pack.type === ServicePackType.BASE) {
          applyBasePack(pack, purchase.quantity);
        } else if (pack.type === ServicePackType.ADDON) {
          applyAddonPack(pack, purchase.quantity);
        }
      });

      // Appliquer les services supplémentaires (add-ons)
      console.log(`🔍 Calcul des limites: ${additionalServices.length} services supplémentaires trouvés`);
      
      // Charger les servicePacks manquants si nécessaire
      const servicesWithPacks = await Promise.all(
        additionalServices.map(async (service) => {
          if (!service.servicePack && service.servicePackId) {
            const pack = await ServicePackService.getById(service.servicePackId);
            return { ...service, servicePack: pack };
          }
          return service;
        })
      );
      
      servicesWithPacks.forEach(service => {
        console.log(`  - Service: ${service.serviceId}, quantity: ${service.quantity}, type: ${service.type}, servicePack: ${service.servicePack ? service.servicePack.name : 'NULL'}`);
        
        if (service.servicePack) {
          // service.quantity = nombre de packs achetés (devrait toujours être 1 pour un achat unique)
          // pack.quantity = quantité du pack (ex: 10 requêtes IA, 1 design)
          // On multiplie la quantité du pack par le nombre de packs achetés
          let numberOfPacks = service.quantity || 1;
          
          // Correction pour les anciennes entrées où quantity stockait la quantité du pack au lieu du nombre de packs
          // On ne corrige que si quantity > 1 ET quantity correspond à pack.quantity (cas suspect)
          // Si quantity = 1 et pack.quantity = 1, c'est normal, pas besoin de corriger
          if (service.servicePack.quantity && service.servicePack.quantity > 0) {
            if (numberOfPacks > 1 && numberOfPacks === service.servicePack.quantity) {
              // Ancienne entrée : quantity stockait la quantité du pack (ex: 10 pour pack de 10 requêtes IA)
              // On corrige à 1 pack acheté
              numberOfPacks = 1;
              console.log(`⚠️ Correction automatique: quantity=${service.quantity} correspond à pack.quantity=${service.servicePack.quantity}, corrigé à 1 pack pour ${service.servicePack.name}`);
            } else if (numberOfPacks > service.servicePack.quantity && numberOfPacks % service.servicePack.quantity === 0) {
              // Ancienne entrée : quantity est un multiple de pack.quantity (ex: 20 pour pack de 10 = 2 achats)
              numberOfPacks = numberOfPacks / service.servicePack.quantity;
              console.log(`⚠️ Correction automatique: quantity=${service.quantity} est un multiple de pack.quantity=${service.servicePack.quantity}, corrigé à ${numberOfPacks} packs pour ${service.servicePack.name}`);
            }
          }
          
          const limitKey = service.servicePack.unit === 'INVITATION' ? 'invitations' :
                          service.servicePack.unit === 'DESIGN' ? 'designs' : 
                          service.servicePack.unit === 'GUEST' ? 'guests' :
                          service.servicePack.unit === 'PHOTO' ? 'photos' :
                          service.servicePack.unit === 'AI_REQUEST' ? 'aiRequests' : null;
          
          if (limitKey) {
            const beforeLimit = totalLimits[limitKey];
            console.log(`  ✅ Application du pack ${service.servicePack.name}: pack.quantity=${service.servicePack.quantity}, unit=${service.servicePack.unit}, numberOfPacks=${numberOfPacks}`);
            applyAddonPack(service.servicePack, numberOfPacks);
            const afterLimit = totalLimits[limitKey];
            console.log(`  📊 Limite ${service.servicePack.unit}: ${beforeLimit} → ${afterLimit} (+${afterLimit - beforeLimit})`);
          } else {
            console.log(`  ⚠️ Unité inconnue pour le pack ${service.servicePack.name}: ${service.servicePack.unit}`);
          }
        } else if (service.type) {
          // Fallback pour les anciens services sans servicePack
          // On utilise le type pour déterminer l'unité
          // Dans ce cas, service.quantity représente directement la quantité à ajouter
          const amount = service.quantity || 0;
          switch (service.type) {
            case 'GUEST':
              totalLimits.guests += amount;
              break;
            case 'PHOTO':
              totalLimits.photos += amount;
              break;
            case 'DESIGN':
              totalLimits.designs += amount;
              break;
            case 'AI_REQUEST':
              totalLimits.aiRequests += amount;
              break;
          }
        }
      });

      console.log(`📊 Limites totales calculées pour l'utilisateur ${userId}:`, {
        invitations: totalLimits.invitations,
        guests: totalLimits.guests,
        photos: totalLimits.photos,
        aiRequests: totalLimits.aiRequests
      });

      // Retourner les limites sans designs (designs = modèles, pas nécessaire pour les limites)
      const { designs, ...limitsWithoutDesigns } = totalLimits;
      return limitsWithoutDesigns;
    } catch (error) {
      console.error('Erreur lors du calcul des limites totales:', error);
      const freePack = await ServicePackService.getByTier('FREE');
      return freePack
        ? mapPackToPlan(freePack).limits
        : { invitations: 1, guests: 30, photos: 20, designs: 1, aiRequests: 3 };
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
        orderBy: { purchasedAt: 'desc' },
        include: {
          servicePack: true
        }
      });

      if (userPurchases.length === 0) {
        return 'FREE';
      }

      const tierOrder: ServiceTier[] = ['FREE', 'ESSENTIAL', 'ELEGANT', 'PREMIUM', 'LUXE'];
      let highestTier: ServiceTier = 'FREE';

      for (const purchase of userPurchases) {
        const tier = purchase.servicePack?.tier ?? purchase.tier;
        if (!tier) continue;
        const normalizedTier = tier === 'PREMIUM' ? 'ELEGANT' : tier;
        if (tierOrder.indexOf(normalizedTier) > tierOrder.indexOf(highestTier)) {
          highestTier = normalizedTier;
        }
      }

      return highestTier;
    } catch (error) {
      console.error('Erreur lors de la récupération du tier:', error);
      return 'FREE';
    }
  }

  /**
   * Obtenir les services supplémentaires disponibles
   */
  static async getAdditionalServices() {
    const packs = await ServicePackService.listAddonPacks();
    return packs.map(mapPackToAddon);
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
    const plan = await this.getPlanDetails(currentTier);
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
  static async getPlanDetails(tier: ServiceTier) {
    const pack = await ServicePackService.getByTier(tier);
    return pack ? mapPackToPlan(pack) : undefined;
  }

  /**
   * Traiter les webhooks Stripe
   */
  static async handleWebhook(event: any) {
    try {
      console.log(`📥 Webhook reçu: ${event.type}`);
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          console.log(`📋 Session metadata:`, session.metadata);
          const { userId, planId, serviceId, type } = session.metadata || {};
          
          if (userId && planId) {
            console.log(`✅ Paiement confirmé pour l'utilisateur ${userId}, pack ${planId}`);
            await this.changePlanDirectly(userId, planId);
          } else if (userId && serviceId && type === 'additional_service') {
            const sessionId = session.id;
            console.log(`✅ Paiement confirmé pour l'utilisateur ${userId}, service ${serviceId}, session ${sessionId}`);
            await this.applyAdditionalService(userId, serviceId, sessionId);
          } else {
            console.log(`⚠️ Webhook checkout.session.completed ignoré - métadonnées manquantes ou invalides:`, {
              userId,
              planId,
              serviceId,
              type,
              metadata: session.metadata
            });
          }
          break;
        
        default:
          console.log(`Webhook non géré: ${event.type}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors du traitement du webhook:', error);
      throw error;
    }
  }

  /**
   * Obtenir tous les plans
   */
  static async getAllPlans() {
    const packs = await ServicePackService.listBasePacks();
    return packs.map(mapPackToPlan);
  }

  /**
   * Acheter un pack directement
   */
  static async changePlanDirectly(userId: string, packIdentifier: string) {
    try {
      console.log(`🔍 ChangePlanDirectly - Début pour userId: ${userId}, pack: ${packIdentifier}`);
      
      const pack = await resolveBasePack(packIdentifier);
      if (!pack) {
        throw new Error('Plan non trouvé');
      }

      const plan = mapPackToPlan(pack);
      console.log('🔍 Plan trouvé:', plan);

      // Créer un nouvel achat (pas de mise à jour de l'utilisateur)
      // Générer un ID unique pour éviter les conflits de contrainte unique
      const testPaymentId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newServicePurchase = await prisma.servicePurchase.create({
        data: {
          userId: userId,
          tier: pack.tier ?? null,
          servicePackId: pack.id,
          status: 'ACTIVE',
          stripePaymentId: testPaymentId,
        }
      });

      console.log(`✅ Nouvel achat créé:`, newServicePurchase);

      // Créer une entrée dans l'historique des achats
      const purchaseHistoryEntry = await prisma.purchaseHistory.create({
        data: {
          userId: userId,
          tier: pack.tier ?? null,
          servicePackId: pack.id,
          quantity: 1,
          price: plan.price,
          currency: plan.currency,
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