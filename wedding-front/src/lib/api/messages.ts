/**
 * API Client pour la messagerie
 */
import { apiClient } from './apiClient';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender: User;
}

export interface Conversation {
  id: string;
  userId: string;
  invitationId: string;
  adminId?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'CLOSED';
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  admin?: User;
  invitation?: {
    id: string;
    title: string;
    organisateurName: string;
  };
  messages: Message[];
  _count?: {
    messages: number;
  };
}

export interface MessagesResponse {
  messages: Message[];
  total: number;
  hasMore: boolean;
}

export class MessagesAPI {
  /**
   * Obtenir ou créer une conversation pour un client
   */
  static async getOrCreateConversation(invitationId: string): Promise<Conversation> {
    return apiClient.get<Conversation>(`/messages/conversations/${invitationId}`);
  }

  /**
   * Obtenir toutes les conversations pour l'admin
   */
  static async getAdminConversations(status?: 'ACTIVE' | 'ARCHIVED' | 'CLOSED'): Promise<Conversation[]> {
    const url = status 
      ? `/messages/conversations/admin?status=${status}`
      : '/messages/conversations/admin';
    return apiClient.get<Conversation[]>(url);
  }

  /**
   * Obtenir les messages d'une conversation
   */
  static async getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<MessagesResponse> {
    return apiClient.get<MessagesResponse>(
      `/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    );
  }

  /**
   * Envoyer un message
   */
  static async sendMessage(
    conversationId: string,
    content: string,
    messageType: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT'
  ): Promise<Message> {
    return apiClient.post<Message>(
      `/messages/conversations/${conversationId}/messages`,
      { content, messageType }
    );
  }

  /**
   * Marquer les messages comme lus
   */
  static async markAsRead(conversationId: string): Promise<void> {
    return apiClient.patch(`/messages/conversations/${conversationId}/read`);
  }

  /**
   * Rechercher dans les messages
   */
  static async searchMessages(
    conversationId: string,
    query: string
  ): Promise<Message[]> {
    return apiClient.get<Message[]>(
      `/messages/conversations/${conversationId}/search?q=${encodeURIComponent(query)}`
    );
  }

  /**
   * Assigner un admin à une conversation
   */
  static async assignAdmin(
    conversationId: string,
    adminId: string
  ): Promise<Conversation> {
    return apiClient.patch<Conversation>(
      `/messages/conversations/${conversationId}/assign`,
      { adminId }
    );
  }

  /**
   * Archiver une conversation
   */
  static async archiveConversation(conversationId: string): Promise<void> {
    return apiClient.patch(`/messages/conversations/${conversationId}/archive`);
  }

  /**
   * Restaurer une conversation archivée
   */
  static async restoreConversation(conversationId: string): Promise<void> {
    return apiClient.patch(`/messages/conversations/${conversationId}/restore`);
  }

  /**
   * Obtenir le nombre de messages non lus
   */
  static async getUnreadCount(): Promise<{ count: number }> {
    return apiClient.get<{ count: number }>('/messages/unread-count');
  }
}

export default MessagesAPI; 