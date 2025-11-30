import { apiClient } from './apiClient';

// Types pour les providers
export interface ProviderProfile {
  id: string;
  userId: string;
  businessName: string;
  description?: string;
  categoryId: string;
  category?: ServiceCategory;
  latitude: number;
  longitude: number;
  displayCity: string;
  phone: string;
  website?: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  profilePhoto?: string;
  portfolio?: string[];
  rating: number;
  reviewCount: number;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  services?: Service[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface Service {
  id: string;
  providerId: string;
  name: string;
  description: string;
  price: number;
  priceType: 'FIXED' | 'PER_PERSON' | 'PER_HOUR' | 'CUSTOM';
  duration?: number; // en minutes
  capacity?: number;
  inclusions?: string[];
  requirements?: string[];
  photos?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProviderProfileDto {
  businessName: string;
  description: string;
  categoryId: string;
  latitude: number;
  longitude: number;
  displayCity: string;
  phone: string;
  profilePhoto?: string;
  portfolio?: string[];
  serviceRadius?: number;
  website?: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
}

export interface UpdateProviderProfileDto extends Partial<CreateProviderProfileDto> {}

export interface CreateServiceDto {
  name: string;
  description: string;
  price: number;
  priceType: 'FIXED' | 'PER_PERSON' | 'PER_HOUR' | 'CUSTOM';
  duration?: number;
  capacity?: number;
  inclusions?: string[];
  requirements?: string[];
  photos?: string[];
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {}

export interface GeoSearchParams {
  latitude: number;
  longitude: number;
  radius?: number; // en km, défaut 25
  categoryId?: string;
  eventType?: string;
  minRating?: number;
  maxPrice?: number;
}

export interface ProviderSearchParams {
  categoryId?: string;
  eventType?: string;
  minRating?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export interface ProviderStats {
  totalProviders: number;
  approvedProviders: number;
  pendingProviders: number;
  suspendedProviders: number;
  totalServices: number;
  averageRating: number;
}

// Fonction utilitaire pour vérifier si un provider est approuvé
export function isProviderApproved(profile: ProviderProfile): boolean {
  return profile.status === 'APPROVED';
}

// API Client pour les providers
export const providersApi = {
  // === PROFILS PROVIDERS ===
  
  /**
   * Créer un profil provider
   */
  async createProfile(data: CreateProviderProfileDto): Promise<{ message: string; profile: ProviderProfile }> {
    return apiClient.post('/providers/profile', data);
  },

  /**
   * Mettre à jour le profil provider
   */
  async updateProfile(data: UpdateProviderProfileDto): Promise<{ message: string; profile: ProviderProfile }> {
    return apiClient.put('/providers/profile', data);
  },

  /**
   * Obtenir mon profil provider
   */
  async getMyProfile(): Promise<{ profile: ProviderProfile }> {
    return apiClient.get('/providers/profile');
  },

  // === SERVICES ===

  /**
   * Créer un service
   */
  async createService(data: CreateServiceDto): Promise<{ message: string; service: Service }> {
    return apiClient.post('/providers/services', data);
  },

  /**
   * Obtenir mes services
   */
  async getMyServices(): Promise<{ services: Service[] }> {
    return apiClient.get('/providers/services');
  },

  /**
   * Mettre à jour un service
   */
  async updateService(serviceId: string, data: UpdateServiceDto): Promise<{ message: string; service: Service }> {
    return apiClient.put(`/providers/services/${serviceId}`, data);
  },

  /**
   * Supprimer un service
   */
  async deleteService(serviceId: string): Promise<{ message: string }> {
    return apiClient.delete(`/providers/services/${serviceId}`);
  },

  // === RECHERCHE ET DÉCOUVERTE ===

  /**
   * Obtenir les catégories de services
   */
  async getServiceCategories(): Promise<{ categories: ServiceCategory[] }> {
    return apiClient.get('/providers/categories');
  },

  /**
   * Rechercher des providers par géolocalisation
   */
  async searchByLocation(params: GeoSearchParams): Promise<{ providers: ProviderProfile[] }> {
    const searchParams = new URLSearchParams();
    searchParams.append('latitude', params.latitude.toString());
    searchParams.append('longitude', params.longitude.toString());
    
    if (params.radius) searchParams.append('radius', params.radius.toString());
    if (params.categoryId) searchParams.append('categoryId', params.categoryId);
    if (params.eventType) searchParams.append('eventType', params.eventType);
    if (params.minRating) searchParams.append('minRating', params.minRating.toString());
    if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());

    return apiClient.get(`/providers/search-location?${searchParams.toString()}`);
  },

  /**
   * Rechercher des providers (général)
   */
  async searchProviders(params: ProviderSearchParams): Promise<{ providers: ProviderProfile[] }> {
    const searchParams = new URLSearchParams();
    
    if (params.categoryId) searchParams.append('categoryId', params.categoryId);
    if (params.eventType) searchParams.append('eventType', params.eventType);
    if (params.minRating) searchParams.append('minRating', params.minRating.toString());
    if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient.get(`/providers${query}`);
  },

  /**
   * Obtenir tous les providers approuvés
   */
  async getApprovedProviders(params?: {
    categoryId?: string;
    minRating?: number;
    limit?: number;
    offset?: number;
  }): Promise<{ providers: ProviderProfile[] }> {
    const searchParams = new URLSearchParams();
    if (params?.categoryId) searchParams.append('categoryId', params.categoryId);
    if (params?.minRating) searchParams.append('minRating', params.minRating.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient.get(`/providers${query}`);
  },

  // === ADMIN ===

  /**
   * Obtenir tous les providers (admin)
   */
  async getAllProviders(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ providers: ProviderProfile[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient.get(`/providers/admin${query}`);
  },

  /**
   * Approuver un provider (admin)
   */
  async approveProvider(providerId: string): Promise<{ message: string; provider: ProviderProfile }> {
    return apiClient.put(`/providers/admin/${providerId}/approve`);
  },

  /**
   * Rejeter un provider (admin)
   */
  async rejectProvider(providerId: string): Promise<{ message: string; provider: ProviderProfile }> {
    return apiClient.put(`/providers/admin/${providerId}/reject`);
  },

  /**
   * Suspendre un provider (admin)
   */
  async suspendProvider(providerId: string): Promise<{ message: string; provider: ProviderProfile }> {
    return apiClient.put(`/providers/admin/${providerId}/suspend`);
  },

  /**
   * Supprimer un provider (admin)
   */
  async deleteProvider(providerId: string): Promise<{ message: string }> {
    return apiClient.delete(`/providers/admin/${providerId}`);
  },

  /**
   * Obtenir les statistiques providers (admin)
   */
  async getStats(): Promise<{ stats: ProviderStats }> {
    return apiClient.get('/providers/admin/stats');
  },

};