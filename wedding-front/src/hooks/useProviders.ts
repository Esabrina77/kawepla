import { useState, useEffect } from 'react';
import { providersApi, ProviderProfile, ServiceCategory, Service } from '@/lib/api/providers';
import { apiClient } from '@/lib/api/apiClient';
import { 
  ServiceDto, 
  GeoSearchParams,
  CreateProviderProfileDto 
} from '@/types';

// Hook pour les catégories de services
export const useServiceCategories = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await providersApi.getServiceCategories();
      setCategories(response.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, error, refetch: fetchCategories };
};

// Hook pour la recherche simple de prestataires (PAR DÉFAUT)
export const useProviderSearch = () => {
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const searchProviders = async (params?: {
    categoryId?: string;
    minRating?: number;
    limit?: number;
    offset?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await providersApi.getApprovedProviders(params);
      setProviders(response.providers);
      setTotal(response.providers.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
      setProviders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const searchByLocation = async (params: GeoSearchParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await providersApi.searchByLocation(params);
      setProviders(response.providers);
      setTotal(response.providers.length); // searchByLocation ne retourne pas total
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche géolocalisée');
      setProviders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocationAndSearch = async (params: Omit<GeoSearchParams, 'latitude' | 'longitude'>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Utiliser l'API de géolocalisation du navigateur
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const fullParams: GeoSearchParams = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              ...params
            };
            searchByLocation(fullParams);
          },
          (error) => {
            setError('Erreur de géolocalisation: ' + error.message);
            setLoading(false);
          }
        );
      } else {
        setError('Géolocalisation non supportée par ce navigateur');
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la géolocalisation');
      setLoading(false);
    }
  };

  return {
    providers,
    loading,
    error,
    total,
    searchProviders,
    searchByLocation,
    getCurrentLocationAndSearch,
    clearResults: () => {
      setProviders([]);
      setTotal(0);
      setError(null);
    }
  };
};

// Hook pour le profil prestataire (pour les prestataires connectés)
export const useProviderProfile = () => {
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await providersApi.getMyProfile();
      setProfile(response.profile);
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        setProfile(null); // Pas de profil créé
      } else {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement du profil');
      }
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (data: CreateProviderProfileDto) => {
    try {
      setLoading(true);
      setError(null);
      const response = await providersApi.createProfile(data);
      setProfile(response.profile);
      return response.profile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du profil';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<CreateProviderProfileDto>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await providersApi.updateProfile(data);
      setProfile(response.profile);
      return response.profile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du profil';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    createProfile,
    updateProfile,
    refetch: fetchProfile
  };
};

// Hook pour les services d'un prestataire
export const useProviderServices = () => {
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

  const createService = async (data: any) => {
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

  const updateService = async (serviceId: string, data: any) => {
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

  const deleteService = async (serviceId: string) => {
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
    refetch: fetchServices
  };
};

// Hook utilitaire pour la géolocalisation
export const useGeolocation = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              };
              setLocation(location);
              resolve(location);
            },
            (error) => {
              const errorMessage = 'Erreur de géolocalisation: ' + error.message;
              setError(errorMessage);
              reject(new Error(errorMessage));
            }
          );
        } else {
          const errorMessage = 'Géolocalisation non supportée par ce navigateur';
          setError(errorMessage);
          reject(new Error(errorMessage));
        }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de géolocalisation';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    clearLocation: () => {
      setLocation(null);
      setError(null);
    }
  };
};

// Hook principal pour les providers (compatible avec les pages existantes)
export const useProviders = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await providersApi.getServiceCategories();
      setCategories(response.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  const getProviderByUserId = async (userId: string) => {
    try {
      if (userId === 'current') {
        const response = await providersApi.getMyProfile();
        return response.profile;
      }
      // Pour d'autres utilisateurs, on pourrait implémenter une route spécifique
      throw new Error('Fonctionnalité non implémentée');
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        return null;
      }
      throw err;
    }
  };

  const updateProviderProfile = async (data: any) => {
    try {
      const response = await providersApi.updateProfile(data);
      return response.profile;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    }
  };

  const createService = async (data: any) => {
    try {
      const response = await providersApi.createService(data);
      return response.service;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la création du service');
    }
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    getProviderByUserId,
    updateProviderProfile,
    createService
  };
};