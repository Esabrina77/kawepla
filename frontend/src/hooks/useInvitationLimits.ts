import { useBillingLimits } from './useBillingLimits';

export const useInvitationLimits = () => {
  const { limitsData, loading } = useBillingLimits();

  const canCreateInvitation = () => {
    if (!limitsData || loading) return false;
    return limitsData.canCreateInvitation;
  };

  const canAddGuest = () => {
    if (!limitsData || loading) return false;
    return limitsData.canAddGuest;
  };

  const canImportGuests = () => {
    if (!limitsData || loading) return false;
    return limitsData.canImportGuests;
  };

  const getRemainingInvitations = () => {
    if (!limitsData) return 0;
    return limitsData.remainingInvitations;
  };

  const getRemainingGuests = () => {
    if (!limitsData) return 0;
    return limitsData.remainingGuests;
  };

  return {
    canCreateInvitation,
    canAddGuest,
    canImportGuests,
    getRemainingInvitations,
    getRemainingGuests,
    loading,
    limitsData
  };
};
