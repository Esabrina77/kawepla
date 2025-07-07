import { prisma } from '@/lib/prisma';
import { CreateDesignDto, DesignResponse, DesignTemplate, DesignStyles, DesignVariables } from '@/types';
import { SubscriptionTier } from '@prisma/client';

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

  static async createDesign(data: CreateDesignDto, adminId: string): Promise<DesignResponse> {
    this.validateTemplateStructure(data.template);
    this.validateStyles(data.styles);
    this.validateVariables(data.variables);

    const design = await prisma.design.create({
      data: {
        name: data.name,
        description: data.description,
        isPremium: data.isPremium || false,
        price: data.price,
        template: JSON.parse(JSON.stringify(data.template)),
        styles: JSON.parse(JSON.stringify(data.styles)),
        components: data.components ? JSON.parse(JSON.stringify(data.components)) : {},
        variables: JSON.parse(JSON.stringify(data.variables)),
        createdBy: adminId,
      },
    });

    return this.formatDesignResponse(design);
  }

  static async updateDesign(id: string, data: Partial<CreateDesignDto>): Promise<DesignResponse | null> {
    if (data.template) this.validateTemplateStructure(data.template);
    if (data.styles) this.validateStyles(data.styles);
    if (data.variables) this.validateVariables(data.variables);

    const updateData: any = { ...data };
    if (data.template) updateData.template = JSON.parse(JSON.stringify(data.template));
    if (data.styles) updateData.styles = JSON.parse(JSON.stringify(data.styles));
    if (data.components) updateData.components = JSON.parse(JSON.stringify(data.components));
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
      components: design.components || undefined,
      description: design.description || undefined,
      price: design.price || undefined,
      createdBy: design.createdBy || undefined,
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
    if (!design.isPremium) return true;
    
    const user = await prisma.user.findUnique({ 
      where: { id: userId }, 
      select: { subscriptionTier: true, subscriptionEndDate: true } 
    });
    
    if (!user) return false;
    if (user.subscriptionEndDate && user.subscriptionEndDate < new Date()) return false;
    return user.subscriptionTier === SubscriptionTier.PREMIUM;
  }
} 