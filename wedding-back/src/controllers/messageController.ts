/**
 * Contrôleur de messagerie
 * Gère les requêtes HTTP pour le système de messagerie
 */
import { Request, Response, NextFunction } from 'express';
import { MessageService } from '../services/messageService';

export class MessageController {
  /**
   * Obtenir ou créer une conversation pour un client
   */
  static async getOrCreateConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { invitationId } = req.params;

      const conversation = await MessageService.getOrCreateConversation(userId, invitationId);
      res.json(conversation);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Envoyer un message
   */
  static async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { conversationId } = req.params;
      const { content, messageType = 'TEXT' } = req.body;

      if (!content || content.trim().length === 0) {
        res.status(400).json({ message: 'Le contenu du message est requis' });
        return;
      }

      const message = await MessageService.sendMessage(
        conversationId,
        userId,
        content.trim(),
        messageType
      );

      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupérer l'historique des messages
   */
  static async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { conversationId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await MessageService.getMessages(conversationId, userId, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Marquer les messages comme lus
   */
  static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { conversationId } = req.params;

      await MessageService.markMessagesAsRead(conversationId, userId);
      res.json({ message: 'Messages marqués comme lus' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupérer toutes les conversations (admin seulement)
   */
  static async getAdminConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
      const status = req.query.status as 'ACTIVE' | 'ARCHIVED' | 'CLOSED' | undefined;

      if (userRole !== 'ADMIN') {
        res.status(403).json({ message: 'Accès réservé aux administrateurs' });
        return;
      }

      const conversations = await MessageService.getAdminConversations(userId, status);
      res.json(conversations);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assigner un admin à une conversation
   */
  static async assignAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = (req as any).user.role;
      const { conversationId } = req.params;
      const { adminId } = req.body;

      if (userRole !== 'ADMIN') {
        res.status(403).json({ message: 'Accès réservé aux administrateurs' });
        return;
      }

      const conversation = await MessageService.assignAdminToConversation(conversationId, adminId);
      res.json(conversation);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Archiver une conversation
   */
  static async archiveConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { conversationId } = req.params;

      await MessageService.archiveConversation(conversationId, userId);
      res.json({ message: 'Conversation archivée' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restaurer une conversation archivée
   */
  static async restoreConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { conversationId } = req.params;

      await MessageService.restoreConversation(conversationId, userId);
      res.json({ message: 'Conversation restaurée' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtenir le nombre de messages non lus
   */
  static async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const count = await MessageService.getUnreadCount(userId);
      res.json({ unreadCount: count });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Rechercher dans les messages
   */
  static async searchMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { conversationId } = req.params;
      const { q: query } = req.query;

      if (!query || typeof query !== 'string' || query.trim().length < 2) {
        res.status(400).json({ message: 'Requête de recherche invalide (minimum 2 caractères)' });
        return;
      }

      const messages = await MessageService.searchMessages(conversationId, userId, query.trim());
      res.json(messages);
    } catch (error) {
      next(error);
    }
  }
} 