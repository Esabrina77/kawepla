/**
 * Contrôleur RSVP (réponse à l'invitation).
 * Gère la soumission et la consultation des réponses RSVP.
 */
import { Request, Response, NextFunction } from 'express';
import { RSVPService } from '../services/rsvpService';
import { ShareableInvitationService } from '../services/shareableInvitationService';
import { NotificationService } from '../services/notificationService';
import { rsvpSchema, rsvpUpdateSchema, shareableRSVPSchema } from '../middleware/rsvpValidation';
import { ZodError } from 'zod';

export class RSVPController {
  /**
   * Récupérer les détails de l'invitation avec le token
   */
  static async getInvitation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;

      if (!token) {
        res.status(400).json({ message: 'Token d\'invitation requis' });
        return;
      }

      try {
        const invitation = await RSVPService.getInvitationByToken(token);
        res.status(200).json(invitation);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Invité non trouvé') {
            res.status(404).json({ message: error.message });
          } else if (error.message === 'Cette invitation n\'est pas encore publiée') {
            res.status(403).json({ message: error.message });
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
   * Répondre à une invitation
   */
  static async respond(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;

      if (!token) {
        res.status(400).json({ message: 'Token d\'invitation requis' });
        return;
      }

      // Validation des données RSVP
      try {
        const validatedData = await rsvpSchema.parseAsync(req.body);
        req.body = validatedData;
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            message: 'Données RSVP invalides',
            errors: error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          });
          return;
        }
        throw error;
      }

      try {
        const rsvp = await RSVPService.createRSVP(token, req.body);

        // Envoyer une notification via le service de notifications
        if (rsvp) {
          await NotificationService.sendRSVPNotification(rsvp);
        }

        res.status(201).json(rsvp);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Cette invitation n\'est pas encore publiée' ||
            error.message === 'Ce lien d\'invitation a déjà été utilisé') {
            res.status(400).json({ message: error.message });
          } else if (error.message === 'Invité non trouvé') {
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
   * Voir le statut d'une réponse RSVP
   */
  static async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;

      if (!token) {
        res.status(400).json({ message: 'Token d\'invitation requis' });
        return;
      }

      try {
        const rsvp = await RSVPService.getRSVPByToken(token);

        if (!rsvp) {
          // Pas de RSVP, c'est normal pour un invité qui n'a pas encore répondu
          res.status(404).json({ message: 'Aucune réponse RSVP trouvée pour cet invité' });
          return;
        }

        res.status(200).json(rsvp);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Invité non trouvé') {
            res.status(404).json({ message: error.message });
          } else {
            console.error('Erreur RSVP getStatus:', error);
            res.status(500).json({ message: 'Erreur interne du serveur' });
          }
        } else {
          console.error('Erreur RSVP getStatus (non-Error):', error);
          res.status(500).json({ message: 'Erreur interne du serveur' });
        }
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mettre à jour une réponse RSVP
   */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;

      if (!token) {
        res.status(400).json({ message: 'Token d\'invitation requis' });
        return;
      }

      // Validation des données RSVP
      try {
        const validatedData = await rsvpUpdateSchema.parseAsync(req.body);
        req.body = validatedData;
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            message: 'Données RSVP invalides',
            errors: error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          });
          return;
        }
        throw error;
      }

      try {
        // Utiliser la nouvelle méthode qui gère aussi la photo de profil
        const rsvp = await RSVPService.updateRSVPWithPhotoUpdate(token, req.body);

        if (!rsvp) {
          res.status(404).json({ message: 'RSVP non trouvé' });
          return;
        }

        res.status(200).json(rsvp);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Cette invitation n\'est pas encore publiée') {
            res.status(400).json({ message: error.message });
          } else if (error.message === 'Invité non trouvé' ||
            error.message === 'Aucune réponse RSVP trouvée') {
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
   * Liste des RSVPs d'une invitation
   */
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      if (!id) {
        res.status(400).json({ message: 'ID d\'invitation requis' });
        return;
      }

      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      try {
        const rsvps = await RSVPService.listRSVPs(id, userId);
        res.status(200).json(rsvps);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Invitation non trouvée ou accès non autorisé') {
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
   * Créer une réponse RSVP via lien partageable
   */
  static async createRSVPFromShareableLink(shareableToken: string, data: any) {
    try {
      // Validation des données RSVP partageable
      const validatedData = await shareableRSVPSchema.parseAsync(data);

      // Récupérer l'invitation via le token partageable
      const invitation = await ShareableInvitationService.getInvitationByShareableToken(shareableToken, true);

      // Créer l'invité avec les infos personnelles et associer le lien
      const guest = await RSVPService.createGuestFromShareableLink(invitation.id, validatedData, shareableToken);

      // Marquer le lien comme USED (annule la suppression automatique)
      await ShareableInvitationService.associateGuestToLink(shareableToken, guest.id);

      // Créer la réponse RSVP
      const rsvp = await RSVPService.createRSVP(guest.inviteToken, {
        status: validatedData.status,
        message: validatedData.message,
        profilePhotoUrl: validatedData.profilePhotoUrl,
        plusOne: validatedData.plusOne,
        plusOneName: validatedData.plusOneName,
        dietaryRestrictions: validatedData.dietaryRestrictions
      });

      // Marquer le lien comme CONFIRMED après RSVP réussi
      await ShareableInvitationService.confirmShareableLink(shareableToken);

      // Envoyer une notification via le service de notifications
      if (rsvp) {
        await NotificationService.sendRSVPNotification(rsvp);
      }

      return {
        guest: {
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          phone: guest.phone
        },
        rsvp: {
          status: rsvp.status,
          numberOfGuests: rsvp.numberOfGuests,
          message: rsvp.message
        },
        invitation: {
          eventTitle: invitation.eventTitle,
          eventDate: invitation.eventDate,
          eventTime: invitation.eventTime,
          location: invitation.location
        },
        message: 'Votre réponse a été enregistrée avec succès !'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtenir le statut d'une réponse via lien partageable
   */
  static async getStatusFromShareableLink(shareableToken: string) {
    try {
      const invitation = await ShareableInvitationService.getInvitationByShareableToken(shareableToken);

      // Pour les liens partageables, on renvoie les infos de l'invitation
      // et on indique que le lien est encore utilisable
      return {
        invitationId: invitation.id,
        shareableToken,
        eventTitle: invitation.eventTitle,
        eventDate: invitation.eventDate,
        eventTime: invitation.eventTime,
        location: invitation.location,
        message: 'Ce lien partageable permet de répondre à l\'invitation'
      };
    } catch (error) {
      throw error;
    }
  }
} 