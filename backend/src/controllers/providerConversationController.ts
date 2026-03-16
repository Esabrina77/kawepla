import { Request, Response } from 'express';
import { ProviderConversationService } from '../services/providerConversationService';

export class ProviderConversationController {
  /**
   * Créer ou récupérer une conversation client-provider
   */
  static async getOrCreateConversation(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { providerId, serviceId, subject, initialMessage } = req.body;

      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      if (!providerId) {
        res.status(400).json({ message: 'providerId requis' });
        return;
      }

      const conversation = await ProviderConversationService.getOrCreateConversation({
        clientId: userId,
        providerId,
        serviceId,
        subject,
        initialMessage
      });

      res.status(200).json({ conversation });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur interne du serveur' });
      }
    }
  }

  /**
   * Envoyer un message dans une conversation
   */
  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { conversationId } = req.params;
      const { content, messageType } = req.body;

      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      if (!content) {
        res.status(400).json({ message: 'Contenu du message requis' });
        return;
      }

      const message = await ProviderConversationService.sendMessage(
        conversationId,
        userId,
        content,
        messageType || 'TEXT'
      );

      res.status(201).json({ message });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur interne du serveur' });
      }
    }
  }

  /**
   * Récupérer les messages d'une conversation
   */
  static async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { conversationId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      const result = await ProviderConversationService.getMessages(
        conversationId,
        userId,
        page,
        limit
      );

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur interne du serveur' });
      }
    }
  }

  /**
   * Récupérer les conversations d'un client
   */
  static async getClientConversations(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      const conversations = await ProviderConversationService.getClientConversations(userId);

      res.status(200).json({ conversations });
    } catch (error) {
      res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  }

  /**
   * Récupérer les conversations d'un provider
   */
  static async getProviderConversations(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      // Récupérer le providerId depuis le ProviderProfile
      const { prisma } = await import('../lib/prisma');
      const providerProfile = await prisma.providerProfile.findUnique({
        where: { userId },
        select: { id: true }
      });

      if (!providerProfile) {
        res.status(403).json({ message: 'Profil provider non trouvé' });
        return;
      }

      const conversations = await ProviderConversationService.getProviderConversations(providerProfile.id);

      res.status(200).json({ conversations });
    } catch (error) {
      res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  }

  /**
   * Récupérer une conversation par ID
   */
  static async getConversationById(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { conversationId } = req.params;

      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      const conversation = await ProviderConversationService.getConversationById(
        conversationId,
        userId
      );

      if (!conversation) {
        res.status(404).json({ message: 'Conversation non trouvée' });
        return;
      }

      res.status(200).json({ conversation });
    } catch (error) {
      res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  }

  /**
   * Marquer les messages comme lus
   */
  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { conversationId } = req.params;

      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      await ProviderConversationService.markAsRead(conversationId, userId);

      res.status(200).json({ message: 'Messages marqués comme lus' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  }

  /**
   * Extraire les informations de la conversation pour pré-remplir le formulaire de réservation
   */
  static async extractBookingInfo(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { conversationId } = req.params;

      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      // Vérifier l'accès à la conversation
      const conversation = await ProviderConversationService.getConversationById(
        conversationId,
        userId
      );

      if (!conversation) {
        res.status(404).json({ message: 'Conversation non trouvée' });
        return;
      }

      const bookingInfo = await ProviderConversationService.extractBookingInfo(conversationId);

      res.status(200).json({ bookingInfo });
    } catch (error) {
      res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  }
}

