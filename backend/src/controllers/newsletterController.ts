import { Request, Response } from 'express';
import { NewsletterService } from '../services/newsletterService';
import { AuthRequest } from '../types';

export class NewsletterController {
  // Récupérer toutes les newsletters
  static async getNewsletters(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, status, audience } = req.query;
      
      const newsletters = await NewsletterService.getNewsletters({
        page: Number(page),
        limit: Number(limit),
        status: status as string,
        audience: audience as string,
      });

      res.json(newsletters);
    } catch (error) {
      console.error('Erreur lors de la récupération des newsletters:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  // Récupérer une newsletter par ID
  static async getNewsletterById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const newsletter = await NewsletterService.getNewsletterById(id);
      
      if (!newsletter) {
        res.status(404).json({ message: 'Newsletter introuvable' });
        return;
      }

      res.json(newsletter);
    } catch (error) {
      console.error('Erreur lors de la récupération de la newsletter:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  // Créer une nouvelle newsletter
  static async createNewsletter(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, subject, content, htmlContent, targetAudience, specificUserIds, scheduledAt } = req.body;
      const adminId = req.user!.id;

      if (!title || !subject || !content) {
        res.status(400).json({ message: 'Titre, sujet et contenu sont obligatoires' });
        return;
      }

      const newsletter = await NewsletterService.createNewsletter({
        title,
        subject,
        content,
        htmlContent,
        targetAudience,
        specificUserIds: specificUserIds || [],
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        createdBy: adminId,
      });

      res.status(201).json(newsletter);
    } catch (error) {
      console.error('Erreur lors de la création de la newsletter:', error);
      res.status(500).json({ message: 'Erreur lors de la création de la newsletter' });
    }
  }

  // Mettre à jour une newsletter
  static async updateNewsletter(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const newsletter = await NewsletterService.updateNewsletter(id, updateData);
      
      if (!newsletter) {
        res.status(404).json({ message: 'Newsletter introuvable' });
        return;
      }

      res.json(newsletter);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la newsletter:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de la newsletter' });
    }
  }

  // Supprimer une newsletter
  static async deleteNewsletter(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const success = await NewsletterService.deleteNewsletter(id);
      
      if (!success) {
        res.status(404).json({ message: 'Newsletter introuvable' });
        return;
      }

      res.json({ message: 'Newsletter supprimée avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression de la newsletter:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression de la newsletter' });
    }
  }

  // Envoyer une newsletter
  static async sendNewsletter(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { sendImmediately = true } = req.body;

      const result = await NewsletterService.sendNewsletter(id, sendImmediately);
      
      if (!result.success) {
        res.status(400).json({ message: result.message });
        return;
      }

      res.json({ 
        message: result.message,
        sentCount: result.sentCount 
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la newsletter:', error);
      res.status(500).json({ message: 'Erreur lors de l\'envoi de la newsletter' });
    }
  }

  // Programmer une newsletter
  static async scheduleNewsletter(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { scheduledAt } = req.body;

      if (!scheduledAt) {
        res.status(400).json({ message: 'Date de programmation obligatoire' });
        return;
      }

      const newsletter = await NewsletterService.scheduleNewsletter(id, new Date(scheduledAt));
      
      if (!newsletter) {
        res.status(404).json({ message: 'Newsletter introuvable' });
        return;
      }

      res.json(newsletter);
    } catch (error) {
      console.error('Erreur lors de la programmation de la newsletter:', error);
      res.status(500).json({ message: 'Erreur lors de la programmation de la newsletter' });
    }
  }

  // Annuler une newsletter programmée
  static async cancelNewsletter(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const newsletter = await NewsletterService.cancelNewsletter(id);
      
      if (!newsletter) {
        res.status(404).json({ message: 'Newsletter introuvable ou déjà envoyée' });
        return;
      }

      res.json(newsletter);
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la newsletter:', error);
      res.status(500).json({ message: 'Erreur lors de l\'annulation de la newsletter' });
    }
  }

  // Prévisualiser une newsletter
  static async previewNewsletter(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const preview = await NewsletterService.previewNewsletter(id);
      
      if (!preview) {
        res.status(404).json({ message: 'Newsletter introuvable' });
        return;
      }

      res.json(preview);
    } catch (error) {
      console.error('Erreur lors de la prévisualisation de la newsletter:', error);
      res.status(500).json({ message: 'Erreur lors de la prévisualisation de la newsletter' });
    }
  }

  // Statistiques d'une newsletter
  static async getNewsletterStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const stats = await NewsletterService.getNewsletterStats(id);
      
      if (!stats) {
        res.status(404).json({ message: 'Newsletter introuvable' });
        return;
      }

      res.json(stats);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
    }
  }

  // Destinataires d'une newsletter
  static async getNewsletterRecipients(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { page = 1, limit = 50, status } = req.query;

      const recipients = await NewsletterService.getNewsletterRecipients(id, {
        page: Number(page),
        limit: Number(limit),
        status: status as string,
      });

      res.json(recipients);
    } catch (error) {
      console.error('Erreur lors de la récupération des destinataires:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des destinataires' });
    }
  }

  // Récupérer les utilisateurs cibles disponibles
  static async getTargetUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { role, search, page = 1, limit = 100 } = req.query;

      const users = await NewsletterService.getTargetUsers({
        role: role as string,
        search: search as string,
        page: Number(page),
        limit: Number(limit),
      });

      res.json(users);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs cibles:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs cibles' });
    }
  }
}