import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/apiClient';

interface AdminStats {
  overview: {
    totalRevenue: number;
    revenueThisMonth: number;
    totalUsers: number;
    totalInvitations: number;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
    byRole: {
      HOST: number;
      ADMIN: number;
      GUEST: number;
      PROVIDER: number;
    };
    recentRegistrations: number;
  };
  invitations: {
    total: number;
    published: number;
    draft: number;
    archived: number;
    thisMonth: number;
  };
  guests: {
    total: number;
    confirmed: number;
    declined: number;
    pending: number;
    emailsSent: number;
    totalConfirmed: number;
    totalEmailsSent: number;
  };
  revenue: {
    total: number;
    commissions: number;
    purchases: number;
    thisMonth: number;
  };
  trends: {
    month: string;
    users: number;
    revenue: number;
  }[];
  categories: {
    name: string;
    value: number;
  }[];
}

// Interface pour les données brutes de l'API
interface RawAdminStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    byRole: {
      organisateur: number;
      ADMIN: number;
      GUEST: number;
    };
    recentRegistrations: number;
  };
  invitations: {
    total: number;
    published: number;
    draft: number;
    archived: number;
    thisMonth: number;
  };
  guests: {
    total: number;
    emailsSent: number;
  };
  rsvps: {
    total: number;
    confirmed: number;
    declined: number;
    pending: number;
  };
}

export const useAdminStats = (days: string = '30') => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Utiliser la nouvelle API des statistiques admin avec le filtre de période
      // Ajout d'un timestamp pour éviter le cache navigateur
      const rawStats: AdminStats = await apiClient.get(`/admin/stats?days=${days}&_t=${Date.now()}`);
      console.log('Admin stats fetched for days:', days, rawStats);

      setStats(rawStats);

    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [days]);

  return {
    stats,
    loading,
    error,
    refetch: fetchAllData,
  };
}; 