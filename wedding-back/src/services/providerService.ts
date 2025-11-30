import { prisma } from '../lib/prisma';

export interface CreateProviderProfileDto {
  businessName: string;
  categoryId: string;
  description: string;
  // GÉOLOCALISATION V1
  latitude: number;        // Coordonnées GPS (avec offset sécurité)
  longitude: number;       // Coordonnées GPS (avec offset sécurité)
  serviceRadius?: number;  // Rayon d'intervention en km (défaut: 25km)
  displayCity: string;     // Ville affichée publiquement
  // CONTACT OBLIGATOIRE V1
  phone: string;           // Téléphone obligatoire
  // PHOTOS FIREBASE V1
  profilePhoto?: string;   // URL Firebase
  portfolio?: string[];    // URLs Firebase (max 6)
  // RÉSEAUX SOCIAUX (au moins un obligatoire)
  website?: string;        // Site web personnel
  instagram?: string;      // Lien Instagram
  tiktok?: string;         // Lien TikTok
  facebook?: string;       // Lien Facebook
}

export interface UpdateProviderProfileDto extends Partial<CreateProviderProfileDto> {}

export interface CreateServiceDto {
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  priceType: string; // "hourly", "daily", "fixed", "package"
  currency?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: number; // en minutes
  capacity?: number;
  includes?: string[];
  requirements?: string[];
  photos?: string[];
  categoryId?: string; // Optionnel, peut utiliser celle du profil
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {}

export class ProviderService {
  
  /**
   * NOUVEAU V1: Ajouter un offset de sécurité aux coordonnées GPS
   * Pour protéger la vie privée des prestataires
   */
  private static addSecurityOffset(lat: number, lng: number): { latitude: number, longitude: number } {
    // Offset aléatoire de 0.5 à 2km (environ 0.005 à 0.018 degrés)
    const offsetKm = 0.5 + Math.random() * 1.5;
    const offsetDegrees = offsetKm / 111; // 1 degré ≈ 111km
    
    const randomAngle = Math.random() * 2 * Math.PI;
    const latOffset = Math.cos(randomAngle) * offsetDegrees;
    const lngOffset = Math.sin(randomAngle) * offsetDegrees;
    
    return {
      latitude: lat + latOffset,
      longitude: lng + lngOffset
    };
  }

  /**
   * NOUVEAU V1: Calculer la distance entre deux points GPS (formule de Haversine)
   */
  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  /**
   * NOUVEAU V1: Recherche géolocalisée de prestataires
   */
  static async searchProvidersByLocation(params: {
    latitude: number;
    longitude: number;
    radius?: number;
    categoryId?: string;
    eventType?: string;
    minRating?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
  }) {
    const {
      latitude,
      longitude,
      radius = 25,
      categoryId,
      eventType,
      minRating = 0,
      maxPrice,
      limit = 20,
      offset = 0
    } = params;

    // Requête de base avec filtres
    const whereClause: any = {
      status: 'APPROVED',
      rating: { gte: minRating }
    };

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    // Récupérer tous les prestataires correspondants aux critères de base
    const providers = await prisma.providerProfile.findMany({
      where: whereClause,
      include: {
        category: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        services: {
          where: {
            isActive: true,
            ...(maxPrice && { price: { lte: maxPrice } })
          }
        }
      }
    });

    // Filtrer par distance et calculer la distance réelle
    const providersWithDistance = providers
      .map(provider => {
        const distance = this.calculateDistance(
          latitude, longitude,
          provider.latitude, provider.longitude
        );
        
        return {
          ...provider,
          distance: Math.round(distance * 10) / 10 // Arrondi à 0.1 km près
        };
      })
      .filter(provider => provider.distance <= radius)
      .sort((a, b) => a.distance - b.distance) // Trier par distance croissante
      .slice(offset, offset + limit);

    return {
      providers: providersWithDistance,
      total: providersWithDistance.length,
      searchParams: {
        center: { latitude, longitude },
        radius,
        filters: { categoryId, eventType, minRating, maxPrice }
      }
    };
  }

  /**
   * Créer un profil prestataire (V1 SIMPLIFIÉ)
   */
  static async createProviderProfile(userId: string, data: CreateProviderProfileDto) {
    // Vérifier que l'utilisateur existe et a le rôle PROVIDER
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    if (user.role !== 'PROVIDER') {
      throw new Error('Seuls les prestataires peuvent créer un profil prestataire');
    }

    // Vérifier qu'un profil n'existe pas déjà
    const existingProfile = await prisma.providerProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      throw new Error('Un profil prestataire existe déjà pour cet utilisateur');
    }

    // Vérifier que la catégorie existe
    const category = await prisma.serviceCategory.findUnique({
      where: { id: data.categoryId }
    });

    if (!category) {
      throw new Error('Catégorie de service invalide');
    }

    // Vérifier qu'au moins un réseau social est fourni
    const hasSocialNetwork = !!(data.website || data.instagram || data.tiktok || data.facebook);
    if (!hasSocialNetwork) {
      throw new Error('Veuillez fournir au moins un lien de réseau social (site web, Instagram, TikTok ou Facebook)');
    }

    // Créer le profil (V1 SIMPLIFIÉ avec géolocalisation)
    const profile = await prisma.providerProfile.create({
      data: {
        userId,
        businessName: data.businessName,
        categoryId: data.categoryId,
        description: data.description,
        // GÉOLOCALISATION V1
        latitude: data.latitude,
        longitude: data.longitude,
        serviceRadius: data.serviceRadius || 25,
        displayCity: data.displayCity,
        // CONTACT OBLIGATOIRE
        phone: data.phone,
        // PHOTOS
        profilePhoto: data.profilePhoto,
        portfolio: data.portfolio || [],
        // RÉSEAUX SOCIAUX
        website: data.website,
        instagram: data.instagram,
        tiktok: data.tiktok,
        facebook: data.facebook,
        // V1: AUTO-ACTIVATION
        status: 'APPROVED',
        verifiedAt: new Date(),
        // MÉTRIQUES
        rating: 0,
        reviewCount: 0,
        bookingCount: 0,
        totalEarnings: 0,
        // STRIPE CONNECT
        stripeOnboarded: false,
        commissionRate: 0.15
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return profile;
  }

  /**
   * Mettre à jour un profil prestataire
   */
  static async updateProviderProfile(userId: string, data: UpdateProviderProfileDto) {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new Error('Profil prestataire non trouvé');
    }

    // Si on met à jour la catégorie, vérifier qu'elle existe
    if (data.categoryId) {
      const category = await prisma.serviceCategory.findUnique({
        where: { id: data.categoryId }
      });

      if (!category) {
        throw new Error('Catégorie de service invalide');
      }
    }

    const updatedProfile = await prisma.providerProfile.update({
      where: { userId },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return updatedProfile;
  }

  /**
   * Obtenir le profil prestataire d'un utilisateur
   */
  static async getProviderProfile(userId: string) {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            emailVerified: true
          }
        },
        services: {
          where: { isActive: true },
          include: {
            category: true
          },
          take: 5
        }
      }
    });

    return profile;
  }

  /**
   * Obtenir toutes les catégories de services
   */
  static async getServiceCategories() {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        color: true,
        isActive: true,
        sortOrder: true
      }
    });

    return categories;
  }

  /**
   * Obtenir tous les prestataires approuvés (SIMPLIFIÉ)
   */
  static async getApprovedProviders(filters?: {
    categoryId?: string;
    city?: string;
    minRating?: number;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {
      status: 'APPROVED'
    };

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.city) {
      where.city = {
        contains: filters.city,
        mode: 'insensitive'
      };
    }

    if (filters?.minRating) {
      where.rating = {
        gte: filters.minRating
      };
    }

    const providers = await prisma.providerProfile.findMany({
      where,
      include: {
        category: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        services: {
          where: { isActive: true },
          include: {
            category: true
          },
          take: 5
        }
      },
      orderBy: {
        rating: 'desc'
      },
      take: filters?.limit || 20,
      skip: filters?.offset || 0
    });

    return providers;
  }

  /**
   * Approuver un prestataire (admin seulement)
   */
  static async approveProvider(providerId: string, adminId: string) {
    // Vérifier que l'admin a les droits
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new Error('Accès non autorisé');
    }

    const profile = await prisma.providerProfile.update({
      where: { id: providerId },
      data: {
        status: 'APPROVED',
        verifiedAt: new Date()
      }
    });

    return profile;
  }

  /**
   * Rejeter un prestataire (admin seulement)
   */
  static async rejectProvider(providerId: string, adminId: string, reason: string) {
    // Vérifier que l'admin a les droits
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new Error('Accès non autorisé');
    }

    const profile = await prisma.providerProfile.update({
      where: { id: providerId },
      data: {
        status: 'REJECTED'
      }
    });

    return profile;
  }

  /**
   * Suspendre un prestataire (admin seulement)
   */
  static async suspendProvider(providerId: string, adminId: string) {
    // Vérifier que l'admin a les droits
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new Error('Accès non autorisé');
    }

    const profile = await prisma.providerProfile.update({
      where: { id: providerId },
      data: {
        status: 'SUSPENDED'
      }
    });

    return profile;
  }

  /**
   * Supprimer un prestataire (admin seulement)
   */
  static async deleteProvider(providerId: string, adminId: string) {
    // Vérifier que l'admin a les droits
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new Error('Accès non autorisé');
    }

    // Vérifier que le provider existe
    const profile = await prisma.providerProfile.findUnique({
      where: { id: providerId }
    });

    if (!profile) {
      throw new Error('Provider non trouvé');
    }

    // Supprimer le provider et ses données associées
    await prisma.$transaction(async (tx) => {
      // Supprimer les services du provider
      await tx.service.deleteMany({
        where: { providerId }
      });

      // Supprimer le profil provider
      await tx.providerProfile.delete({
        where: { id: providerId }
      });
    });

    return { message: 'Provider supprimé avec succès' };
  }

  /**
   * Obtenir les statistiques des prestataires
   */
  static async getProviderStats() {
    const stats = await prisma.providerProfile.aggregate({
      _count: {
        id: true
      },
      _avg: {
        rating: true
      },
      where: {
        status: 'APPROVED'
      }
    });

    const pendingCount = await prisma.providerProfile.count({
      where: { status: 'PENDING' }
    });

    const rejectedCount = await prisma.providerProfile.count({
      where: { status: 'REJECTED' }
    });

    return {
      totalApproved: stats._count.id,
      averageRating: stats._avg.rating || 0,
      pendingCount,
      rejectedCount
    };
  }

  /**
   * Créer un service
   */
  static async createService(userId: string, data: CreateServiceDto) {
    // Vérifier que l'utilisateur a un profil prestataire
    const profile = await prisma.providerProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new Error('Profil prestataire non trouvé');
    }

    // Utiliser la catégorie du profil si pas spécifiée
    const categoryId = data.categoryId || profile.categoryId;

    // Vérifier que la catégorie existe
    const category = await prisma.serviceCategory.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      throw new Error('Catégorie de service invalide');
    }

    const service = await prisma.service.create({
      data: {
        providerId: profile.id,
        categoryId,
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription,
        price: data.price,
        priceType: data.priceType,
        currency: data.currency || 'EUR',
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        duration: data.duration,
        capacity: data.capacity,
        includes: data.includes || [],
        requirements: data.requirements || [],
        photos: data.photos || [],
        isActive: true,
        rating: 0,
        reviewCount: 0,
        bookingCount: 0
      },
      include: {
        category: true,
        provider: {
          include: {
            category: true
          }
        }
      }
    });

    return service;
  }

  /**
   * Obtenir les services d'un prestataire
   */
  static async getProviderServices(userId: string) {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new Error('Profil prestataire non trouvé');
    }

    const services = await prisma.service.findMany({
      where: { providerId: profile.id },
      include: {
        category: true,
        provider: {
          include: {
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return services;
  }

  /**
   * Mettre à jour un service
   */
  static async updateService(userId: string, serviceId: string, data: UpdateServiceDto) {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new Error('Profil prestataire non trouvé');
    }

    // Vérifier que le service appartient au prestataire
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        providerId: profile.id
      }
    });

    if (!service) {
      throw new Error('Service non trouvé ou non autorisé');
    }

    // Si on met à jour la catégorie, vérifier qu'elle existe
    if (data.categoryId) {
      const category = await prisma.serviceCategory.findUnique({
        where: { id: data.categoryId }
      });

      if (!category) {
        throw new Error('Catégorie de service invalide');
      }
    }

    // Filtrer et mapper les données pour Prisma
    // Mapper 'inclusions' vers 'includes' si présent
    const prismaData: any = { ...data };
    
    // Si 'inclusions' est présent, le mapper vers 'includes'
    if ('inclusions' in prismaData && prismaData.inclusions !== undefined) {
      prismaData.includes = prismaData.inclusions;
      delete prismaData.inclusions;
    }
    
    // Supprimer les champs qui ne sont pas dans le schéma Prisma
    const validFields = [
      'name', 'description', 'shortDescription', 'price', 'priceType', 
      'currency', 'minPrice', 'maxPrice', 'duration', 'capacity',
      'includes', 'requirements', 'photos', 'videos', 'isActive', 
      'availability', 'categoryId'
    ];
    
    const filteredData: any = {};
    for (const key of validFields) {
      if (key in prismaData && prismaData[key] !== undefined) {
        filteredData[key] = prismaData[key];
      }
    }
    
    filteredData.updatedAt = new Date();

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: filteredData,
      include: {
        category: true,
        provider: {
          include: {
            category: true
          }
        }
      }
    });

    return updatedService;
  }

  /**
   * Supprimer un service
   */
  static async deleteService(userId: string, serviceId: string) {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new Error('Profil prestataire non trouvé');
    }

    // Vérifier que le service appartient au prestataire
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        providerId: profile.id
      }
    });

    if (!service) {
      throw new Error('Service non trouvé ou non autorisé');
    }

    await prisma.service.delete({
      where: { id: serviceId }
    });

    return true;
  }

  /**
   * Obtenir tous les providers (admin)
   */
  static async getAllProviders(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    
    if (params?.status) {
      where.status = params.status;
    }

    const [data, total] = await Promise.all([
      prisma.providerProfile.findMany({
        where,
        include: {
          category: true,
          services: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              price: true,
              priceType: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: params?.limit || 100,
        skip: params?.offset || 0
      }),
      prisma.providerProfile.count({ where })
    ]);

    return { data, total };
  }
}
