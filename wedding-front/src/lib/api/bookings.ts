import { apiClient } from './apiClient';

export interface Booking {
  id: string;
  providerId: string;
  serviceId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  eventDate: string;
  eventTime?: string;
  eventType: string;
  guestCount?: number;
  message?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'DISPUTED';
  totalPrice: number;
  confirmedAt?: string;
  cancelledAt?: string;
  completedAt?: string;
  createdAt: string;
  service: {
    id: string;
    name: string;
    category: {
      name: string;
      icon: string;
    };
  };
}

export interface CreateBookingDto {
  clientId: string;
  providerId: string;
  serviceId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  eventDate: string;
  eventTime?: string;
  eventType: string;
  guestCount?: number;
  message?: string;
  totalPrice: number;
}

export interface BookingStats {
  totalBookings: number;
  totalRevenue: number;
  statusCounts: Record<string, number>;
}

export const bookingsApi = {
  // Obtenir les réservations d'un prestataire
  async getProviderBookings(filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ bookings: Booking[]; total: number }> {
    const searchParams = new URLSearchParams();
    
    if (filters?.status) searchParams.append('status', filters.status);
    if (filters?.limit) searchParams.append('limit', filters.limit.toString());
    if (filters?.offset) searchParams.append('offset', filters.offset.toString());

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient.get(`/bookings${query}`);
  },

  // Obtenir une réservation par ID
  async getBookingById(bookingId: string): Promise<{ booking: Booking }> {
    return apiClient.get(`/bookings/${bookingId}`);
  },

  // Mettre à jour le statut d'une réservation
  async updateBookingStatus(bookingId: string, status: string): Promise<{ message: string; booking: Booking }> {
    return apiClient.put(`/bookings/${bookingId}/status`, { status });
  },

  // Obtenir les statistiques des réservations
  async getBookingStats(): Promise<{ stats: BookingStats }> {
    return apiClient.get('/bookings/stats');
  },

  // Créer une nouvelle réservation (route publique)
  async createBooking(data: CreateBookingDto): Promise<{ message: string; booking: Booking }> {
    return apiClient.post('/bookings', data);
  }
};
