import { apiClient } from './apiClient';
import { Design } from '@/types';

export interface DesignFilters {
  category?: string;
  tags?: string[];
  isPremium?: boolean;
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
    
    if (filters.category) params.append('category', filters.category);
    if (filters.isPremium !== undefined) params.append('isPremium', filters.isPremium.toString());
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<{ designs: Design[] }>(`/designs/filter${query}`);
    return response.designs || [];
  },

  // RÉCUPÉRER UN DESIGN SPÉCIFIQUE
  async getById(id: string): Promise<Design> {
    const response = await apiClient.get<{ design: Design }>(`/designs/${id}`);
    return response.design;
  },

  // ADMIN SEULEMENT - Créer un design
  async create(design: Omit<Design, 'id' | 'createdAt' | 'updatedAt'>): Promise<Design> {
    const response = await apiClient.post<{ design: Design }>('/admin/designs', design);
    return response.design;
  },

  // ADMIN SEULEMENT - Mettre à jour un design
  async update(id: string, design: Partial<Design>): Promise<Design> {
    const response = await apiClient.put<{ design: Design }>(`/admin/designs/${id}`, design);
    return response.design;
  },

  // ADMIN SEULEMENT - Supprimer un design
  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/admin/designs/${id}`);
  },

  // UTILITAIRES POUR LE FRONTEND
  getCategoriesFromDesigns(designs: Design[]): string[] {
    const categories = designs
      .map(design => design.category)
      .filter((category): category is string => !!category);
    
    return Array.from(new Set(categories));
  },

  getTagsFromDesigns(designs: Design[]): string[] {
    const allTags = designs
      .flatMap(design => design.tags || []);
    
    return Array.from(new Set(allTags));
  },

  filterDesignsByEventType(designs: Design[], eventType: string): Design[] {
    // Logique pour filtrer les designs selon le type d'événement
    // Pour l'instant, on retourne tous les designs, mais on pourrait ajouter
    // une logique plus sophistiquée basée sur les tags ou catégories
    
    const eventTypeMapping: Record<string, string[]> = {
      'event': ['événement', 'event', 'romantique', 'élégant'],
      'BIRTHDAY': ['anniversaire', 'birthday', 'festif', 'coloré'],
      'BAPTISM': ['baptême', 'baptism', 'religieux', 'traditionnel'],
      'CORPORATE': ['entreprise', 'corporate', 'professionnel', 'moderne']
    };

    const relevantTags = eventTypeMapping[eventType] || [];
    
    if (relevantTags.length === 0) {
      return designs;
    }

    return designs.filter(design => {
      const designTags = design.tags || [];
      const designCategory = design.category?.toLowerCase() || '';
      
      return relevantTags.some(tag => 
        designTags.some(designTag => designTag.toLowerCase().includes(tag.toLowerCase())) ||
        designCategory.includes(tag.toLowerCase())
      );
    });
  }
};
