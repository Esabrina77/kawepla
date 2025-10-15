/**
 * Contrôleur des invitations de mariage.
 * Gère la création, la modification, la suppression et la consultation des invitations.
 */
import { Request, Response, NextFunction } from 'express';
import { InvitationService } from '../services/invitationService';
import { validateNewInvitationData } from '../middleware/newInvitationValidation';
import { ZodError } from 'zod';

export class InvitationController {
  /**
   * Créer une nouvelle invitation avec l'API simplifiée.
   * @route POST /api/v2/invitations
   */
  static async createSimplified(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      try {
        // Validation stricte pour la nouvelle API (pas de compatibilité legacy)
        const { eventTitle, eventDate, location, eventType, eventTime, customText, designId } = req.body;
        
        if (!eventTitle || !eventDate || !location || !designId) {
          res.status(400).json({ 
            message: 'Champs obligatoires manquants',
            required: ['eventTitle', 'eventDate', 'location', 'designId']
          });
          return;
        }

        const invitationData: any = {
          eventTitle,
          eventDate: new Date(eventDate),
          location,
          eventType: eventType || 'WEDDING',
          eventTime,
          customText,
          designId
        };

        const invitation = await InvitationService.createInvitation(userId, invitationData);
        res.status(201).json({
          ...invitation,
          _apiVersion: 'v2',
          _simplified: true
        });
      } catch (error) {
        if (error instanceof Error) {
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
   * Créer une nouvelle invitation  (legacy).
   * @route POST /api/invitations
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = user?.id;
      
      console.log('🔍 Debug create invitation - User:', {
        id: userId,
        role: user?.role,
        email: user?.email
      });
      
      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      try {
        console.log('🔍 Debug create invitation - Body:', req.body);
        
        // Utiliser la nouvelle validation pure
        const validatedData = await validateNewInvitationData(req.body, false);
        
        // Convertir la date si nécessaire
        const processedData = {
          ...validatedData,
          eventDate: typeof validatedData.eventDate === 'string' ? new Date(validatedData.eventDate) : validatedData.eventDate
        };
        
        const invitation = await InvitationService.createInvitation(userId, processedData as any);
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
        // Utiliser la nouvelle validation pure pour les mises à jour
        const validatedData = await validateNewInvitationData(req.body, true);
        const invitation = await InvitationService.updateInvitation(id, userId, validatedData as any);
        
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

  /**
   * Récupérer toutes les invitations (pour l'admin).
   * @route GET /api/admin/invitations
   */
  static async getAllInvitations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = (req as any).user?.role;
      
      if (userRole !== 'ADMIN') {
        res.status(403).json({ message: 'Accès non autorisé' });
        return;
      }

      try {
        console.log('🚨 DEBUT getAllInvitations - NOUVEAU CODE');
        const invitations = await InvitationService.getAllInvitations();
        console.log('🔍 Invitations récupérées:', invitations.length);
        console.log('📊 Première invitation complète:', invitations[0] ? JSON.stringify(invitations[0], null, 2) : 'Aucune invitation');
        console.log('🚨 FIN getAllInvitations - DONNÉES COMPLÈTES');
        res.status(200).json(invitations);
      } catch (error) {
        console.error('❌ Erreur getAllInvitations:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupérer une invitation spécifique avec tous les détails (pour l'admin).
   * @route GET /api/admin/invitations/:id
   */
  static async getInvitationByIdAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = (req as any).user?.role;
      
      if (userRole !== 'ADMIN') {
        res.status(403).json({ message: 'Accès non autorisé' });
        return;
      }

      const { id } = req.params;

      try {
        console.log('═══════════════════════════════════════════');
        console.log('🔍 BACKEND - getInvitationByIdAdmin');
        console.log('ID demandé:', id);
        
        const invitation = await InvitationService.getInvitationByIdAdmin(id);
        
        console.log('✅ Invitation trouvée:');
        console.log('  - ID:', invitation.id);
        console.log('  - eventTitle:', invitation.eventTitle);
        console.log('  - Design présent?', !!invitation.design);
        
        if (invitation.design) {
          console.log('  - Design ID:', invitation.design.id);
          console.log('  - Design name:', invitation.design.name);
          console.log('  - Design template?', !!invitation.design.template);
          console.log('  - Design styles?', !!invitation.design.styles);
          console.log('  - Design variables?', !!invitation.design.variables);
        }
        console.log('═══════════════════════════════════════════');
        
        res.status(200).json(invitation);
      } catch (error) {
        if (error instanceof Error && error.message === 'Invitation non trouvée') {
          console.log('❌ Invitation non trouvée pour ID:', id);
          res.status(404).json({ message: error.message });
        } else {
          console.error('❌ Erreur getInvitationByIdAdmin:', error);
          res.status(500).json({ message: 'Erreur interne du serveur' });
        }
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Supprimer une invitation (pour l'admin).
   * @route DELETE /api/admin/invitations/:id
   */
  static async deleteInvitationAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRole = (req as any).user?.role;
      const { id } = req.params;
      
      console.log('🗑️ Tentative de suppression invitation:', id);
      console.log('👤 Rôle utilisateur:', userRole);
      
      if (userRole !== 'ADMIN') {
        console.log('❌ Accès refusé - rôle:', userRole);
        res.status(403).json({ message: 'Accès non autorisé' });
        return;
      }

      try {
        await InvitationService.deleteInvitationAdmin(id);
        console.log('✅ Invitation supprimée avec succès:', id);
        res.status(204).send();
      } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        if (error instanceof Error) {
          if (error.message === 'Invitation non trouvée') {
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
}