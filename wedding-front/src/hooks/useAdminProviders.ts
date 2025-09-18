import { useState, useEffect } from 'react';
import { providersApi, ProviderProfile, ProviderStats } from '@/lib/api/providers';

export interface AdminProviderFilters {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export function useAdminProviders() {
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchProviders = async (filters?: AdminProviderFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await providersApi.getAllProviders({
        status: filters?.status,
        limit: filters?.limit || 100,
        offset: filters?.offset || 0
      });
      
      setProviders(response.providers);
      setTotal(response.total);
    } catch (err) {
      console.error('Erreur chargement providers:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des providers');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await providersApi.getStats();
      setStats(response.stats);
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    }
  };

  const approveProvider = async (providerId: string) => {
    try {
      const response = await providersApi.approveProvider(providerId);
      
      // Mettre à jour la liste locale
      setProviders(prev => 
        prev.map(p => p.id === providerId ? response.provider : p)
      );
      
      // Recharger les stats
      await fetchStats();
      
      return response;
    } catch (err) {
      console.error('Erreur approbation:', err);
      throw err;
    }
  };

  const rejectProvider = async (providerId: string) => {
    try {
      const response = await providersApi.rejectProvider(providerId);
      
      // Mettre à jour la liste locale
      setProviders(prev => 
        prev.map(p => p.id === providerId ? response.provider : p)
      );
      
      // Recharger les stats
      await fetchStats();
      
      return response;
    } catch (err) {
      console.error('Erreur rejet:', err);
      throw err;
    }
  };

  const suspendProvider = async (providerId: string) => {
    try {
      const response = await providersApi.suspendProvider(providerId);
      
      // Mettre à jour la liste locale
      setProviders(prev => 
        prev.map(p => p.id === providerId ? response.provider : p)
      );
      
      // Recharger les stats
      await fetchStats();
      
      return response;
    } catch (err) {
      console.error('Erreur suspension:', err);
      throw err;
    }
  };

  const deleteProvider = async (providerId: string) => {
    try {
      const response = await providersApi.deleteProvider(providerId);
      
      // Retirer de la liste locale
      setProviders(prev => 
        prev.filter(p => p.id !== providerId)
      );
      
      // Recharger les stats
      await fetchStats();
      
      return response;
    } catch (err) {
      console.error('Erreur suppression:', err);
      throw err;
    }
  };

  const loadData = async (filters?: AdminProviderFilters) => {
    await Promise.all([
      fetchProviders(filters),
      fetchStats()
    ]);
  };

  return {
    providers,
    stats,
    loading,
    error,
    total,
    fetchProviders,
    fetchStats,
    approveProvider,
    rejectProvider,
    suspendProvider,
    deleteProvider,
    loadData
  };
}
