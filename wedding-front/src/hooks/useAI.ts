import { useState } from 'react';
import { aiApi, GenerateChecklistRequest, ImproveDescriptionRequest } from '@/lib/api/ai';
import { providersApi } from '@/lib/api/providers';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateChecklist = async (data: GenerateChecklistRequest) => {
    try {
      setLoading(true);
      setError(null);
      const result = await aiApi.generateChecklist(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération de la checklist';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const improveDescription = async (data: ImproveDescriptionRequest) => {
    try {
      setLoading(true);
      setError(null);
      const result = await aiApi.improveDescription(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'amélioration de la description';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateChecklist,
    improveDescription,
    loading,
    error
  };
}

