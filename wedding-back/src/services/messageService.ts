/**
 * Service de messagerie pour la communication client-admin
 * Gère les conversations, messages et notifications en temps réel
 */
import { prisma } from '../lib/prisma';
import { Conversation, Message, ConversationStatus, MessageType } from '@prisma/client';

export class MessageService {
  /**
   * Créer ou récupérer une conversation pour un client
   */
  static async getOrCreateConversation(userId: string, invitationId: string): Promise<Conversation> {
    // Chercher une conversation existante
    let conversation = await prisma.conversation.findFirst({
      where: {
        userId,
        invitationId,
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        admin: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    // Si pas de conversation, en créer une nouvelle
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          invitationId,
          status: 'ACTIVE'
        },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          admin: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });
    }

    return conversation;
  }

  /**
   * Envoyer un message dans une conversation
   */
  static async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    messageType: MessageType = 'TEXT'
  ): Promise<Message> {
    // Vérifier si l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: senderId },
      select: { id: true, role: true }
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Pour les admins, permettre l'accès à toutes les conversations
    // Pour les clients, seulement leurs propres conversations
    const conversationWhereClause = user.role === 'ADMIN' 
      ? { id: conversationId } // Admin peut envoyer dans toute conversation
      : {
          id: conversationId,
          OR: [
            { userId: senderId }, // Le propriétaire de la conversation
            { adminId: senderId } // L'admin assigné
          ]
        };

    // Vérifier que la conversation existe et que l'utilisateur y a accès
    const conversation = await prisma.conversation.findFirst({
      where: conversationWhereClause
    });

    if (!conversation) {
      throw new Error('Conversation non trouvée ou accès non autorisé');
    }

    // Créer le message
    const message = await prisma.message.create({
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
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    });

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
    messages: Message[];
    total: number;
    hasMore: boolean;
  }> {
    // Vérifier si l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Pour les admins, permettre l'accès à toutes les conversations
    // Pour les clients, seulement leurs propres conversations
    const conversationWhereClause = user.role === 'ADMIN' 
      ? { id: conversationId } // Admin peut accéder à toute conversation
      : {
          id: conversationId,
          OR: [
            { userId }, // Le propriétaire de la conversation
            { adminId: userId } // L'admin assigné
          ]
        };

    // Vérifier l'accès à la conversation
    const conversation = await prisma.conversation.findFirst({
      where: conversationWhereClause
    });

    if (!conversation) {
      throw new Error('Conversation non trouvée ou accès non autorisé');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, role: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.message.count({
        where: { conversationId }
      })
    ]);

    return {
      messages: messages.reverse(), // Inverser pour avoir les plus anciens en premier
      total,
      hasMore: skip + messages.length < total
    };
  }

  /**
   * Marquer les messages comme lus
   */
  static async markMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<void> {
    // Vérifier si l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Pour les admins, permettre l'accès à toutes les conversations
    const conversationWhereClause = user.role === 'ADMIN' 
      ? { id: conversationId }
      : {
          id: conversationId,
          OR: [
            { userId },
            { adminId: userId }
          ]
        };

    // Vérifier l'accès à la conversation
    const conversation = await prisma.conversation.findFirst({
      where: conversationWhereClause
    });

    if (!conversation) {
      throw new Error('Conversation non trouvée ou accès non autorisé');
    }

    // Marquer comme lus tous les messages non lus qui ne sont pas de l'utilisateur
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });
  }

  /**
   * Récupérer toutes les conversations pour l'admin
   */
  static async getAdminConversations(adminId: string, status?: 'ACTIVE' | 'ARCHIVED' | 'CLOSED'): Promise<Conversation[]> {
    // Vérifier que c'est bien un admin
    const admin = await prisma.user.findFirst({
      where: {
        id: adminId,
        role: 'ADMIN'
      }
    });

    if (!admin) {
      throw new Error('Accès non autorisé - rôle admin requis');
    }

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    return prisma.conversation.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        invitation: {
          select: { id: true, eventTitle: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { id: true, firstName: true, lastName: true, role: true }
            }
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: adminId }
              }
            }
          }
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });
  }

  /**
   * Assigner un admin à une conversation
   */
  static async assignAdminToConversation(
    conversationId: string,
    adminId: string
  ): Promise<Conversation> {
    // Vérifier que l'admin existe et a le bon rôle
    const admin = await prisma.user.findFirst({
      where: {
        id: adminId,
        role: 'ADMIN'
      }
    });

    if (!admin) {
      throw new Error('Admin non trouvé');
    }

    return prisma.conversation.update({
      where: { id: conversationId },
      data: { adminId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        admin: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });
  }

  /**
   * Archiver une conversation
   */
  static async archiveConversation(
    conversationId: string,
    userId: string
  ): Promise<void> {
    // Vérifier l'accès (seul l'admin peut archiver)
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        role: 'ADMIN'
      }
    });

    if (!user) {
      throw new Error('Seuls les admins peuvent archiver les conversations');
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'ARCHIVED' }
    });
  }

  /**
   * Restaurer une conversation archivée
   */
  static async restoreConversation(
    conversationId: string,
    userId: string
  ): Promise<void> {
    // Vérifier l'accès (seul l'admin peut restaurer)
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        role: 'ADMIN'
      }
    });

    if (!user) {
      throw new Error('Seuls les admins peuvent restaurer les conversations');
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'ACTIVE' }
    });
  }

  /**
   * Obtenir le nombre de messages non lus pour un utilisateur
   */
  static async getUnreadCount(userId: string): Promise<number> {
    // Pour un client
    const clientConversation = await prisma.conversation.findFirst({
      where: { userId }
    });

    if (clientConversation) {
      return prisma.message.count({
        where: {
          conversationId: clientConversation.id,
          senderId: { not: userId },
          isRead: false
        }
      });
    }

    // Pour un admin
    return prisma.message.count({
      where: {
        conversation: {
          adminId: userId
        },
        senderId: { not: userId },
        isRead: false
      }
    });
  }

  /**
   * Rechercher dans les messages
   */
  static async searchMessages(
    conversationId: string,
    userId: string,
    query: string
  ): Promise<Message[]> {
    // Vérifier l'accès à la conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { userId },
          { adminId: userId }
        ]
      }
    });

    if (!conversation) {
      throw new Error('Conversation non trouvée ou accès non autorisé');
    }

    return prisma.message.findMany({
      where: {
        conversationId,
        content: {
          contains: query,
          mode: 'insensitive'
        }
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  }
} 