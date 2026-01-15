import { prisma } from '@/lib/prisma';
import { CreateDesignDto, DesignResponse } from '@/types';
import { ServiceTier } from '@prisma/client';
import { cache } from '@/lib/redis';

export class DesignService {
  static async getAllDesigns(includeInactive = false): Promise<DesignResponse[]> {
    const cacheKey = `designs:all:${includeInactive}`;
    const cached = await cache.get<DesignResponse[]>(cacheKey);
    if (cached) return cached;

    const designs = await prisma.design.findMany({
      where: { isActive: includeInactive ? undefined : true },
      select: {
        id: true,
        name: true,
        description: true,
        tags: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        editorVersion: true,
        canvasWidth: true,
        canvasHeight: true,
        canvasFormat: true,
        backgroundImage: true,
        thumbnail: true,
        previewImage: true,
        priceType: true,
        userId: true,
        isTemplate: true,
        originalDesignId: true,
        // fabricData EXCLU
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = designs.map(d => this.formatDesignResponse(d));
    await cache.set(cacheKey, result, 600); // 10 minutes
    return result;
  }

  static async getDesignsByFilter(
    filters: { tags?: string[]; isTemplate?: boolean; userId?: string },
    includeInactive = false
  ): Promise<DesignResponse[]> {
    const cacheKey = `designs:filter:${JSON.stringify(filters)}:${includeInactive}`;
    const cached = await cache.get<DesignResponse[]>(cacheKey);
    if (cached) return cached;

    const whereClause: any = {
      isActive: includeInactive ? undefined : true,
    };

    if (filters.isTemplate !== undefined) {
      whereClause.isTemplate = filters.isTemplate;
    }

    if (filters.userId !== undefined) {
      whereClause.userId = filters.userId;
    }

    if (filters.tags && filters.tags.length > 0) {
      whereClause.tags = {
        hasSome: filters.tags,
      };
    }

    const designs = await prisma.design.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        tags: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        editorVersion: true,
        canvasWidth: true,
        canvasHeight: true,
        canvasFormat: true,
        backgroundImage: true,
        thumbnail: true,
        previewImage: true,
        priceType: true,
        userId: true,
        isTemplate: true,
        originalDesignId: true,
        // fabricData EXCLU
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = designs.map(d => this.formatDesignResponse(d));
    if (filters.isTemplate && !filters.userId) {
      await cache.set(cacheKey, result, 600); // Cache seulement pour les templates publics
    }
    return result;
  }

  // Nouvelle méthode : Récupérer uniquement les modèles (templates) pour la galerie
  static async getTemplates(includeInactive = false): Promise<DesignResponse[]> {
    return this.getDesignsByFilter({ isTemplate: true }, includeInactive);
  }

  // Nouvelle méthode : Récupérer les designs personnalisés d'un utilisateur
  static async getUserDesigns(userId: string): Promise<DesignResponse[]> {
    return this.getDesignsByFilter({ userId, isTemplate: false }, false);
  }

  static async getDesignById(id: string): Promise<DesignResponse | null> {
    const design = await prisma.design.findUnique({ where: { id } });
    if (!design) return null;
    return this.formatDesignResponse(design);
  }

  static async createDesign(data: CreateDesignDto, userId?: string): Promise<DesignResponse> {
    console.log('Creating design with data:', JSON.stringify(data, null, 2));

    // Validation : fabricData est obligatoire pour les nouveaux designs Canva
    if (!data.fabricData) {
      throw new Error('fabricData is required for Canva designs');
    }

    const designData = {
      name: data.name,
      description: data.description,
      tags: data.tags || [],
      isActive: data.isActive !== false,
      priceType: data.priceType || 'FREE',

      // Format Fabric.js (essentiel)
      fabricData: JSON.parse(JSON.stringify(data.fabricData)),
      editorVersion: data.editorVersion || 'canva',

      // Dimensions du canvas
      canvasWidth: data.canvasWidth || 794, // A4 par défaut
      canvasHeight: data.canvasHeight || 1123, // A4 par défaut
      canvasFormat: data.canvasFormat || 'A4',

      // Métadonnées
      backgroundImage: data.backgroundImage || null,
      thumbnail: data.thumbnail || null,
      previewImage: data.previewImage || null,

      // Propriétaire du design
      userId: userId || data.userId || null, // null = modèle super-admin
      isTemplate: data.isTemplate !== undefined ? data.isTemplate : (userId ? false : true),
      originalDesignId: data.originalDesignId || null,
    };

    console.log('Saving to database:', JSON.stringify(designData, null, 2));

    const design = await prisma.design.create({
      data: designData,
    });

    console.log('Design created successfully:', design.id);
    return this.formatDesignResponse(design);
  }

  static async updateDesign(
    id: string,
    data: Partial<CreateDesignDto>,
    userId?: string,
    isAdmin?: boolean
  ): Promise<DesignResponse | null> {
    // Vérifier l'existence et les droits
    const existingDesign = await prisma.design.findUnique({ where: { id } });

    if (!existingDesign) return null;

    // Si ce n'est pas un admin, vérifier que l'utilisateur est le propriétaire
    if (!isAdmin) {
      if (!userId || existingDesign.userId !== userId) {
        throw new Error('Accès non autorisé');
      }
    }

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.priceType !== undefined) updateData.priceType = data.priceType;

    // Format Fabric.js
    if (data.fabricData) updateData.fabricData = JSON.parse(JSON.stringify(data.fabricData));
    if (data.editorVersion !== undefined) updateData.editorVersion = data.editorVersion;

    // Dimensions du canvas
    if (data.canvasWidth !== undefined) updateData.canvasWidth = data.canvasWidth;
    if (data.canvasHeight !== undefined) updateData.canvasHeight = data.canvasHeight;
    if (data.canvasFormat !== undefined) updateData.canvasFormat = data.canvasFormat;

    // Métadonnées
    if (data.backgroundImage !== undefined) updateData.backgroundImage = data.backgroundImage;
    if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
    if (data.previewImage !== undefined) updateData.previewImage = data.previewImage;

    // Propriétaire du design (admin only can change owner, but usually not needed)
    if (isAdmin && data.userId !== undefined) updateData.userId = data.userId;
    if (isAdmin && data.isTemplate !== undefined) updateData.isTemplate = data.isTemplate;
    if (isAdmin && data.originalDesignId !== undefined) updateData.originalDesignId = data.originalDesignId;

    const design = await prisma.design.update({
      where: { id },
      data: updateData,
    });

    // Invalider les caches
    await cache.del(`designs:all:true`);
    await cache.del(`designs:all:false`);
    // On invaliderait normalement les filtres aussi, mais le TTL fera le job 
    // ou on peut flush le cache designs:* si on veut être strict

    return this.formatDesignResponse(design);
  }

  private static formatDesignResponse(design: any): DesignResponse {
    // Gérer les anciens designs legacy qui n'ont pas de fabricData
    // Vérifier si c'est un design legacy (a template/styles/variables mais pas fabricData)
    const isLegacy = !design.fabricData && (design.template || design.styles || design.variables);
    const fabricData = design.fabricData || (isLegacy ? { legacy: true } : {});

    return {
      id: design.id,
      name: design.name,
      description: design.description || undefined,
      tags: design.tags || [],
      isActive: design.isActive,
      createdAt: design.createdAt,
      updatedAt: design.updatedAt,

      // Format Fabric.js (peut être vide pour les anciens designs)
      fabricData: fabricData,
      editorVersion: design.editorVersion || (isLegacy ? 'legacy' : 'canva'),

      // Dimensions du canvas (peuvent être null pour les anciens designs)
      canvasWidth: design.canvasWidth ?? 794,
      canvasHeight: design.canvasHeight ?? 1123,
      canvasFormat: design.canvasFormat || 'A4',

      // Métadonnées
      backgroundImage: design.backgroundImage || undefined,
      thumbnail: design.thumbnail || undefined,
      previewImage: design.previewImage || undefined,
      priceType: design.priceType || 'FREE',

      // Propriétaire du design
      userId: design.userId || undefined,
      isTemplate: design.isTemplate !== undefined ? design.isTemplate : (design.userId ? false : true),
      originalDesignId: design.originalDesignId || undefined,
    };
  }

  static async deleteDesign(id: string, userId?: string, isAdmin?: boolean): Promise<void> {
    // Vérifier l'existence et les droits
    const existingDesign = await prisma.design.findUnique({ where: { id } });

    if (!existingDesign) {
      throw new Error('Design introuvable');
    }

    // Si ce n'est pas un admin, vérifier que l'utilisateur est le propriétaire
    if (!isAdmin) {
      if (!userId || existingDesign.userId !== userId) {
        throw new Error('Accès non autorisé');
      }
    }

    // Vérifier si le design est utilisé dans des invitations
    const invitationsUsingDesign = await prisma.invitation.findMany({
      where: { designId: id },
      select: { id: true }
    });

    if (invitationsUsingDesign.length > 0) {
      // Si le design est utilisé, le désactiver au lieu de le supprimer
      await prisma.design.update({
        where: { id },
        data: { isActive: false },
      });
    } else {
      // Si le design n'est pas utilisé, le supprimer définitivement
      await prisma.design.delete({
        where: { id },
      });
    }
  }

  static async canUserAccessDesign(userId: string, designId: string): Promise<boolean> {
    const design = await prisma.design.findUnique({ where: { id: designId } });
    if (!design) return false;
    if (design.priceType === 'FREE') return true;

    // Utiliser StripeService pour vérifier l'accès basé sur les achats
    const { StripeService } = await import('./stripeService');
    const currentTier = await StripeService.getUserCurrentTier(userId);

    // Vérifier si l'utilisateur a le tier requis ou supérieur
    // PREMIUM n'est plus disponible mais peut exister dans les anciens designs
    const tierOrder = ['FREE', 'ESSENTIAL', 'ELEGANT', 'LUXE'];
    // Rétrocompatibilité : traiter PREMIUM comme ELEGANT pour les anciens designs
    const userTier = currentTier === 'PREMIUM' ? 'ELEGANT' : currentTier;
    const requiredTier = design.priceType === 'PREMIUM' ? 'ELEGANT' : design.priceType;
    const userTierIndex = tierOrder.indexOf(userTier);
    const requiredTierIndex = tierOrder.indexOf(requiredTier);

    return userTierIndex >= requiredTierIndex;
  }
} 