import { useState, useCallback } from 'react';
import axios from 'axios';

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013';

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
      const response = await axios.get(`${API_URL}/api/todos/invitation/${invitationId}`, {
        withCredentials: true
      });
      setTodos(response.data.todos);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des tâches');
    } finally {
      setLoading(false);
    }
  }, [invitationId]);

  const fetchStats = useCallback(async () => {
    if (!invitationId) return;
    try {
      const response = await axios.get(`${API_URL}/api/todos/stats/${invitationId}`, {
        withCredentials: true
      });
      setStats(response.data.stats);
    } catch (err) {
      console.error('Erreur lors du chargement des stats', err);
    }
  }, [invitationId]);

  const createTodo = async (data: Partial<TodoItem>) => {
    try {
      const response = await axios.post(`${API_URL}/api/todos`, {
        ...data,
        invitationId
      }, {
        withCredentials: true
      });
      setTodos(prev => [...prev, response.data.todo]);
      fetchStats();
      return response.data.todo;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erreur lors de la création de la tâche');
    }
  };

  const updateTodo = async (id: string, data: Partial<TodoItem>) => {
    try {
      const response = await axios.patch(`${API_URL}/api/todos/${id}`, data, {
        withCredentials: true
      });
      setTodos(prev => prev.map(t => t.id === id ? response.data.todo : t));
      fetchStats();
      return response.data.todo;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/api/todos/${id}`, {
        withCredentials: true
      });
      setTodos(prev => prev.filter(t => t.id !== id));
      fetchStats();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erreur lors de la suppression');
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
