import { Request, Response } from 'express';
import { DesignService } from '@/services/designService';

export class DesignController {
  static async getAll(req: Request, res: Response) {
    try {
      const isAdmin = (req as any).user?.role === 'ADMIN';
      const designs = await DesignService.getAllDesigns(isAdmin);
      res.json({ designs });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des designs' });
    }
  }

  static async getByFilter(req: Request, res: Response) {
    try {
      const { category, tags } = req.query;
      const isAdmin = (req as any).user?.role === 'ADMIN';
      
      const filters = {
        category: category as string | undefined,
        tags: tags ? (Array.isArray(tags) ? tags as string[] : [tags as string]) : undefined
      };
      
      const designs = await DesignService.getDesignsByFilter(filters, isAdmin);
      res.json({ designs });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des designs filtrés' });
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
      const design = await DesignService.createDesign(data);
      res.status(201).json({ design });
    } catch (error) {
      res.status(400).json({ message: 'Erreur lors de la création du design' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = req.params['id']!;
      const data = req.body;
      const design = await DesignService.updateDesign(id, data);
      if (!design) return res.status(404).json({ message: 'Design introuvable' });
      res.json({ design });
    } catch (error) {
      res.status(400).json({ message: 'Erreur lors de la mise à jour du design' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = req.params['id']!;
      await DesignService.deleteDesign(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: 'Erreur lors de la suppression du design' });
    }
  }
} 