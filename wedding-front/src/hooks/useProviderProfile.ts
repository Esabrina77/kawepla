import { useState, useEffect } from 'react';
import { providersApi, ProviderProfile, CreateProviderProfileDto, UpdateProviderProfileDto } from '@/lib/api/providers';

export function useProviderProfile() {
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
        setProfile(null);
      } else {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement du profil');
      }
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (data: CreateProviderProfileDto): Promise<ProviderProfile> => {
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

  const updateProfile = async (data: UpdateProviderProfileDto): Promise<ProviderProfile> => {
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

  const refetch = async () => {
    await fetchProfile();
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
    refetch
  };
}
