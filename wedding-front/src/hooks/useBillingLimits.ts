import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { stripeApi } from '@/lib/api/stripe';

export interface BillingLimits {
  invitations: number;
  guests: number;
  photos: number;
}

export interface BillingUsage {
  invitations: number;
  guests: number;
  photos: number;
}

export interface BillingLimitsData {
  limits: BillingLimits;
  usage: BillingUsage;
  canCreateInvitation: boolean;
  canAddGuest: boolean;
  canImportGuests: boolean;
  canUploadPhotos: boolean;
  remainingInvitations: number;
  remainingGuests: number;
  remainingPhotos: number;
}

export const useBillingLimits = () => {
  const { user } = useAuth();
  const [limitsData, setLimitsData] = useState<BillingLimitsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadBillingLimits();
    }
  }, [user]);

  const loadBillingLimits = async () => {
    try {
      setLoading(true);
      setError(null);

      const [limits, activePurchases] = await Promise.all([
        stripeApi.getUserLimitsAndUsage(),
        stripeApi.getActivePurchases()
      ]);

      if (limits && activePurchases) {
        const totalLimits = activePurchases.totalLimits || {
          invitations: 0,
          guests: 0,
          photos: 0
        };

        const currentUsage = limits.usage || {
          invitations: 0,
          guests: 0,
          photos: 0
        };

        const remainingInvitations = Math.max(0, totalLimits.invitations - currentUsage.invitations);
        const remainingGuests = Math.max(0, totalLimits.guests - currentUsage.guests);
        const remainingPhotos = Math.max(0, totalLimits.photos - currentUsage.photos);

        const limitsData: BillingLimitsData = {
          limits: totalLimits,
          usage: currentUsage,
          canCreateInvitation: remainingInvitations > 0,
          canAddGuest: remainingGuests > 0,
          canImportGuests: remainingGuests > 0,
          canUploadPhotos: remainingPhotos > 0,
          remainingInvitations,
          remainingGuests,
          remainingPhotos
        };

        setLimitsData(limitsData);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des limites:', err);
      setError('Impossible de charger les limites de facturation');
      
      // Fallback avec des limites par défaut (FREE tier)
      const fallbackLimits: BillingLimitsData = {
        limits: { invitations: 1, guests: 10, photos: 5 },
        usage: { invitations: 0, guests: 0, photos: 0 },
        canCreateInvitation: true,
        canAddGuest: true,
        canImportGuests: true,
        canUploadPhotos: true,
        remainingInvitations: 1,
        remainingGuests: 10,
        remainingPhotos: 5
      };
      
      setLimitsData(fallbackLimits);
    } finally {
      setLoading(false);
    }
  };

  const refreshLimits = () => {
    loadBillingLimits();
  };

  return {
    limitsData,
    loading,
    error,
    refreshLimits
  };
};
