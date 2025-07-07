/**
 * Contrôleur des invitations de mariage.
 * Gère la création, la modification, la suppression et la consultation des invitations.
 */
import { Request, Response, NextFunction } from 'express';
import { InvitationService } from '../services/invitationService';
import { validateInvitationData } from '../middleware/validation';
import { ZodError } from 'zod';

export class InvitationController {
  /**
   * Créer une nouvelle invitation de mariage.
   * @route POST /api/invitations
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      try {
        const validatedData = await validateInvitationData(req.body, false);
        const invitation = await InvitationService.createInvitation(userId, validatedData);
        res.status(201).json(invitation);
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            message: 'Données invalides',
            errors: error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          });
        } else if (error instanceof Error) {
          if (error.message === 'Design non trouvé') {
            res.status(404).json({ message: error.message });
          } else {
            res.status(500).json({ message: 'Erreur interne du serveur' });
          }
        } else {
          res.status(500).json({ message: 'Erreur interne du serveur' });
        }
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupérer une invitation (privée ou publique).
   * @route GET /api/invitations/:id
   */
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      
      if (!id) {
        res.status(400).json({ message: 'ID d\'invitation requis' });
        return;
      }

      try {
        const invitation = await InvitationService.getInvitationById(id, userId);
        
        if (!invitation) {
          res.status(404).json({ message: 'Invitation non trouvée' });
          return;
        }
        
        res.status(200).json(invitation);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Invitation non trouvée' || error.message === 'Accès non autorisé') {
            res.status(404).json({ message: error.message });
          } else {
            res.status(500).json({ message: 'Erreur interne du serveur' });
          }
        } else {
          res.status(500).json({ message: 'Erreur interne du serveur' });
        }
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Modifier une invitation.
   * @route PATCH /api/invitations/:id
   */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      if (!id) {
        res.status(400).json({ message: 'ID d\'invitation requis' });
        return;
      }

      try {
        const validatedData = await validateInvitationData(req.body, true);
        const invitation = await InvitationService.updateInvitation(id, userId, validatedData);
        
        if (!invitation) {
          res.status(404).json({ message: 'Invitation non trouvée' });
          return;
        }
        
        res.status(200).json(invitation);
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            message: 'Données invalides',
            errors: error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          });
        } else if (error instanceof Error) {
          if (error.message === 'Invitation non trouvée' || error.message === 'Accès non autorisé') {
            res.status(404).json({ message: error.message });
          } else if (error.message === 'Impossible de modifier une invitation publiée') {
            res.status(400).json({ message: error.message });
          } else {
            res.status(500).json({ message: 'Erreur interne du serveur' });
          }
        } else {
          res.status(500).json({ message: 'Erreur interne du serveur' });
        }
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Supprimer une invitation.
   * @route DELETE /api/invitations/:id
   */
  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      if (!id) {
        res.status(400).json({ message: 'ID d\'invitation requis' });
        return;
      }

      try {
        await InvitationService.deleteInvitation(id, userId);
        res.status(204).send();
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Invitation non trouvée' || error.message === 'Accès non autorisé') {
            res.status(404).json({ message: error.message });
          } else if (error.message === 'Impossible de supprimer une invitation publiée') {
            res.status(400).json({ message: error.message });
          } else {
            res.status(500).json({ message: 'Erreur interne du serveur' });
          }
        } else {
          res.status(500).json({ message: 'Erreur interne du serveur' });
        }
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Statistiques de l'invitation.
   * @route GET /api/invitations/:id/stats
   */
  static async stats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      if (!id) {
        res.status(400).json({ message: 'ID d\'invitation requis' });
        return;
      }

      try {
        const stats = await InvitationService.getStats(id, userId);
        res.status(200).json(stats);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Invitation non trouvée' || error.message === 'Accès non autorisé') {
            res.status(404).json({ message: error.message });
          } else {
            res.status(500).json({ message: 'Erreur interne du serveur' });
          }
        } else {
          res.status(500).json({ message: 'Erreur interne du serveur' });
        }
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export CSV des invités.
   * @route GET /api/invitations/:id/export
   */
  static async exportCSV(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      if (!id) {
        res.status(400).json({ message: 'ID d\'invitation requis' });
        return;
      }

      try {
        const { data, filename } = await InvitationService.exportGuestsCSV(id, userId);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(data);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Invitation non trouvée' || error.message === 'Accès non autorisé') {
            res.status(404).json({ message: error.message });
          } else {
            res.status(500).json({ message: 'Erreur interne du serveur' });
          }
        } else {
          res.status(500).json({ message: 'Erreur interne du serveur' });
        }
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Publier une invitation.
   * @route POST /api/invitations/:id/publish
   */
  static async publish(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      if (!id) {
        res.status(400).json({ message: 'ID d\'invitation requis' });
        return;
      }

      try {
        const invitation = await InvitationService.publishInvitation(id, userId);
        res.status(200).json(invitation);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Invitation non trouvée' || error.message === 'Accès non autorisé') {
            res.status(404).json({ message: error.message });
          } else if (error.message === 'L\'invitation est déjà publiée') {
            res.status(400).json({ message: error.message });
          } else {
            res.status(500).json({ message: 'Erreur interne du serveur' });
          }
        } else {
          res.status(500).json({ message: 'Erreur interne du serveur' });
        }
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Archiver une invitation.
   * @route POST /api/invitations/:id/archive
   */
  static async archive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      if (!id) {
        res.status(400).json({ message: 'ID d\'invitation requis' });
        return;
      }

      try {
        const invitation = await InvitationService.archiveInvitation(id, userId);
        res.status(200).json(invitation);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Invitation non trouvée' || error.message === 'Accès non autorisé') {
            res.status(404).json({ message: error.message });
          } else {
            res.status(500).json({ message: 'Erreur interne du serveur' });
          }
        } else {
          res.status(500).json({ message: 'Erreur interne du serveur' });
        }
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupérer toutes les invitations d'un utilisateur.
   * @route GET /api/invitations
   */
  static async getUserInvitations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      try {
        const invitations = await InvitationService.getUserInvitations(userId);
        res.status(200).json(invitations);
      } catch (error) {
        res.status(500).json({ message: 'Erreur interne du serveur' });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupérer l'invitation active d'un utilisateur.
   * @route GET /api/invitations/active
   */
  static async getActiveInvitation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      try {
        const invitation = await InvitationService.getActiveInvitation(userId);
        
        if (!invitation) {
          res.status(404).json({ message: 'Aucune invitation active trouvée' });
          return;
        }
        
        res.status(200).json(invitation);
      } catch (error) {
        res.status(500).json({ message: 'Erreur interne du serveur' });
      }
    } catch (error) {
      next(error);
    }
  }
} 