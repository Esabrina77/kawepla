import { apiClient } from './apiClient';

export interface ServicePurchasePlan {
  id: string;
  slug: string;
  tier?: string | null;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  features: string[];
  isHighlighted?: boolean;
  limits: {
    invitations: number;
    guests: number;
    photos: number;
    designs: number;
    aiRequests: number;
  };
}

export interface AdditionalService {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: 'guests' | 'photos' | 'designs' | 'aiRequests' | 'invitations';
  quantity: number;
  unit?: string | null;
}

export class StripeApi {
  async getPlans(): Promise<ServicePurchasePlan[]> {
    return await apiClient.get('/subscriptions/plans');
  }

  async createCheckoutSession(planId: string): Promise<{ url: string; sessionId: string }> {
    return await apiClient.post('/subscriptions/create-checkout-session', { planId });
  }

  async confirmPayment(planId: string): Promise<any> {
    return await apiClient.post('/subscriptions/confirm-payment', { planId });
  }

  async changePlan(planId: string): Promise<any> {
    return await apiClient.post('/subscriptions/change-plan', { planId });
  }

  async getUserLimitsAndUsage(): Promise<any> {
    return await apiClient.get('/subscriptions/limits');
  }

  async getAdditionalServices(): Promise<AdditionalService[]> {
    return await apiClient.get('/subscriptions/additional-services');
  }

  async createAdditionalServiceCheckoutSession(serviceId: string): Promise<{ url: string; sessionId: string }> {
    return await apiClient.post('/subscriptions/create-additional-service-checkout-session', { serviceId });
  }

  async confirmAdditionalService(serviceId: string, sessionId?: string): Promise<any> {
    return await apiClient.post('/subscriptions/confirm-additional-service', { serviceId, sessionId });
  }

  async getActivePurchases(): Promise<any> {
    return await apiClient.get('/subscriptions/active-purchases');
  }

  async getPurchaseHistory(): Promise<any> {
    return await apiClient.get('/subscriptions/purchase-history');
  }
}

export const stripeApi = new StripeApi(); 