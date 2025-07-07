'use client';

import { useState, useEffect } from 'react';
import { Invitation } from '@/types';
import { apiClient } from '@/lib/api/apiClient';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';

export const useWedding = () => {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        if (!authApi.isAuthenticated()) {
          router.push('/auth/login');
          return;
        }

        setLoading(true);
        const data = await apiClient.get<Invitation[]>('/invitations');
        setInvitation(data[0] || null);
        setError(null);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Erreur lors du chargement des données');
        }
        setInvitation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [router]);

  const updateInvitation = async (data: Partial<Invitation>) => {
    try {
      setLoading(true);
      if (invitation) {
        const updated = await apiClient.put<Invitation>(`/invitations/${invitation.id}`, data);
        setInvitation(updated);
        setError(null);
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour des données');
    } finally {
      setLoading(false);
    }
  };

  const createInvitation = async (data: Partial<Invitation>) => {
    try {
      setLoading(true);
      const created = await apiClient.post<Invitation>('/invitations', data);
      setInvitation(created);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la création de l\'invitation');
      console.error('Error creating invitation:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    invitation,
    loading,
    error,
    updateInvitation,
    createInvitation
  };
}; 