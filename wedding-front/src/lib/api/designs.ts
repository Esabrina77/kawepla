import { apiClient } from './apiClient';
import { Design } from '@/types';

export interface DesignFilters {
  tags?: string[];
  isTemplate?: boolean;
  isActive?: boolean;
}

export const designsApi = {
  // RÉCUPÉRER TOUS LES DESIGNS
  async getAll(): Promise<Design[]> {
    const response = await apiClient.get<{ designs: Design[] }>('/designs');
    return response.designs || [];
  },

  // RÉCUPÉRER LES DESIGNS AVEC FILTRES
  async getByFilter(filters: DesignFilters): Promise<Design[]> {
    const params = new URLSearchParams();

    if (filters.isTemplate !== undefined) params.append('isTemplate', filters.isTemplate.toString());
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<{ designs: Design[] }>(`/designs/filter${query}`);
    return response.designs || [];
  },

  // RÉCUPÉRER UNIQUEMENT LES MODÈLES (TEMPLATES)
  async getTemplates(): Promise<Design[]> {
    const response = await apiClient.get<{ designs: Design[] }>('/designs/templates');
    return response.designs || [];
  },

  // RÉCUPÉRER LES DESIGNS PERSONNALISÉS DE L'UTILISATEUR
  async getUserDesigns(): Promise<Design[]> {
    const response = await apiClient.get<{ designs: Design[] }>('/designs/my-designs');
    return response.designs || [];
  },

  // RÉCUPÉRER UN DESIGN SPÉCIFIQUE
  async getById(id: string): Promise<Design> {
    const response = await apiClient.get<{ design: Design }>(`/designs/${id}`);
    return response.design;
  },

  // ADMIN SEULEMENT - Créer un design (modèle)
  async create(design: Omit<Design, 'id' | 'createdAt' | 'updatedAt'>): Promise<Design> {
    const response = await apiClient.post<{ design: Design }>('/admin/designs', design);
    return response.design;
  },

  // UTILISATEUR - Créer un design personnalisé
  async createPersonalized(design: Omit<Design, 'id' | 'createdAt' | 'updatedAt'>): Promise<Design> {
    const response = await apiClient.post<{ design: Design }>('/designs/personalize', design);
    return response.design;
  },

  // ADMIN & UTILISATEUR (Propriétaire) - Mettre à jour un design
  async update(id: string, design: Partial<Design>): Promise<Design> {
    // Utiliser l'endpoint générique /designs qui gère les permissions (admin ou propriétaire)
    const response = await apiClient.put<{ design: Design }>(`/designs/${id}`, design);
    return response.design;
  },

  // ADMIN & UTILISATEUR (Propriétaire) - Supprimer un design
  async delete(id: string): Promise<void> {
    // Utiliser l'endpoint générique /designs qui gère les permissions (admin ou propriétaire)
    return apiClient.delete<void>(`/designs/${id}`);
  },

  // UTILITAIRES POUR LE FRONTEND
  getTagsFromDesigns(designs: Design[]): string[] {
    const allTags = designs
      .flatMap(design => design.tags || []);

    return Array.from(new Set(allTags));
  },

  filterDesignsByTags(designs: Design[], tags: string[]): Design[] {
    if (tags.length === 0) return designs;

    return designs.filter(design => {
      const designTags = design.tags || [];
      return tags.some(tag =>
        designTags.some(designTag => designTag.toLowerCase().includes(tag.toLowerCase()))
      );
    });
  }
};
