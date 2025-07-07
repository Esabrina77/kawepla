/**
 * Contrôleur des invités.
 * Gère l'ajout, la modification, la suppression et la liste des invités.
 */
import { Request, Response, NextFunction } from 'express';
import { GuestService } from '../services/guestService';

export class GuestController {
  /**
   * Créer un nouvel invité
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const guest = await GuestService.createGuest(userId, req.body);
      res.status(201).json(guest);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Voir un invité
   */
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const guest = await GuestService.getGuestById(id, userId);
      
      if (!guest) {
        res.status(404).json({ message: 'Invité non trouvé' });
        return;
      }
      
      res.json(guest);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Modifier un invité
   */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const guest = await GuestService.updateGuest(id, userId, req.body);
      
      if (!guest) {
        res.status(404).json({ message: 'Invité non trouvé' });
        return;
      }
      
      res.json(guest);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Supprimer un invité
   */
  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      
      await GuestService.deleteGuest(id, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Liste des invités d'une invitation
   */
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      
      const guests = await GuestService.listGuests(id, userId);
      res.json(guests);
    } catch (error) {
      next(error);
    }
  }
} 