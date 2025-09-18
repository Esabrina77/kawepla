'use client';
import { useState, useEffect, useCallback } from 'react';
import { designsApi, DesignFilters } from '@/lib/api/designs';
import { Design } from '@/types';


export interface CreateDesignData {
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  isActive: boolean;
  isPremium: boolean;
  priceType?: 'FREE' | 'ESSENTIAL' | 'ELEGANT' | 'ELEGANT' | 'LUXE';
  template: {
    layout: string;
    sections: Record<string, {
      html: string;
      position: string;
    }>;
  };
  styles: {
    base: Record<string, Record<string, string>>;
    components: Record<string, Record<string, Record<string, string>>>;
    animations?: Record<string, { keyframes: Record<string, Record<string, string>> }>;
  };
  variables: {
    colors: {
      primary: string;
      secondary: string;
      accent?: string;
      background?: string;
      text?: string;
      [key: string]: string | undefined;
    };
    typography: {
      headingFont: string;
      bodyFont: string;
      fontSize: {
        base: string;
        heading: {
          h1: string;
          h2: string;
          h3: string;
        };
      };
    };
    spacing: {
      base: string;
      sections: string;
      components: string;
    };
    breakpoints?: {
      mobile: string;
      tablet: string;
      desktop: string;
    };
  };
  customFonts?: Record<string, any>;
  backgroundImage?: string;
  components?: any;
  version?: string;
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
    } catch (err) {
      console.error('Error fetching designs:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
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
      const response = await designsApi.create(data);
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

  return {
    designs,
    loading,
    error,
    fetchDesigns,
    getDesignById,
    createDesign,
    updateDesign,
    deleteDesign,
    toggleDesignStatus
  };
} 