'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api/apiClient';

export interface Design {
  id: string;
  name: string;
  description: string;
  category?: string;
  tags?: string[];
  isActive: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
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
    animations: Record<string, { keyframes: Record<string, Record<string, string>> }>;
  };
  variables: {
    colors: Record<string, string>;
    typography: {
      bodyFont: string;
      headingFont: string;
      fontSize: {
        base: string;
        heading: Record<string, string>;
      };
    };
    spacing: Record<string, string>;
    breakpoints?: Record<string, string>;
  };
  components?: any;
  version?: string;
}

export interface CreateDesignData {
  name: string;
  description: string;
  category?: string;
  tags?: string[];
  isActive: boolean;
  isPremium: boolean;
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
    animations: Record<string, { keyframes: Record<string, Record<string, string>> }>;
  };
  variables: {
    colors: Record<string, string>;
    typography: {
      bodyFont: string;
      headingFont: string;
      fontSize: {
        base: string;
        heading: Record<string, string>;
      };
    };
    spacing: Record<string, string>;
    breakpoints?: Record<string, string>;
  };
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
      
      // Appel direct à l'API comme dans Postman
      const response = await apiClient.get<{ designs: Design[] }>('/designs');
      setDesigns(response.designs || []);
    } catch (err) {
      console.error('Error fetching designs:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, []);

  const getDesignById = useCallback(async (id: string): Promise<Design | null> => {
    try {
      // Appel direct à l'API comme dans Postman
      const response = await apiClient.get<{ design: Design }>(`/designs/${id}`);
      return response.design;
    } catch (err) {
      console.error(`Error fetching design ${id}:`, err);
      throw new Error(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  }, []);

  const createDesign = useCallback(async (data: CreateDesignData): Promise<Design> => {
    try {
      const response = await apiClient.post<{ design: Design }>('/designs', data);
      await fetchDesigns(); // Refresh the list
      return response.design;
    } catch (err) {
      console.error('Error creating design:', err);
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la création du design');
    }
  }, [fetchDesigns]);

  const updateDesign = useCallback(async (id: string, data: Partial<CreateDesignData>): Promise<Design> => {
    try {
      const response = await apiClient.put<{ design: Design }>(`/designs/${id}`, data);
      await fetchDesigns(); // Refresh the list
      return response.design;
    } catch (err) {
      console.error(`Error updating design ${id}:`, err);
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du design');
    }
  }, [fetchDesigns]);

  const deleteDesign = useCallback(async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/designs/${id}`);
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