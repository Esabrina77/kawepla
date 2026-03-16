import { apiClient } from './apiClient';

export interface ProviderConversation {
  id: string;
  clientId: string;
  providerId: string;
  serviceId?: string;
  subject?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'CLOSED';
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  provider?: {
    id: string;
    businessName: string;
    category?: {
      id: string;
      name: string;
    };
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  service?: {
    id: string;
    name: string;
  };
  messages?: ProviderMessage[];
  unreadCount?: number;
}

export interface ProviderMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: 'TEXT' | 'SYSTEM' | 'BOOKING_CREATED' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'BOOKING_COMPLETED';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface CreateProviderConversationDto {
  providerId: string;
  serviceId?: string;
  subject?: string;
  initialMessage?: string;
}

export interface SendMessageDto {
  content: string;
  messageType?: 'TEXT' | 'SYSTEM';
}

export interface MessagesResponse {
  messages: ProviderMessage[];
  total: number;
  hasMore: boolean;
}

export interface BookingInfo {
  eventDate?: string;
  eventTime?: string;
  eventType?: string;
  guestCount?: number;
  message?: string;
  price?: number;
}

// Créer ou récupérer une conversation
export async function getOrCreateProviderConversation(
  data: CreateProviderConversationDto
): Promise<ProviderConversation> {
  const response = await apiClient.post('/provider-conversations', data) as any;
  return response.conversation;
}

// Récupérer les conversations d'un client
export async function getClientConversations(): Promise<ProviderConversation[]> {
  const response = await apiClient.get('/provider-conversations/client') as any;
  return response.conversations;
}

// Récupérer les conversations d'un provider
export async function getProviderConversations(): Promise<ProviderConversation[]> {
  const response = await apiClient.get('/provider-conversations/provider') as any;
  return response.conversations;
}

// Récupérer une conversation par ID
export async function getConversationById(conversationId: string): Promise<ProviderConversation> {
  const response = await apiClient.get(`/provider-conversations/${conversationId}`) as any;
  return response.conversation;
}

// Récupérer les messages d'une conversation
export async function getConversationMessages(
  conversationId: string,
  page: number = 1,
  limit: number = 50
): Promise<MessagesResponse> {
  const response = await apiClient.get(
    `/provider-conversations/${conversationId}/messages?page=${page}&limit=${limit}`
  ) as any;
  return response;
}

// Envoyer un message
export async function sendProviderMessage(
  conversationId: string,
  data: SendMessageDto
): Promise<ProviderMessage> {
  const response = await apiClient.post(`/provider-conversations/${conversationId}/messages`, data) as any;
  return response.message;
}

// Marquer comme lu
export async function markConversationAsRead(conversationId: string): Promise<void> {
  await apiClient.put(`/provider-conversations/${conversationId}/read`);
}

// Extraire les infos pour pré-remplir le formulaire de réservation
export async function extractBookingInfo(conversationId: string): Promise<BookingInfo> {
  const response = await apiClient.get(`/provider-conversations/${conversationId}/booking-info`) as any;
  return response.bookingInfo;
}

