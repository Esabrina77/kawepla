import { apiClient } from './apiClient';

export interface Newsletter {
  id: string;
  title: string;
  subject: string;
  content: string;
  htmlContent?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'CANCELLED';
  targetAudience: 'ALL_USERS' | 'HOSTS_ONLY' | 'PROVIDERS_ONLY' | 'ADMINS_ONLY' | 'SPECIFIC_USERS';
  specificUserIds: string[];
  scheduledAt?: string;
  sentAt?: string;
  sentCount: number;
  openCount: number;
  clickCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count?: {
    recipients: number;
  };
  recipients?: NewsletterRecipient[];
}

export interface NewsletterRecipient {
  id: string;
  newsletterId: string;
  userId: string;
  sentAt?: string;
  openedAt?: string;
  clickedAt?: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'OPENED' | 'CLICKED';
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

export interface TargetUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface CreateNewsletterData {
  title: string;
  subject: string;
  content: string;
  htmlContent?: string;
  targetAudience: Newsletter['targetAudience'];
  specificUserIds?: string[];
  scheduledAt?: string;
}

export interface NewsletterFilters {
  page?: number;
  limit?: number;
  status?: string;
  audience?: string;
}

export interface TargetUsersFilters {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface RecipientFilters {
  page?: number;
  limit?: number;
  status?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NewsletterStats {
  newsletter: {
    id: string;
    title: string;
    status: string;
    sentAt?: string;
    sentCount: number;
  };
  stats: {
    totalRecipients: number;
    sent: number;
    failed: number;
    opened: number;
    clicked: number;
    pending: number;
  };
}

export interface SendNewsletterResponse {
  message: string;
  sentCount: number;
  errors?: string[];
}

export class NewslettersAPI {
  // Récupérer toutes les newsletters
  async getNewsletters(filters: NewsletterFilters = {}): Promise<PaginatedResponse<Newsletter>> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.audience) params.append('audience', filters.audience);

    const response = await apiClient.get(`/newsletters?${params.toString()}`) as {
      newsletters: Newsletter[];
      pagination: any;
    };
    return {
      data: response.newsletters,
      pagination: response.pagination,
    };
  }

  // Récupérer une newsletter par ID
  async getNewsletterById(id: string): Promise<Newsletter> {
    return apiClient.get(`/newsletters/${id}`);
  }

  // Créer une nouvelle newsletter
  async createNewsletter(data: CreateNewsletterData): Promise<Newsletter> {
    return apiClient.post('/newsletters', data);
  }

  // Mettre à jour une newsletter
  async updateNewsletter(id: string, data: Partial<CreateNewsletterData>): Promise<Newsletter> {
    return apiClient.put(`/newsletters/${id}`, data);
  }

  // Supprimer une newsletter
  async deleteNewsletter(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/newsletters/${id}`);
  }

  // Envoyer une newsletter
  async sendNewsletter(id: string, sendImmediately = true): Promise<SendNewsletterResponse> {
    return apiClient.post(`/newsletters/${id}/send`, { sendImmediately });
  }

  // Programmer une newsletter
  async scheduleNewsletter(id: string, scheduledAt: string): Promise<Newsletter> {
    return apiClient.post(`/newsletters/${id}/schedule`, { scheduledAt });
  }

  // Annuler une newsletter programmée
  async cancelNewsletter(id: string): Promise<Newsletter> {
    return apiClient.post(`/newsletters/${id}/cancel`);
  }

  // Prévisualiser une newsletter
  async previewNewsletter(id: string): Promise<{
    id: string;
    title: string;
    subject: string;
    content: string;
    htmlContent?: string;
    targetAudience: string;
    recipientCount: number;
    preview: {
      subject: string;
      content: string;
      htmlContent: string;
    };
  }> {
    return apiClient.get(`/newsletters/${id}/preview`);
  }

  // Statistiques d'une newsletter
  async getNewsletterStats(id: string): Promise<NewsletterStats> {
    return apiClient.get(`/newsletters/${id}/stats`);
  }

  // Destinataires d'une newsletter
  async getNewsletterRecipients(
    id: string, 
    filters: RecipientFilters = {}
  ): Promise<PaginatedResponse<NewsletterRecipient>> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);

    const response = await apiClient.get(`/newsletters/${id}/recipients?${params.toString()}`) as {
      recipients: NewsletterRecipient[];
      pagination: any;
    };
    return {
      data: response.recipients,
      pagination: response.pagination,
    };
  }

  // Récupérer les utilisateurs cibles disponibles
  async getTargetUsers(filters: TargetUsersFilters = {}): Promise<PaginatedResponse<TargetUser>> {
    const params = new URLSearchParams();
    
    if (filters.role) params.append('role', filters.role);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get(`/newsletters/target-users?${params.toString()}`) as {
      users: TargetUser[];
      pagination: any;
    };
    return {
      data: response.users,
      pagination: response.pagination,
    };
  }

  // Méthodes utilitaires
  getStatusLabel(status: Newsletter['status']): string {
    switch (status) {
      case 'DRAFT': return 'Brouillon';
      case 'SCHEDULED': return 'Programmée';
      case 'SENDING': return 'Envoi en cours';
      case 'SENT': return 'Envoyée';
      case 'CANCELLED': return 'Annulée';
      default: return status;
    }
  }

  getStatusColor(status: Newsletter['status']): string {
    switch (status) {
      case 'DRAFT': return '#6b7280';
      case 'SCHEDULED': return '#f59e0b';
      case 'SENDING': return '#3b82f6';
      case 'SENT': return '#10b981';
      case 'CANCELLED': return '#ef4444';
      default: return '#6b7280';
    }
  }

  getAudienceLabel(audience: Newsletter['targetAudience']): string {
    switch (audience) {
      case 'ALL_USERS': return 'Tous les utilisateurs';
      case 'HOSTS_ONLY': return 'Organisateurs seulement';
      case 'PROVIDERS_ONLY': return 'Prestataires seulement';
      case 'ADMINS_ONLY': return 'Administrateurs seulement';
      case 'SPECIFIC_USERS': return 'Utilisateurs spécifiques';
      default: return audience;
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Administrateur';
      case 'HOST': return 'Organisateur';
      case 'PROVIDER': return 'Prestataire';
      case 'GUEST': return 'Invité';
      default: return role;
    }
  }
}

export const newslettersApi = new NewslettersAPI();
