import { apiClient } from './apiClient';

export interface GenerateChecklistRequest {
  invitationId: string;
  guestCount?: number;
  budget?: number;
  additionalInfo?: string;
}

export interface ChecklistItem {
  title: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string;
  suggestedDate?: string;
  actionLink?: string;
}

export interface GenerateChecklistResponse {
  message: string;
  items: ChecklistItem[];
}

export interface ImproveDescriptionRequest {
  currentDescription: string;
  serviceName: string;
  category?: string;
  price?: number;
}

export interface ImproveDescriptionResponse {
  message: string;
  improvedDescription: string;
  suggestions?: string[];
}

export const aiApi = {
  /**
   * Génère une checklist de planning pour un événement
   */
  async generateChecklist(data: GenerateChecklistRequest): Promise<GenerateChecklistResponse> {
    return apiClient.post('/ai/generate-checklist', data);
  },

  /**
   * Améliore une description de service pour les providers
   */
  async improveDescription(data: ImproveDescriptionRequest): Promise<ImproveDescriptionResponse> {
    return apiClient.post('/ai/improve-description', data);
  }
};

