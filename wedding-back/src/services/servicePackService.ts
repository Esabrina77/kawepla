import { ServicePackType, ServiceTier } from '@prisma/client';
import { prisma } from '../lib/prisma';

export interface ServicePackInput {
  slug: string;
  name: string;
  description?: string | null;
  type: ServicePackType;
  tier?: ServiceTier | null;
  price: number;
  currency?: string;
  features?: string[];
  invitations?: number | null;
  guests?: number | null;
  photos?: number | null;
  designs?: number | null;
  aiRequests?: number | null;
  quantity?: number | null;
  unit?: string | null;
  isHighlighted?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export class ServicePackService {
  static async listBasePacks(includeInactive = false) {
    return prisma.servicePack.findMany({
      where: {
        type: 'BASE',
        ...(includeInactive ? {} : { isActive: true })
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  static async listAddonPacks(includeInactive = false) {
    return prisma.servicePack.findMany({
      where: {
        type: 'ADDON',
        ...(includeInactive ? {} : { isActive: true })
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  static async getById(id: string) {
    return prisma.servicePack.findUnique({ where: { id } });
  }

  static async getBySlug(slug: string) {
    return prisma.servicePack.findUnique({ where: { slug } });
  }

  static async getByTier(tier: ServiceTier) {
    return prisma.servicePack.findFirst({
      where: { tier, type: 'BASE', isActive: true }
    });
  }

  static async create(data: ServicePackInput) {
    return prisma.servicePack.create({
      data: {
        ...data,
        slug: data.slug.toLowerCase(),
        currency: data.currency || 'EUR',
        features: data.features || [],
        isHighlighted: data.isHighlighted ?? false,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0
      }
    });
  }

  static async update(id: string, data: Partial<ServicePackInput>) {
    return prisma.servicePack.update({
      where: { id },
      data: {
        ...data,
        ...(data.slug ? { slug: data.slug.toLowerCase() } : {})
      }
    });
  }

  static async softDelete(id: string) {
    return prisma.servicePack.update({
      where: { id },
      data: { isActive: false }
    });
  }
}

