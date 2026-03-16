'use client';
import { useState, useEffect, useCallback } from 'react';
import { designsApi, DesignFilters } from '@/lib/api/designs';
import { Design } from '@/types';


// NOUVELLE STRUCTURE SIMPLIFIÉE
export interface CreateDesignData {
  name: string;
  description?: string;
  tags?: string[];
  isActive?: boolean;
  priceType?: 'FREE' | 'ESSENTIAL' | 'ELEGANT' | 'LUXE';

  // Format Fabric.js (essentiel)
  fabricData: any; // JSON Fabric.js complet
  editorVersion?: 'canva' | 'legacy';

  // Dimensions du canvas
  canvasWidth?: number;
  canvasHeight?: number;
  canvasFormat?: string;

  // Métadonnées
  backgroundImage?: string;
  thumbnail?: string;
  previewImage?: string;

  // Propriétaire du design (pour designs personnalisés)
  userId?: string;
  isTemplate?: boolean;
  originalDesignId?: string;
}

export function useDesigns() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDesigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Utiliser la nouvelle API
      const response = await designsApi.getAll();
      setDesigns(response || []);
      return response || [];
    } catch (err) {
      console.error('Error fetching designs:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getDesignById = useCallback(async (id: string): Promise<Design | null> => {
    try {
      // Utiliser la nouvelle API
      const response = await designsApi.getById(id);
      return response;
    } catch (err) {
      console.error(`Error fetching design ${id}:`, err);
      throw new Error(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  }, []);

  const createDesign = useCallback(async (data: CreateDesignData): Promise<Design> => {
    try {
      const response = await designsApi.create({
        ...data,
        isActive: data.isActive ?? true,
        canvasWidth: data.canvasWidth ?? 794,
        canvasHeight: data.canvasHeight ?? 1123,
        priceType: data.priceType ?? 'FREE',
        isTemplate: data.isTemplate ?? false,
      });
      await fetchDesigns(); // Refresh the list
      return response;
    } catch (err) {
      console.error('Error creating design:', err);
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la création du design');
    }
  }, [fetchDesigns]);

  const updateDesign = useCallback(async (id: string, data: Partial<CreateDesignData>): Promise<Design> => {
    try {
      const response = await designsApi.update(id, data);
      await fetchDesigns(); // Refresh the list
      return response;
    } catch (err) {
      console.error(`Error updating design ${id}:`, err);
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du design');
    }
  }, [fetchDesigns]);

  const deleteDesign = useCallback(async (id: string): Promise<void> => {
    try {
      await designsApi.delete(id);
      await fetchDesigns(); // Refresh the list
    } catch (err) {
      console.error(`Error deleting design ${id}:`, err);
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la suppression du design');
    }
  }, [fetchDesigns]);

  const toggleDesignStatus = useCallback(async (id: string, isActive: boolean): Promise<void> => {
    try {
      await updateDesign(id, { isActive });
    } catch (err) {
      console.error(`Error toggling design status ${id}:`, err);
      throw new Error(err instanceof Error ? err.message : 'Erreur lors du changement de statut');
    }
  }, [updateDesign]);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  // Nouvelle méthode : Récupérer uniquement les modèles (templates)
  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await designsApi.getTemplates();
      setDesigns(response || []);
      return response || [];
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Nouvelle méthode : Récupérer les designs personnalisés de l'utilisateur
  const fetchUserDesigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await designsApi.getUserDesigns();
      setDesigns(response || []);
      return response || [];
    } catch (err) {
      console.error('Error fetching user designs:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Nouvelle méthode : Créer un design personnalisé (basé sur un modèle)
  const createPersonalizedDesign = useCallback(async (
    originalDesignId: string,
    fabricData: any,
    name?: string,
    thumbnail?: string,
    previewImage?: string
  ): Promise<Design> => {
    try {
      const originalDesign = await getDesignById(originalDesignId);
      if (!originalDesign) {
        throw new Error('Modèle original introuvable');
      }

      const personalizedData = {
        name: name || `${originalDesign.name} - Personnalisé`,
        description: `Design personnalisé basé sur ${originalDesign.name}`,
        tags: originalDesign.tags || [],
        fabricData,
        editorVersion: 'canva' as const,
        canvasWidth: originalDesign.canvasWidth,
        canvasHeight: originalDesign.canvasHeight,
        canvasFormat: originalDesign.canvasFormat,
        isTemplate: false,
        originalDesignId,
        priceType: originalDesign.priceType || 'FREE',
        thumbnail,
        previewImage,
        isActive: true,
      };

      const response = await designsApi.createPersonalized(personalizedData);
      await fetchUserDesigns(); // Refresh user designs
      return response;
    } catch (err) {
      console.error('Error creating personalized design:', err);
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la création du design personnalisé');
    }
  }, [getDesignById, fetchUserDesigns]);

  return {
    designs,
    loading,
    error,
    fetchDesigns,
    fetchTemplates,
    fetchUserDesigns,
    getDesignById,
    createDesign,
    createPersonalizedDesign,
    updateDesign,
    deleteDesign,
    toggleDesignStatus
  };
} 