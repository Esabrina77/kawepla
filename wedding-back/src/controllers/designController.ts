import { Request, Response } from 'express';
import { DesignService } from '@/services/designService';

export class DesignController {
  static async getAll(req: Request, res: Response) {
    try {
      const isAdmin = (req as any).user?.role === 'ADMIN';
      const designs = await DesignService.getAllDesigns(isAdmin);
      res.json({ designs });
    } catch (error: any) {
      console.error('Erreur getAll:', error);
      res.status(500).json({ message: error.message || 'Erreur lors de la récupération des designs' });
    }
  }

  static async getByFilter(req: Request, res: Response) {
    try {
      const { tags, isTemplate, userId } = req.query;
      const isAdmin = (req as any).user?.role === 'ADMIN';

      const filters = {
        tags: tags ? (Array.isArray(tags) ? tags as string[] : [tags as string]) : undefined,
        isTemplate: isTemplate !== undefined ? isTemplate === 'true' : undefined,
        userId: userId as string | undefined
      };

      const designs = await DesignService.getDesignsByFilter(filters, isAdmin);
      res.json({ designs });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des designs filtrés' });
    }
  }

  // Nouvelle route : Récupérer uniquement les modèles (templates) pour la galerie
  static async getTemplates(req: Request, res: Response) {
    try {
      const isAdmin = (req as any).user?.role === 'ADMIN';
      const templates = await DesignService.getTemplates(isAdmin);
      res.json({ designs: templates });
    } catch (error: any) {
      console.error('Erreur getTemplates:', error);
      res.status(500).json({ message: error.message || 'Erreur lors de la récupération des modèles' });
    }
  }

  // Nouvelle route : Récupérer les designs personnalisés de l'utilisateur
  static async getUserDesigns(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ message: 'Non authentifié' });

      const designs = await DesignService.getUserDesigns(userId);
      res.json({ designs });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des designs personnalisés' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = req.params['id']!;
      const design = await DesignService.getDesignById(id);
      if (!design) return res.status(404).json({ message: 'Design introuvable' });
      res.json({ design });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération du design' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const data = req.body;
      const userId = (req as any).user?.id;
      const isAdmin = (req as any).user?.role === 'ADMIN';

      // Si c'est un admin, il peut créer des modèles (templates)
      // Si c'est un user, il crée un design personnalisé
      const design = await DesignService.createDesign(data, isAdmin ? undefined : userId);
      res.status(201).json({ design });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Erreur lors de la création du design' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = req.params['id']!;
      const data = req.body;
      const userId = (req as any).user?.id;
      const isAdmin = (req as any).user?.role === 'ADMIN';

      const design = await DesignService.updateDesign(id, data, userId, isAdmin);
      if (!design) return res.status(404).json({ message: 'Design introuvable' });
      res.json({ design });
    } catch (error: any) {
      if (error.message === 'Accès non autorisé') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
      res.status(400).json({ message: 'Erreur lors de la mise à jour du design' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = req.params['id']!;
      const userId = (req as any).user?.id;
      const isAdmin = (req as any).user?.role === 'ADMIN';

      await DesignService.deleteDesign(id, userId, isAdmin);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'Accès non autorisé') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }
      res.status(400).json({ message: 'Erreur lors de la suppression du design' });
    }
  }
} 