import { useState, useEffect } from 'react';
import { providersApi, ProviderProfile, Service } from '@/lib/api/providers';

export function useProviderDetail(providerId: string) {
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(!!providerId);
  const [error, setError] = useState<string | null>(null);

  const loadProviderData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger tous les providers et trouver celui avec l'ID correspondant
      const response = await providersApi.getApprovedProviders({ limit: 1000 });
      const foundProvider = response.providers.find(p => p.id === providerId);
      
      if (!foundProvider) {
        throw new Error('Provider non trouvé');
      }
      
      setProvider(foundProvider);
      
      // Charger les services du provider
      if (foundProvider.services) {
        setServices(foundProvider.services);
      }
    } catch (err) {
      console.error('Erreur chargement provider:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du provider');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (providerId) {
      loadProviderData();
    }
  }, [providerId]);

  return {
    provider,
    services,
    loading,
    error,
    refetch: loadProviderData
  };
}
