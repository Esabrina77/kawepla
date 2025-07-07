'use client';
import { useState, useEffect } from 'react';
import { weddingApi, UpdateWeddingConfigData } from '@/lib/api/wedding';
import { WeddingConfig } from '@/types';

export function useWeddingConfig() {
  const [config, setConfig] = useState<WeddingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await weddingApi.getConfig();
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (data: UpdateWeddingConfigData) => {
    try {
      setLoading(true);
      const updatedConfig = await weddingApi.updateConfig(data);
      setConfig(updatedConfig);
      return updatedConfig;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadPhotos = async (files: File[]) => {
    try {
      setLoading(true);
      const { urls } = await weddingApi.uploadPhotos(files);
      if (config) {
        const updatedConfig = await weddingApi.updateConfig({
          photos: [...config.photos, ...urls]
        });
        setConfig(updatedConfig);
      }
      return urls;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async (photoUrl: string) => {
    try {
      setLoading(true);
      await weddingApi.deletePhoto(photoUrl);
      if (config) {
        const updatedConfig = await weddingApi.updateConfig({
          photos: config.photos.filter(url => url !== photoUrl)
        });
        setConfig(updatedConfig);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSchedule = async (schedule: WeddingConfig['schedule']) => {
    try {
      setLoading(true);
      const updatedConfig = await weddingApi.updateSchedule(schedule);
      setConfig(updatedConfig);
      return updatedConfig;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return {
    config,
    loading,
    error,
    updateConfig,
    uploadPhotos,
    deletePhoto,
    updateSchedule,
    loadConfig
  };
} 