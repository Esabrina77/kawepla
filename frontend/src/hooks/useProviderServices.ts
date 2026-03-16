import { useState, useEffect } from 'react';
import { providersApi, Service, CreateServiceDto, UpdateServiceDto } from '@/lib/api/providers';

export function useProviderServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await providersApi.getMyServices();
      setServices(response.services);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  };

  const createService = async (data: CreateServiceDto): Promise<Service> => {
    try {
      setLoading(true);
      setError(null);
      const response = await providersApi.createService(data);
      setServices(prev => [...prev, response.service]);
      return response.service;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du service';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateService = async (serviceId: string, data: UpdateServiceDto): Promise<Service> => {
    try {
      setLoading(true);
      setError(null);
      const response = await providersApi.updateService(serviceId, data);
      setServices(prev => prev.map(service => 
        service.id === serviceId ? response.service : service
      ));
      return response.service;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du service';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (serviceId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await providersApi.deleteService(serviceId);
      setServices(prev => prev.filter(service => service.id !== serviceId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du service';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchServices();
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,
    refetch
  };
}
