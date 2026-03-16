import { prisma } from '../lib/prisma';
import { ProviderConversationService } from './providerConversationService';

export interface CreateBookingDto {
  clientId: string;
  providerId: string;
  serviceId?: string; // Optionnel - permet les services personnalisés
  customServiceName?: string; // Nom du service personnalisé si serviceId n'est pas fourni
  customServiceDescription?: string; // Description du service personnalisé
  conversationId: string; // REQUIS - La conversation doit exister avant la réservation
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
   * RÈGLE MÉTIER : Une conversation active doit exister avant de créer une réservation
   */
  static async createBooking(data: CreateBookingDto) {
    // Vérifier que la conversation existe et est active
    const conversation = await prisma.providerConversation.findFirst({
      where: {
        id: data.conversationId,
        clientId: data.clientId,
        providerId: data.providerId,
        status: 'ACTIVE'
      }
    });

    if (!conversation) {
      throw new Error('Une conversation active avec ce prestataire est requise avant de créer une réservation');
    }

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
        serviceId: data.serviceId ?? undefined, // Optionnel pour les services personnalisés
        customServiceName: data.customServiceName ?? undefined,
        customServiceDescription: data.customServiceDescription ?? undefined,
        conversationId: data.conversationId, // Lier à la conversation
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
        },
        conversation: true
      }
    });

    // Envoyer un message automatique dans la conversation
    const eventDateFormatted = new Date(data.eventDate).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    await ProviderConversationService.sendSystemMessage(
      data.conversationId,
      `✅ Réservation créée le ${new Date().toLocaleDateString('fr-FR')}\n\n` +
      `📅 Date de l'événement : ${eventDateFormatted}${data.eventTime ? ` à ${data.eventTime}` : ''}\n` +
      `👥 Type : ${data.eventType}${data.guestCount ? ` - ${data.guestCount} invités` : ''}\n` +
      `💰 Montant : ${data.totalPrice}€\n\n` +
      `Statut : En attente de confirmation`,
      'BOOKING_CREATED'
    );

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
        },
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1
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
   * Obtenir les réservations d'un client
   */
  static async getClientBookings(clientId: string, filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { clientId };

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
            },
            category: true
          }
        },
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1
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
   * Envoie automatiquement un message dans la conversation liée
   */
  static async updateBookingStatus(
    bookingId: string, 
    providerId: string, 
    status: string,
    reason?: string // Raison optionnelle pour les annulations
  ) {
    // Vérifier que la réservation appartient au prestataire
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        providerId
      },
      include: {
        conversation: true
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
      case 'COMPLETED':
        updateData.completedAt = new Date();
        break;
      // Note: cancelledAt n'existe pas dans le schéma Prisma
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
        },
        conversation: true
      }
    });

    // Envoyer un message automatique dans la conversation si elle existe
    if (booking.conversationId) {
      let messageContent = '';
      let messageType: 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'BOOKING_COMPLETED' = 'BOOKING_CONFIRMED';

      switch (status) {
        case 'CONFIRMED':
          messageContent = `✅ Réservation confirmée !\n\nVotre réservation a été confirmée par le prestataire.`;
          messageType = 'BOOKING_CONFIRMED';
          break;
        case 'CANCELLED':
          messageContent = `❌ Réservation annulée${reason ? ` : ${reason}` : ''}`;
          messageType = 'BOOKING_CANCELLED';
          break;
        case 'COMPLETED':
          messageContent = `🎉 Réservation terminée\n\nL'événement s'est bien déroulé. Vous pouvez maintenant laisser un avis.`;
          messageType = 'BOOKING_COMPLETED';
          break;
      }

      if (messageContent) {
        await ProviderConversationService.sendSystemMessage(
          booking.conversationId,
          messageContent,
          messageType
        );
      }
    }

    return updatedBooking;
  }

  /**
   * Obtenir une réservation par ID
   */
  static async getBookingById(bookingId: string, userId?: string, userRole?: 'CLIENT' | 'PROVIDER') {
    const where: any = { id: bookingId };
    
    // Filtrer selon le rôle
    if (userRole === 'PROVIDER' && userId) {
      where.providerId = userId;
    } else if (userRole === 'CLIENT' && userId) {
      where.clientId = userId;
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
            },
            category: true
          }
        },
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
              take: 50
            }
          }
        }
      }
    });

    return booking;
  }

  /**
   * Obtenir une réservation par conversationId
   */
  static async getBookingByConversationId(conversationId: string, userId: string) {
    const booking = await prisma.booking.findFirst({
      where: {
        conversationId,
        OR: [
          { clientId: userId },
          { provider: { userId } }
        ]
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
            },
            category: true
          }
        },
        conversation: {
          include: {
            client: {
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

    if (!booking) {
      throw new Error('Réservation non trouvée pour cette conversation');
    }

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
