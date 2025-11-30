import { Request, Response } from 'express';
import { ServicePackService } from '../../services/servicePackService';

export class ServicePackAdminController {
  static async list(req: Request, res: Response) {
    try {
      const { type, includeInactive } = req.query;
      const normalizedType = typeof type === 'string' && type.toUpperCase() === 'ADDON' ? 'ADDON' : 'BASE';
      const includeDisabled = includeInactive === 'true';
      const packs = normalizedType === 'ADDON'
        ? await ServicePackService.listAddonPacks(includeDisabled)
        : await ServicePackService.listBasePacks(includeDisabled);
      res.json(packs);
    } catch (error) {
      console.error('Erreur lors de la récupération des packs:', error);
      res.status(500).json({ error: 'Impossible de récupérer les packs' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const pack = await ServicePackService.create(req.body);
      res.status(201).json(pack);
    } catch (error) {
      console.error('Erreur lors de la création du pack:', error);
      res.status(400).json({ error: 'Impossible de créer le pack' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const pack = await ServicePackService.update(id, req.body);
      res.json(pack);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du pack:', error);
      res.status(400).json({ error: 'Impossible de mettre à jour le pack' });
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await ServicePackService.softDelete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Erreur lors de la suppression du pack:', error);
      res.status(400).json({ error: 'Impossible de supprimer le pack' });
    }
  }
}

