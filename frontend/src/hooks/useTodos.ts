import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/apiClient';

export interface TodoItem {
  id: string;
  invitationId: string;
  userId: string;
  bookingId?: string;
  title: string;
  description?: string;
  category: TodoCategory;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type TodoCategory = 
  | 'PROVIDER' 
  | 'ADMIN' 
  | 'DECORATION' 
  | 'CATERING' 
  | 'PHOTOGRAPHY' 
  | 'MUSIC' 
  | 'TRANSPORT' 
  | 'VENUE' 
  | 'GUEST_MANAGEMENT' 
  | 'OTHER';

export type TodoStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type TodoPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export function useTodos(invitationId?: string) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    completionPercentage: number;
  } | null>(null);

  const fetchTodos = useCallback(async () => {
    if (!invitationId) return;
    setLoading(true);
    try {
      const response = await apiClient.get<{ todos: TodoItem[] }>(`/todos/invitation/${invitationId}`);
      setTodos(response.todos);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  }, [invitationId]);

  const fetchStats = useCallback(async () => {
    if (!invitationId) return;
    try {
      const response = await apiClient.get<{ stats: any }>(`/todos/stats/${invitationId}`);
      setStats(response.stats);
    } catch (err) {
      console.error('Erreur lors du chargement des stats', err);
    }
  }, [invitationId]);

  const createTodo = async (data: Partial<TodoItem>) => {
    try {
      const response = await apiClient.post<{ todo: TodoItem }>(`/todos`, {
        ...data,
        invitationId
      });
      setTodos(prev => [...prev, response.todo]);
      fetchStats();
      return response.todo;
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la création de la tâche');
    }
  };

  const updateTodo = async (id: string, data: Partial<TodoItem>) => {
    try {
      const response = await apiClient.patch<{ todo: TodoItem }>(`/todos/${id}`, data);
      setTodos(prev => prev.map(t => t.id === id ? response.todo : t));
      fetchStats();
      return response.todo;
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la mise à jour');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await apiClient.delete(`/todos/${id}`);
      setTodos(prev => prev.filter(t => t.id !== id));
      fetchStats();
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la suppression');
    }
  };

  const toggleTodoStatus = async (id: string, currentStatus: TodoStatus) => {
    const newStatus: TodoStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    return updateTodo(id, { status: newStatus });
  };

  return {
    todos,
    loading,
    error,
    stats,
    fetchTodos,
    fetchStats,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodoStatus
  };
}
