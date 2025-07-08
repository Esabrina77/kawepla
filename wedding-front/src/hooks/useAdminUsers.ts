import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/apiClient';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'COUPLE' | 'GUEST';
  subscriptionTier: 'BASIC' | 'STANDARD' | 'PREMIUM';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserFilters {
  role?: 'ADMIN' | 'COUPLE' | 'GUEST';
  isActive?: boolean;
  search?: string;
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>({});

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/users');
      // L'API retourne directement un tableau, pas un objet { data: ... }
      const usersData = Array.isArray(response) ? response : [];
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      setError('Erreur lors du chargement des utilisateurs');
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    try {
      const response: User = await apiClient.patch(`/users/${id}`, data);
      
      // Mettre à jour la liste locale
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, ...response } : user
      ));
      
      return response;
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await apiClient.delete(`/users/${id}`);
      
      // Retirer de la liste locale
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      throw err;
    }
  };

  const toggleUserStatus = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    return updateUser(id, { isActive: !user.isActive });
  };

  const changeUserRole = async (id: string, role: 'ADMIN' | 'COUPLE' | 'GUEST') => {
    return updateUser(id, { role });
  };

  // Filtrer les utilisateurs
  useEffect(() => {
    let filtered = [...users];

    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    if (filters.isActive !== undefined) {
      filtered = filtered.filter(user => user.isActive === filters.isActive);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchLower) ||
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower)
      );
    }

    setFilteredUsers(filtered);
  }, [users, filters]);

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users: filteredUsers,
    allUsers: users,
    loading,
    error,
    filters,
    setFilters,
    updateUser,
    deleteUser,
    toggleUserStatus,
    changeUserRole,
    refetch: fetchUsers,
  };
}; 