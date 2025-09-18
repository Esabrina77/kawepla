import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/apiClient';

interface AdminStats {
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
    confirmed: number;
    declined: number;
    pending: number;
    emailsSent: number;
  };
  activity: {
    totalRSVPs: number;
    emailsSent: number;
    conversionRate: number;
  };
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

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Utiliser la nouvelle API des statistiques admin
      const rawStats: RawAdminStats = await apiClient.get('/admin/stats');
      console.log('Admin stats fetched:', rawStats);

      // Calculer les statistiques d'activité dérivées
      const activityStats = {
        totalRSVPs: rawStats.rsvps.confirmed + rawStats.rsvps.declined,
        emailsSent: rawStats.guests.emailsSent,
        conversionRate: rawStats.guests.total > 0 ? 
          Math.round(((rawStats.rsvps.confirmed + rawStats.rsvps.declined) / rawStats.guests.total) * 100) : 0,
      };

      setStats({
        users: rawStats.users,
        invitations: rawStats.invitations,
        guests: {
          total: rawStats.guests.total,
          confirmed: rawStats.rsvps.confirmed,
          declined: rawStats.rsvps.declined,
          pending: rawStats.rsvps.pending,
          emailsSent: rawStats.guests.emailsSent,
        },
        activity: activityStats,
      });

    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchAllData,
  };
}; 