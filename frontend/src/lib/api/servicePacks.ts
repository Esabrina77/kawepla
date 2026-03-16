import { apiClient } from './apiClient';

export type ServicePackType = 'BASE' | 'ADDON';
export type ServiceTier = 'FREE' | 'ESSENTIAL' | 'ELEGANT' | 'PREMIUM' | 'LUXE';

export interface ServicePackPayload {
  slug: string;
  name: string;
  description?: string;
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

export interface ServicePackResponse extends ServicePackPayload {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export class ServicePackApi {
  async list(type?: ServicePackType, includeInactive = false): Promise<ServicePackResponse[]> {
    const query = new URLSearchParams();
    if (type) query.append('type', type);
    if (includeInactive) query.append('includeInactive', 'true');
    const endpoint = query.toString() ? `/admin/service-packs?${query.toString()}` : '/admin/service-packs';
    return apiClient.get<ServicePackResponse[]>(endpoint);
  }

  async create(data: ServicePackPayload): Promise<ServicePackResponse> {
    return apiClient.post<ServicePackResponse>('/admin/service-packs', data);
  }

  async update(id: string, data: Partial<ServicePackPayload>): Promise<ServicePackResponse> {
    return apiClient.patch<ServicePackResponse>(`/admin/service-packs/${id}`, data);
  }

  async remove(id: string): Promise<void> {
    return apiClient.delete(`/admin/service-packs/${id}`);
  }
}

export const servicePackApi = new ServicePackApi();

