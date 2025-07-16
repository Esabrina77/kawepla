/**
 * Contrôleur RSVP (réponse à l'invitation).
 * Gère la soumission et la consultation des réponses RSVP.
 */
import { Request, Response, NextFunction } from 'express';
import { RSVPService } from '../services/rsvpService';
import { ShareableInvitationService } from '../services/shareableInvitationService';
import { RSVPStatus } from '@prisma/client';

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

      try {
        const rsvp = await RSVPService.createRSVP(token, req.body);
        res.status(201).json(rsvp);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Cette invitation n\'est pas encore publiée' ||
              error.message === 'Ce lien d\'invitation a déjà été utilisé' ||
              error.message === 'Nombre d\'invités non autorisé') {
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
          res.status(404).json({ message: 'RSVP non trouvé' });
          return;
        }
        
        res.status(200).json(rsvp);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Invité non trouvé') {
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
   * Mettre à jour une réponse RSVP
   */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      
      if (!token) {
        res.status(400).json({ message: 'Token d\'invitation requis' });
        return;
      }

      try {
        const rsvp = await RSVPService.updateRSVP(token, req.body);
        
        if (!rsvp) {
          res.status(404).json({ message: 'RSVP non trouvé' });
          return;
        }
        
        res.status(200).json(rsvp);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Cette invitation n\'est pas encore publiée' ||
              error.message === 'Nombre d\'invités non autorisé') {
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
      // Récupérer l'invitation via le token partageable
      const invitation = await ShareableInvitationService.getInvitationByShareableToken(shareableToken, true);
      
      // Créer l'invité avec les infos personnelles et associer le lien
      const guest = await RSVPService.createGuestFromShareableLink(invitation.id, data, shareableToken);
      
      // Créer la réponse RSVP
      const rsvp = await RSVPService.createRSVP(guest.inviteToken, {
        status: data.status,
        numberOfGuests: data.numberOfGuests,
        message: data.message,
        attendingCeremony: data.attendingCeremony,
        attendingReception: data.attendingReception,
        profilePhotoUrl: data.profilePhotoUrl
      });

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
          message: rsvp.message,
          attendingCeremony: rsvp.attendingCeremony,
          attendingReception: rsvp.attendingReception
        },
        invitation: {
          coupleName: invitation.coupleName,
          weddingDate: invitation.weddingDate,
          venueName: invitation.venueName,
          venueAddress: invitation.venueAddress
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
        coupleName: invitation.coupleName,
        weddingDate: invitation.weddingDate,
        venueName: invitation.venueName,
        venueAddress: invitation.venueAddress,
        message: 'Ce lien partageable permet de répondre à l\'invitation'
      };
    } catch (error) {
      throw error;
    }
  }
} 