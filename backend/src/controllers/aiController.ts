import { Request, Response } from 'express';
import { GeminiService, GenerateChecklistRequest, ImproveDescriptionRequest } from '../services/geminiService';
import { AIRequestService } from '../services/aiRequestService';
import { prisma } from '../lib/prisma';
import { AIRequestType } from '@prisma/client';

export class AIController {
  /**
   * Génère une checklist de planning pour un événement
   * POST /api/ai/generate-checklist
   */
  static async generateChecklist(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Utilisateur non authentifié' });
        return;
      }

      const data: GenerateChecklistRequest = req.body;

      // Validation basique
      if (!data.invitationId) {
        res.status(400).json({
          message: 'Le champ invitationId est requis'
        });
        return;
      }

      // Récupérer l'invitation depuis la base de données
      const invitation = await prisma.invitation.findFirst({
        where: {
          id: data.invitationId,
          userId
        },
        select: {
          eventTitle: true,
          eventDate: true,
          eventType: true
        }
      });

      if (!invitation) {
        res.status(404).json({
          message: 'Invitation non trouvée ou non autorisée'
        });
        return;
      }

      // Utiliser les données de l'invitation
      const checklistData: GenerateChecklistRequest = {
        invitationId: data.invitationId,
        eventType: invitation.eventType || data.eventType || 'OTHER',
        eventDate: invitation.eventDate.toISOString().split('T')[0],
        guestCount: data.guestCount,
        budget: data.budget,
        additionalInfo: data.additionalInfo
      };

      const result = await GeminiService.generateChecklist(checklistData);

      // Enregistrer la requête AI utilisée
      await AIRequestService.recordAIRequest(userId, AIRequestType.CHECKLIST_GENERATION);

      res.status(200).json({
        message: 'Checklist générée avec succès',
        ...result
      });
    } catch (error) {
      console.error('Erreur dans generateChecklist:', error);
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur interne du serveur' });
      }
    }
  }

  /**
   * Améliore une description de service pour les providers
   * POST /api/ai/improve-description
   */
  static async improveDescription(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Utilisateur non authentifié' });
        return;
      }

      const data: ImproveDescriptionRequest = req.body;

      // Validation basique
      if (!data.currentDescription || !data.serviceName) {
        res.status(400).json({
          message: 'Les champs currentDescription et serviceName sont requis'
        });
        return;
      }

      const result = await GeminiService.improveDescription(data);

      // Enregistrer la requête AI utilisée
      await AIRequestService.recordAIRequest(userId, AIRequestType.DESCRIPTION_IMPROVEMENT);

      res.status(200).json({
        message: 'Description améliorée avec succès',
        ...result
      });
    } catch (error) {
      console.error('Erreur dans improveDescription:', error);
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur interne du serveur' });
      }
    }
  }

  /**
   * Chat conversationnel avec l'assistant Kawepla
   * POST /api/ai/chat
   */
  static async chat(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Utilisateur non authentifié' });
        return;
      }

      const { message, conversationHistory, context } = req.body;

      // Validation basique
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        res.status(400).json({
          message: 'Le champ message est requis et doit être une chaîne non vide'
        });
        return;
      }

      const result = await GeminiService.chat({
        message: message.trim(),
        conversationHistory: conversationHistory || [],
        context: context || {}
      });

      // Enregistrer la requête AI utilisée (on peut créer un nouveau type CHAT si nécessaire)
      // Pour l'instant, on utilise un type existant ou on skip
      try {
        await AIRequestService.recordAIRequest(userId, AIRequestType.CHECKLIST_GENERATION);
      } catch (error) {
        // Ignorer les erreurs d'enregistrement pour ne pas bloquer le chat
        console.warn('Erreur lors de l\'enregistrement de la requête chat:', error);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur dans chat:', error);
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur interne du serveur' });
      }
    }
  }
}

