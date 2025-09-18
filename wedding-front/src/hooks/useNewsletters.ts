import { useState, useEffect, useCallback } from 'react';
import { 
  newslettersApi, 
  Newsletter, 
  CreateNewsletterData, 
  NewsletterFilters,
  TargetUsersFilters,
  RecipientFilters,
  TargetUser,
  NewsletterRecipient,
  NewsletterStats,
  SendNewsletterResponse
} from '@/lib/api/newsletters';

interface UseNewslettersReturn {
  // État
  newsletters: Newsletter[];
  currentNewsletter: Newsletter | null;
  targetUsers: TargetUser[];
  recipients: NewsletterRecipient[];
  stats: NewsletterStats | null;
  loading: boolean;
  error: string | null;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  
  // Actions CRUD
  fetchNewsletters: (filters?: NewsletterFilters) => Promise<void>;
  fetchNewsletterById: (id: string) => Promise<void>;
  createNewsletter: (data: CreateNewsletterData) => Promise<Newsletter | null>;
  updateNewsletter: (id: string, data: Partial<CreateNewsletterData>) => Promise<Newsletter | null>;
  deleteNewsletter: (id: string) => Promise<boolean>;
  
  // Actions spécifiques
  sendNewsletter: (id: string, sendImmediately?: boolean) => Promise<SendNewsletterResponse | null>;
  scheduleNewsletter: (id: string, scheduledAt: string) => Promise<Newsletter | null>;
  cancelNewsletter: (id: string) => Promise<Newsletter | null>;
  previewNewsletter: (id: string) => Promise<any>;
  
  // Données complémentaires
  fetchTargetUsers: (filters?: TargetUsersFilters) => Promise<void>;
  fetchRecipients: (newsletterId: string, filters?: RecipientFilters) => Promise<void>;
  fetchStats: (id: string) => Promise<void>;
  
  // Utilitaires
  clearError: () => void;
  clearCurrentNewsletter: () => void;
  setFilters: (filters: NewsletterFilters) => void;
}

export const useNewsletters = (): UseNewslettersReturn => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [currentNewsletter, setCurrentNewsletter] = useState<Newsletter | null>(null);
  const [targetUsers, setTargetUsers] = useState<TargetUser[]>([]);
  const [recipients, setRecipients] = useState<NewsletterRecipient[]>([]);
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [filters, setFilters] = useState<NewsletterFilters>({});

  // Récupérer toutes les newsletters
  const fetchNewsletters = useCallback(async (newFilters?: NewsletterFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const filtersToUse = newFilters || filters;
      const response = await newslettersApi.getNewsletters(filtersToUse);
      setNewsletters(response.data);
      setPagination(response.pagination);
      
      if (newFilters) {
        setFilters(newFilters);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des newsletters');
      console.error('Erreur fetchNewsletters:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Récupérer une newsletter par ID
  const fetchNewsletterById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const newsletter = await newslettersApi.getNewsletterById(id);
      setCurrentNewsletter(newsletter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la newsletter');
      console.error('Erreur fetchNewsletterById:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer une nouvelle newsletter
  const createNewsletter = useCallback(async (data: CreateNewsletterData): Promise<Newsletter | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const newsletter = await newslettersApi.createNewsletter(data);
      
      // Ajouter à la liste locale
      setNewsletters(prev => [newsletter, ...prev]);
      
      return newsletter;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la newsletter');
      console.error('Erreur createNewsletter:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mettre à jour une newsletter
  const updateNewsletter = useCallback(async (id: string, data: Partial<CreateNewsletterData>): Promise<Newsletter | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedNewsletter = await newslettersApi.updateNewsletter(id, data);
      
      // Mettre à jour la liste locale
      setNewsletters(prev => prev.map(n => n.id === id ? updatedNewsletter : n));
      
      // Mettre à jour la newsletter courante si c'est celle-ci
      if (currentNewsletter?.id === id) {
        setCurrentNewsletter(updatedNewsletter);
      }
      
      return updatedNewsletter;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la newsletter');
      console.error('Erreur updateNewsletter:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentNewsletter]);

  // Supprimer une newsletter
  const deleteNewsletter = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await newslettersApi.deleteNewsletter(id);
      
      // Supprimer de la liste locale
      setNewsletters(prev => prev.filter(n => n.id !== id));
      
      // Nettoyer la newsletter courante si c'est celle-ci
      if (currentNewsletter?.id === id) {
        setCurrentNewsletter(null);
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de la newsletter');
      console.error('Erreur deleteNewsletter:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentNewsletter]);

  // Envoyer une newsletter
  const sendNewsletter = useCallback(async (id: string, sendImmediately = true): Promise<SendNewsletterResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await newslettersApi.sendNewsletter(id, sendImmediately);
      
      // Recharger la newsletter pour avoir le nouveau statut
      await fetchNewsletterById(id);
      
      // Recharger la liste si on est sur la page principale
      if (newsletters.length > 0) {
        await fetchNewsletters();
      }
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi de la newsletter');
      console.error('Erreur sendNewsletter:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [newsletters.length, fetchNewsletterById, fetchNewsletters]);

  // Programmer une newsletter
  const scheduleNewsletter = useCallback(async (id: string, scheduledAt: string): Promise<Newsletter | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const newsletter = await newslettersApi.scheduleNewsletter(id, scheduledAt);
      
      // Mettre à jour la liste locale
      setNewsletters(prev => prev.map(n => n.id === id ? newsletter : n));
      
      // Mettre à jour la newsletter courante si c'est celle-ci
      if (currentNewsletter?.id === id) {
        setCurrentNewsletter(newsletter);
      }
      
      return newsletter;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la programmation de la newsletter');
      console.error('Erreur scheduleNewsletter:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentNewsletter]);

  // Annuler une newsletter programmée
  const cancelNewsletter = useCallback(async (id: string): Promise<Newsletter | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const newsletter = await newslettersApi.cancelNewsletter(id);
      
      // Mettre à jour la liste locale
      setNewsletters(prev => prev.map(n => n.id === id ? newsletter : n));
      
      // Mettre à jour la newsletter courante si c'est celle-ci
      if (currentNewsletter?.id === id) {
        setCurrentNewsletter(newsletter);
      }
      
      return newsletter;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'annulation de la newsletter');
      console.error('Erreur cancelNewsletter:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentNewsletter]);

  // Prévisualiser une newsletter
  const previewNewsletter = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const preview = await newslettersApi.previewNewsletter(id);
      return preview;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la prévisualisation de la newsletter');
      console.error('Erreur previewNewsletter:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer les utilisateurs cibles
  const fetchTargetUsers = useCallback(async (filters?: TargetUsersFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await newslettersApi.getTargetUsers(filters);
      setTargetUsers(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs');
      console.error('Erreur fetchTargetUsers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer les destinataires d'une newsletter
  const fetchRecipients = useCallback(async (newsletterId: string, filters?: RecipientFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await newslettersApi.getNewsletterRecipients(newsletterId, filters);
      setRecipients(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des destinataires');
      console.error('Erreur fetchRecipients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer les statistiques d'une newsletter
  const fetchStats = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const newsletterStats = await newslettersApi.getNewsletterStats(id);
      setStats(newsletterStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
      console.error('Erreur fetchStats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Utilitaires
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCurrentNewsletter = useCallback(() => {
    setCurrentNewsletter(null);
  }, []);

  // Charger les newsletters au montage du composant
  useEffect(() => {
    fetchNewsletters();
  }, [fetchNewsletters]);

  return {
    // État
    newsletters,
    currentNewsletter,
    targetUsers,
    recipients,
    stats,
    loading,
    error,
    pagination,
    
    // Actions CRUD
    fetchNewsletters,
    fetchNewsletterById,
    createNewsletter,
    updateNewsletter,
    deleteNewsletter,
    
    // Actions spécifiques
    sendNewsletter,
    scheduleNewsletter,
    cancelNewsletter,
    previewNewsletter,
    
    // Données complémentaires
    fetchTargetUsers,
    fetchRecipients,
    fetchStats,
    
    // Utilitaires
    clearError,
    clearCurrentNewsletter,
    setFilters,
  };
};
