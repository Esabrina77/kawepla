/**
 * Service de messagerie pour la communication client-provider
 * Gère les conversations, messages et notifications en temps réel
 */
import { prisma } from '../lib/prisma';
import { ProviderConversation, ProviderMessage, ConversationStatus, ProviderMessageType } from '@prisma/client';
import { getSocketService } from './socketService';

export interface CreateProviderConversationDto {
  clientId: string;
  providerId: string;
  serviceId?: string;
  subject?: string;
  initialMessage?: string;
}

export class ProviderConversationService {
  /**
   * Créer ou récupérer une conversation client-provider
   */
  static async getOrCreateConversation(data: CreateProviderConversationDto) {
    const { clientId, providerId, serviceId, subject, initialMessage } = data;

    // Chercher une conversation existante active
    let conversation = await prisma.providerConversation.findFirst({
      where: {
        clientId,
        providerId,
        serviceId: serviceId || null,
        status: 'ACTIVE'
      },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        provider: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          }
        },
        service: {
          select: { id: true, name: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    // Si pas de conversation, en créer une nouvelle
    if (!conversation) {
      try {
        const newConversation = await prisma.providerConversation.create({
          data: {
            clientId,
            providerId,
            serviceId: serviceId || null,
            subject: subject || null,
            status: 'ACTIVE'
          },
          include: {
            client: {
              select: { id: true, firstName: true, lastName: true, email: true }
            },
            provider: {
              include: {
                user: {
                  select: { id: true, firstName: true, lastName: true, email: true }
                }
              }
            },
            service: {
              select: { id: true, name: true }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        });

        // Si un message initial est fourni, l'envoyer
        if (initialMessage) {
          await this.sendMessage(newConversation.id, clientId, initialMessage);
          // Récupérer la conversation mise à jour avec le message
          conversation = await prisma.providerConversation.findUnique({
            where: { id: newConversation.id },
            include: {
              client: {
                select: { id: true, firstName: true, lastName: true, email: true }
              },
              provider: {
                include: {
                  user: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                  }
                }
              },
              service: {
                select: { id: true, name: true }
              },
              messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
              }
            }
          });
        } else {
          conversation = newConversation;
        }
      } catch (error: any) {
        // Si erreur de contrainte unique (conversation créée entre-temps), récupérer la conversation existante
        if (error?.code === 'P2002') {
          conversation = await prisma.providerConversation.findFirst({
            where: {
              clientId,
              providerId,
              serviceId: serviceId || null,
              status: 'ACTIVE'
            },
            include: {
              client: {
                select: { id: true, firstName: true, lastName: true, email: true }
              },
              provider: {
                include: {
                  user: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                  }
                }
              },
              service: {
                select: { id: true, name: true }
              },
              messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
              }
            }
          });
        } else {
          throw error;
        }
      }
    }

    if (!conversation) {
      throw new Error('Impossible de créer ou récupérer la conversation');
    }

    return conversation;
  }

  /**
   * Envoyer un message dans une conversation client-provider
   */
  static async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    messageType: ProviderMessageType = 'TEXT'
  ): Promise<ProviderMessage> {
    // Vérifier que la conversation existe et que l'utilisateur y a accès
    const conversation = await prisma.providerConversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { clientId: senderId },
          { provider: { userId: senderId } }
        ]
      },
      include: {
        provider: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!conversation) {
      throw new Error('Conversation non trouvée ou accès non autorisé');
    }

    // Créer le message
    const message = await prisma.providerMessage.create({
      data: {
        conversationId,
        senderId,
        content,
        messageType
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, role: true }
        }
      }
    });

    // Mettre à jour la date du dernier message
    await prisma.providerConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    });

    // Diffuser le message via WebSocket pour synchronisation en temps réel
    try {
      const socketService = getSocketService();
      const io = socketService.getIO();
      
      // Diffuser le message aux participants de la conversation
      // console.log(`📤 [ProviderConversationService] Diffusion du message à provider_conversation_${conversationId}`);
      const room = `provider_conversation_${conversationId}`;
      const socketsInRoom = io.sockets.adapter.rooms.get(room);
      // console.log(`👥 [ProviderConversationService] Sockets dans la room ${room}:`, socketsInRoom?.size || 0);
      
      // Diffuser à la room de conversation
      const clientsInRoom = io.sockets.adapter.rooms.get(room);
      // console.log(`📡 [ProviderConversationService] Émission à la room ${room}, clients:`, clientsInRoom?.size || 0);
      io.to(room).emit('new_provider_message', {
        message,
        conversationId
      });
      
      // Mettre à jour la liste des conversations pour les deux participants
      // Récupérer les IDs des participants
      const conversationWithParticipants = await prisma.providerConversation.findUnique({
        where: { id: conversationId },
        select: {
          clientId: true,
          provider: {
            select: {
              userId: true
            }
          }
        }
      });
      
      if (conversationWithParticipants) {
        // Calculer les compteurs de non-lus exacts pour chaque participant
        const clientUnreadCount = await prisma.providerMessage.count({
          where: {
            conversationId,
            senderId: { not: conversationWithParticipants.clientId },
            isRead: false
          }
        });

        const providerUnreadCount = await prisma.providerMessage.count({
          where: {
            conversationId,
            senderId: { not: conversationWithParticipants.provider.userId },
            isRead: false
          }
        });

        // Notifier les deux participants avec leur compteur respectif
        io.to(`user_${conversationWithParticipants.clientId}`).emit('provider_conversation_updated', {
          conversationId,
          lastMessage: message,
          unreadCount: clientUnreadCount
        });
        io.to(`user_${conversationWithParticipants.provider.userId}`).emit('provider_conversation_updated', {
          conversationId,
          lastMessage: message,
          unreadCount: providerUnreadCount
        });
      }
    } catch (error) {
      // Si WebSocket n'est pas disponible, continuer quand même (fallback sur refresh)
      console.warn('WebSocket non disponible pour diffuser le message:', error);
    }

    return message;
  }

  /**
   * Envoyer un message automatique (système)
   */
  static async sendSystemMessage(
    conversationId: string,
    content: string,
    messageType: ProviderMessageType = 'SYSTEM'
  ): Promise<ProviderMessage> {
    // Pour les messages système, on utilise l'ID du provider comme senderId
    const conversation = await prisma.providerConversation.findUnique({
      where: { id: conversationId },
      include: {
        provider: {
          include: {
            user: true
          }
        }
      }
    });

    if (!conversation) {
      throw new Error('Conversation non trouvée');
    }

    const message = await this.sendMessage(conversationId, conversation.provider.userId, content, messageType);
    
    // Le message système sera déjà diffusé via WebSocket par sendMessage
    return message;
  }

  /**
   * Récupérer les messages d'une conversation
   */
  static async getMessages(
    conversationId: string,
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    messages: ProviderMessage[];
    total: number;
    hasMore: boolean;
  }> {
    // Vérifier l'accès
    const conversation = await prisma.providerConversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { clientId: userId },
          { provider: { userId } }
        ]
      }
    });

    if (!conversation) {
      throw new Error('Conversation non trouvée ou accès non autorisé');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.providerMessage.findMany({
        where: { conversationId },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, role: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip
      }),
      prisma.providerMessage.count({
        where: { conversationId }
      })
    ]);

    return {
      messages: messages.reverse(), // Inverser pour avoir l'ordre chronologique
      total,
      hasMore: skip + messages.length < total
    };
  }

  /**
   * Récupérer les conversations d'un client
   */
  static async getClientConversations(clientId: string) {
    const conversations = await prisma.providerConversation.findMany({
      where: {
        clientId,
        status: 'ACTIVE'
      },
      include: {
        provider: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            },
            category: true
          }
        },
        service: {
          select: { id: true, name: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: clientId }
              }
            }
          }
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });

    return conversations.map(conv => {
      const { _count, ...rest } = conv;
      return {
        ...rest,
        unreadCount: _count?.messages || 0
      };
    });
  }

  /**
   * Récupérer les conversations d'un provider
   */
  static async getProviderConversations(providerId: string) {
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      select: { userId: true }
    });

    const conversations = await prisma.providerConversation.findMany({
      where: {
        providerId,
        status: 'ACTIVE'
      },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        service: {
          select: { id: true, name: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: provider?.userId }
              }
            }
          }
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });

    return conversations.map(conv => {
      const { _count, ...rest } = conv;
      return {
        ...rest,
        unreadCount: _count?.messages || 0
      };
    });
  }

  /**
   * Récupérer une conversation par ID
   */
  static async getConversationById(
    conversationId: string,
    userId: string
  ) {
    return prisma.providerConversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { clientId: userId },
          { provider: { userId } }
        ]
      },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        provider: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            },
            category: true
          }
        },
        service: {
          select: { id: true, name: true, price: true, priceType: true }
        }
      }
    });
  }

  /**
   * Marquer les messages comme lus
   */
  static async markAsRead(conversationId: string, userId: string): Promise<void> {
    const result = await prisma.providerMessage.updateMany({
      where: {
        conversationId,
        senderId: { not: userId }, // Marquer seulement les messages des autres
        isRead: false
      },
      data: { isRead: true }
    });

    if (result.count > 0) {
      try {
        const socketService = getSocketService();
        const io = socketService.getIO();
        
        // Notifier les autres participants (qui ne sont pas userId)
        io.to(`provider_conversation_${conversationId}`).emit('provider_messages_read', {
          userId,
          conversationId
        });
        
        // S'informer soi-même (tous les onglets/clients) de reset le compteur 
        io.to(`user_${userId}`).emit('provider_unread_reset', { conversationId });
      } catch (error) {
        console.warn('Erreur lors de l\'émission websocket pour markAsRead:', error);
      }
    }
  }

  /**
   * Extraire les informations de la conversation pour pré-remplir le formulaire de réservation
   */
  static async extractBookingInfo(conversationId: string): Promise<{
    eventDate?: string;
    eventTime?: string;
    eventType?: string;
    guestCount?: number;
    message?: string;
    price?: number;
  }> {
    const messages = await prisma.providerMessage.findMany({
      where: {
        conversationId,
        messageType: 'TEXT' // Seulement les messages texte (pas les messages système)
      },
      orderBy: { createdAt: 'asc' },
      take: 100 // Analyser les 100 derniers messages
    });

    // Extraction simple basée sur des patterns (à améliorer avec NLP si nécessaire)
    const info: any = {};
    const allText = messages.map(m => m.content).join(' ').toLowerCase();

    // Extraction de date (patterns simples)
    const datePatterns = [
      /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/,
      /\b(\d{1,2}\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4})\b/i
    ];

    // Extraction d'heure
    const timePattern = /\b(\d{1,2}[h:]\d{0,2})\b/i;

    // Extraction de nombre d'invités
    const guestPattern = /\b(\d+)\s*(invités?|personnes?|gens?)\b/i;

    // Pour l'instant, on retourne les infos basiques
    // TODO: Implémenter une extraction plus sophistiquée ou demander au client de remplir manuellement

    return info;
  }
}

