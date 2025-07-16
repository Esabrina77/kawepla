import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/apiClient';

interface SubscriptionLimits {
  invitations: number;
  guests: number;
  photos: number;
  designs: number;
}

interface SubscriptionUsage {
  invitations: number;
  guests: number;
  photos: number;
  designs: number;
}

interface SubscriptionRemaining {
  invitations: number;
  guests: number;
  photos: number;
  designs: number;
}

interface SubscriptionLimitsResponse {
  tier: string;
  limits: SubscriptionLimits;
  usage: SubscriptionUsage;
  remaining: SubscriptionRemaining;
}

export function useSubscriptionLimits() {
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null);
  const [remaining, setRemaining] = useState<SubscriptionRemaining | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const fetchLimits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/subscriptions/limits');
      const data = response as SubscriptionLimitsResponse;
      
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