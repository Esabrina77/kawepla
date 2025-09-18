import { prisma } from '@/lib/prisma';
import { CreateDesignDto, DesignResponse, DesignTemplate, DesignStyles, DesignVariables } from '@/types';
import { ServiceTier } from '@prisma/client';

export class DesignService {
  static async getAllDesigns(includeInactive = false): Promise<DesignResponse[]> {
    const designs = await prisma.design.findMany({
      where: { isActive: includeInactive ? undefined : true },
      orderBy: { createdAt: 'desc' },
    });

    return designs.map(this.formatDesignResponse);
  }

  static async getDesignsByFilter(
    filters: { category?: string; tags?: string[] },
    includeInactive = false
  ): Promise<DesignResponse[]> {
    const whereClause: any = {
      isActive: includeInactive ? undefined : true,
    };

    if (filters.category) {
      whereClause.category = filters.category;
    }

    if (filters.tags && filters.tags.length > 0) {
      whereClause.tags = {
        hasSome: filters.tags,
      };
    }

    const designs = await prisma.design.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return designs.map(this.formatDesignResponse);
  }

  static async getDesignById(id: string): Promise<DesignResponse | null> {
    const design = await prisma.design.findUnique({ where: { id } });
    if (!design) return null;
    return this.formatDesignResponse(design);
  }

  static async createDesign(data: CreateDesignDto): Promise<DesignResponse> {
    console.log('Creating design with data:', JSON.stringify(data, null, 2));
    
    this.validateTemplateStructure(data.template);
    this.validateStyles(data.styles);
    this.validateVariables(data.variables);

    const designData = {
      name: data.name,
      description: data.description,
      category: data.category,
      tags: data.tags || [],
      isActive: data.isActive !== false,
      priceType: data.priceType || 'FREE',
      template: JSON.parse(JSON.stringify(data.template)),
      styles: JSON.parse(JSON.stringify(data.styles)),
      variables: JSON.parse(JSON.stringify(data.variables)),
      customFonts: data.customFonts ? JSON.parse(JSON.stringify(data.customFonts)) : null,
      backgroundImage: data.backgroundImage || null,
    };

    console.log('Saving to database:', JSON.stringify(designData, null, 2));

    const design = await prisma.design.create({
      data: designData,
    });

    console.log('Design created successfully:', design.id);
    return this.formatDesignResponse(design);
  }

  static async updateDesign(id: string, data: Partial<CreateDesignDto>): Promise<DesignResponse | null> {
    if (data.template) this.validateTemplateStructure(data.template);
    if (data.styles) this.validateStyles(data.styles);
    if (data.variables) this.validateVariables(data.variables);

    const updateData: any = { ...data };
    if (data.template) updateData.template = JSON.parse(JSON.stringify(data.template));
    if (data.styles) updateData.styles = JSON.parse(JSON.stringify(data.styles));

    if (data.variables) updateData.variables = JSON.parse(JSON.stringify(data.variables));

    const design = await prisma.design.update({
      where: { id },
      data: updateData,
    });

    return this.formatDesignResponse(design);
  }

  private static async incrementVersion(id: string): Promise<string> {
    const design = await prisma.design.findUnique({ where: { id } });
    if (!design) throw new Error('Design not found');
    
    const [major, minor, patch] = design.version.split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
  }

  private static formatDesignResponse(design: any): DesignResponse {
    return {
      ...design,
      template: design.template as DesignTemplate,
      styles: design.styles as DesignStyles,
      variables: design.variables as DesignVariables,
      description: design.description || undefined,
    };
  }

  private static validateTemplateStructure(template: DesignTemplate) {
    if (!template.layout || typeof template.layout !== 'string') {
      throw new Error('Template must include a layout string');
    }
    if (!template.sections || typeof template.sections !== 'object') {
      throw new Error('Template must include sections');
    }
  }

  private static validateStyles(styles: DesignStyles) {
    if (!styles.base || typeof styles.base !== 'object') {
      throw new Error('Styles must include base styles');
    }
    if (!styles.components || typeof styles.components !== 'object') {
      throw new Error('Styles must include component styles');
    }
  }

  private static validateVariables(variables: DesignVariables) {
    if (!variables.colors || !variables.typography || !variables.spacing) {
      throw new Error('Variables must include colors, typography, and spacing');
    }
  }

  static async deleteDesign(id: string): Promise<void> {
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
    const tierOrder = ['FREE', 'ESSENTIAL', 'ELEGANT', 'PREMIUM', 'LUXE'];
    const userTierIndex = tierOrder.indexOf(currentTier);
    const requiredTierIndex = tierOrder.indexOf(design.priceType);
    
    return userTierIndex >= requiredTierIndex;
  }
} 