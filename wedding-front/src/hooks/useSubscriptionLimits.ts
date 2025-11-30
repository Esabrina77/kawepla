import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/apiClient';

interface ServicePurchaseLimits {
  invitations: number;
  guests: number;
  photos: number;
  designs: number;
  aiRequests: number;
}

interface ServicePurchaseUsage {
  invitations: number;
  guests: number;
  photos: number;
  designs: number;
  aiRequests?: number;
}

interface ServicePurchaseRemaining {
  invitations: number;
  guests: number;
  photos: number;
  designs: number;
  aiRequests?: number;
}

interface ServicePurchaseLimitsResponse {
  tier: string;
  limits: ServicePurchaseLimits;
  usage: ServicePurchaseUsage;
  remaining: ServicePurchaseRemaining;
}

export function useServicePurchaseLimits() {
  const [limits, setLimits] = useState<ServicePurchaseLimits | null>(null);
  const [usage, setUsage] = useState<ServicePurchaseUsage | null>(null);
  const [remaining, setRemaining] = useState<ServicePurchaseRemaining | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const fetchLimits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/subscriptions/limits');
      const data = response as ServicePurchaseLimitsResponse;
      
      setLimits(data.limits);
      setUsage(data.usage);
      setRemaining(data.remaining);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la récupération des limites');
      console.error('Erreur lors de la récupération des limites:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Rafraîchir les limites toutes les 30 secondes et quand refreshCounter change
  useEffect(() => {
    fetchLimits();
    
    const interval = setInterval(() => {
      fetchLimits();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchLimits, refreshCounter]);

  // Fonction pour forcer le rafraîchissement
  const refresh = useCallback(() => {
    setRefreshCounter(prev => prev + 1);
  }, []);

  return {
    limits,
    usage,
    remaining,
    loading,
    error,
    refresh
  };
} 