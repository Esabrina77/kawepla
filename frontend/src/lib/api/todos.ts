import { apiClient } from './apiClient';

export type TodoCategory = 'PROVIDER' | 'ADMIN' | 'DECORATION' | 'CATERING' | 'PHOTOGRAPHY' | 'MUSIC' | 'TRANSPORT' | 'VENUE' | 'GUEST_MANAGEMENT' | 'OTHER';
export type TodoStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TodoPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

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
  invitation?: {
    id: string;
    eventTitle: string;
    eventDate: string;
  };
  booking?: {
    id: string;
    service?: {
      name: string;
      category: {
        name: string;
      };
    };
    provider?: {
      businessName: string;
    };
  };
}

export interface CreateTodoDto {
  invitationId: string;
  title: string;
  description?: string;
  category?: TodoCategory;
  priority?: TodoPriority;
  dueDate?: string;
  bookingId?: string;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  category?: TodoCategory;
  status?: TodoStatus;
  priority?: TodoPriority;
  dueDate?: string;
}

export interface TodoStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  completionRate: number;
}

export const todosApi = {
  // Créer une nouvelle tâche
  async createTodo(data: CreateTodoDto): Promise<{ message: string; todo: TodoItem }> {
    return apiClient.post('/todos', data);
  },

  // Obtenir toutes les tâches d'un utilisateur
  async getAllTodos(filters?: {
    status?: TodoStatus;
    category?: TodoCategory;
    priority?: TodoPriority;
  }): Promise<{ todos: TodoItem[] }> {
    const searchParams = new URLSearchParams();
    if (filters?.status) searchParams.append('status', filters.status);
    if (filters?.category) searchParams.append('category', filters.category);
    if (filters?.priority) searchParams.append('priority', filters.priority);
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient.get(`/todos${query}`);
  },

  // Obtenir toutes les tâches d'une invitation
  async getTodosByInvitation(invitationId: string): Promise<{ todos: TodoItem[] }> {
    return apiClient.get(`/todos/invitation/${invitationId}`);
  },

  // Obtenir les statistiques des tâches pour une invitation
  async getTodoStats(invitationId: string): Promise<{ stats: TodoStats }> {
    return apiClient.get(`/todos/invitation/${invitationId}/stats`);
  },

  // Obtenir une tâche par ID
  async getTodoById(id: string): Promise<{ todo: TodoItem }> {
    return apiClient.get(`/todos/${id}`);
  },

  // Mettre à jour une tâche
  async updateTodo(id: string, data: UpdateTodoDto): Promise<{ message: string; todo: TodoItem }> {
    return apiClient.put(`/todos/${id}`, data);
  },

  // Supprimer une tâche
  async deleteTodo(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/todos/${id}`);
  }
};

