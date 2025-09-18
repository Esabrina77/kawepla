import { prisma } from '../lib/prisma';

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

export interface UpdateBookingDto extends Partial<CreateBookingDto> {
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'DISPUTED';
}

export class BookingService {
  /**
   * Créer une nouvelle réservation
   */
  static async createBooking(data: CreateBookingDto) {
    // Vérifier que le prestataire et le service existent
    const service = await prisma.service.findFirst({
      where: {
        id: data.serviceId,
        providerId: data.providerId,
        isActive: true
      },
      include: {
        provider: {
          include: {
            user: true
          }
        }
      }
    });

    if (!service) {
      throw new Error('Service non trouvé ou non disponible');
    }

    // Créer la réservation
    const booking = await prisma.booking.create({
      data: {
        clientId: data.clientId,
        providerId: data.providerId,
        serviceId: data.serviceId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone || '',
        eventDate: new Date(data.eventDate),
        eventTime: data.eventTime,
        eventType: data.eventType as any,
        guestCount: data.guestCount,
        message: data.message,
        totalPrice: data.totalPrice,
        ourCommission: 0,
        providerAmount: data.totalPrice,
        status: 'PENDING'
      },
      include: {
        service: {
          include: {
            category: true
          }
        },
        provider: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    return booking;
  }

  /**
   * Obtenir les réservations d'un prestataire
   */
  static async getProviderBookings(providerId: string, filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { providerId };

    if (filters?.status && filters.status !== 'all') {
      where.status = filters.status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: {
          include: {
            category: true
          }
        },
        provider: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: filters?.limit || 50,
      skip: filters?.offset || 0
    });

    return bookings;
  }

  /**
   * Mettre à jour le statut d'une réservation
   */
  static async updateBookingStatus(bookingId: string, providerId: string, status: string) {
    // Vérifier que la réservation appartient au prestataire
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        providerId
      }
    });

    if (!booking) {
      throw new Error('Réservation non trouvée ou non autorisée');
    }

    const updateData: any = { status };

    // Ajouter les timestamps selon le statut
    switch (status) {
      case 'CONFIRMED':
        updateData.confirmedAt = new Date();
        break;
      case 'CANCELLED':
        updateData.cancelledAt = new Date();
        break;
      case 'COMPLETED':
        updateData.completedAt = new Date();
        break;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        service: {
          include: {
            category: true
          }
        },
        provider: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    return updatedBooking;
  }

  /**
   * Obtenir une réservation par ID
   */
  static async getBookingById(bookingId: string, providerId?: string) {
    const where: any = { id: bookingId };
    if (providerId) {
      where.providerId = providerId;
    }

    const booking = await prisma.booking.findFirst({
      where,
      include: {
        service: {
          include: {
            category: true
          }
        },
        provider: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    return booking;
  }

  /**
   * Obtenir les statistiques des réservations d'un prestataire
   */
  static async getProviderBookingStats(providerId: string) {
    const stats = await prisma.booking.aggregate({
      where: { providerId },
      _count: { id: true },
      _sum: { totalPrice: true }
    });

    const statusCounts = await prisma.booking.groupBy({
      by: ['status'],
      where: { providerId },
      _count: { id: true }
    });

    const statusStats = statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalBookings: stats._count.id,
      totalRevenue: stats._sum.totalPrice || 0,
      statusCounts: statusStats
    };
  }
}
