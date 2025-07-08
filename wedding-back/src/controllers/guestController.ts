/**
 * Contrôleur des invités.
 * Gère l'ajout, la modification, la suppression et la liste des invités.
 */
import { Request, Response, NextFunction } from 'express';
import { GuestService } from '../services/guestService';
import multer from 'multer';

// Configuration multer pour l'upload de fichiers
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.csv', '.json', '.txt'];
    const fileExtension = '.' + file.originalname.split('.').pop()?.toLowerCase();
    
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté. Utilisez CSV, JSON ou TXT.'));
    }
  }
});

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

  /**
   * Statistiques des invités d'une invitation
   */
  static async statistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      
      const stats = await GuestService.getGuestStatistics(id, userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Envoyer une invitation par email à un invité
   */
  static async sendInvitation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params; // ID de l'invité
      const userId = (req as any).user.id;
      
      await GuestService.sendInvitationEmail(id, userId);
      res.json({ message: 'Invitation envoyée avec succès' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Envoyer toutes les invitations d'une invitation
   */
  static async sendAllInvitations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { invitationId } = req.params;
      const userId = (req as any).user.id;
      
      const results = await GuestService.sendAllInvitations(invitationId, userId);
      res.json(results);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Envoyer un rappel à un invité
   */
  static async sendReminder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params; // ID de l'invité
      const userId = (req as any).user.id;
      
      await GuestService.sendReminderEmail(id, userId);
      res.json({ message: 'Rappel envoyé avec succès' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Import en masse de fichiers
   */
  static async bulkImport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // L'invitationId peut venir soit des params (route directe) soit du body (route imbriquée)
      const invitationId = req.params.invitationId || req.body.invitationId;
      const userId = (req as any).user.id;
      const file = req.file;
      const subscriptionLimits = (req as any).subscriptionLimits;

      if (!file) {
        res.status(400).json({ message: 'Fichier requis' });
        return;
      }

      const results = await GuestService.bulkImportGuests(
        invitationId,
        userId,
        file.buffer,
        file.originalname,
        subscriptionLimits
      );

      res.json({
        message: `Import terminé: ${results.imported} invités créés, ${results.failed} échecs`,
        ...results
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Prévisualisation d'un fichier avant import
   */
  static async previewImport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // L'invitationId peut venir soit des params (route directe) soit du body (route imbriquée)
      const invitationId = req.params.invitationId || req.body.invitationId;
      const userId = (req as any).user.id;
      const file = req.file;

      if (!file) {
        res.status(400).json({ message: 'Fichier requis' });
        return;
      }

      const results = await GuestService.previewGuestImport(
        invitationId,
        userId,
        file.buffer,
        file.originalname
      );
      
      res.json({
        message: `Prévisualisation: ${results.validGuests} invités valides sur ${results.totalGuests}, ${results.errors.length} erreurs`,
        preview: results.preview,
        totalGuests: results.totalGuests,
        validGuests: results.validGuests,
        errors: results.errors,
        hasErrors: results.errors.length > 0
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Envoi en masse après import
   */
  static async bulkSendAfterImport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { invitationId } = req.params;
      const { guestIds } = req.body; // IDs spécifiques ou tous si vide
      const userId = (req as any).user.id;

      const results = await GuestService.bulkSendInvitations(invitationId, userId, guestIds);
      
      res.json({
        message: `Envoi terminé: ${results.sent} invitations envoyées, ${results.failed.length} échecs, ${results.skipped.length} ignorées`,
        ...results
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Télécharger un template de fichier
   */
  static async downloadTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { format } = req.params; // csv, json, txt

      let content: string;
      let filename: string;
      let contentType: string;

      switch (format.toLowerCase()) {
        case 'csv':
          content = 'firstName,lastName,email,phone,isVIP,dietaryRestrictions,plusOne,plusOneName\n' +
                   'Jean,Dupont,jean.dupont@email.com,0123456789,false,Végétarien,true,Marie Dupont\n' +
                   'Sophie,Martin,sophie.martin@email.com,0987654321,true,,false,';
          filename = 'template_invites.csv';
          contentType = 'text/csv';
          break;

        case 'json':
          content = JSON.stringify([
            {
              firstName: 'Jean',
              lastName: 'Dupont',
              email: 'jean.dupont@email.com',
              phone: '0123456789',
              isVIP: false,
              dietaryRestrictions: 'Végétarien',
              plusOne: true,
              plusOneName: 'Marie Dupont'
            },
            {
              firstName: 'Sophie',
              lastName: 'Martin',
              email: 'sophie.martin@email.com',
              phone: '0987654321',
              isVIP: true,
              dietaryRestrictions: '',
              plusOne: false,
              plusOneName: ''
            }
          ], null, 2);
          filename = 'template_invites.json';
          contentType = 'application/json';
          break;

        case 'txt':
          content = 'Jean,Dupont,jean.dupont@email.com,0123456789,false,Végétarien,true,Marie Dupont\n' +
                   'Sophie,Martin,sophie.martin@email.com,0987654321,true,,false,';
          filename = 'template_invites.txt';
          contentType = 'text/plain';
          break;

        default:
          res.status(400).json({ message: 'Format non supporté. Utilisez: csv, json, txt' });
          return;
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(content);
    } catch (error) {
      next(error);
    }
  }
} 

// Export du middleware multer pour les routes
export const uploadMiddleware = upload.single('file'); 