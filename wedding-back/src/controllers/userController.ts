import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AsyncRequestHandler } from '../types';
import { UserService } from '../services/userService';

export class UserController {
  static getProfile: AsyncRequestHandler = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,

          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  static updateProfile: AsyncRequestHandler = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: req.body,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,

          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  static deleteProfile: AsyncRequestHandler = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      await prisma.user.delete({
        where: { id: userId }
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  static list: AsyncRequestHandler = async (req, res, next) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,

          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      res.json(users);
    } catch (error) {
      next(error);
    }
  };

  static getById: AsyncRequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,

          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  static update: AsyncRequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;

      const user = await prisma.user.update({
        where: { id },
        data: req.body,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,

          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  static delete: AsyncRequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params;

      await prisma.user.delete({
        where: { id }
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  static getAdminStats: AsyncRequestHandler = async (req, res, next) => {
    try {
      // Vérifier que l'utilisateur est admin
      const userRole = req.user?.role;
      if (userRole !== 'ADMIN') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      // Récupérer toutes les statistiques
      const [users, invitations, guests, rsvps] = await Promise.all([
        prisma.user.findMany({
          select: {
            id: true,
            role: true,
            isActive: true,
            createdAt: true
          }
        }),
        prisma.invitation.findMany({
          select: {
            id: true,
            status: true,
            createdAt: true
          }
        }),
        prisma.guest.findMany({
          select: {
            id: true,
            invitationSentAt: true,
            createdAt: true
          }
        }),
        prisma.rSVP.findMany({
          select: {
            id: true,
            status: true,
            respondedAt: true,
            createdAt: true
          }
        })
      ]);

      // Calculer les statistiques
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const stats = {
        users: {
          total: users.length,
          active: users.filter((u: any) => u.isActive).length,
          inactive: users.filter((u: any) => !u.isActive).length,
          byRole: {
            HOST: users.filter((u: any) => u.role === 'HOST').length,
            ADMIN: users.filter((u: any) => u.role === 'ADMIN').length,
            GUEST: users.filter((u: any) => u.role === 'GUEST').length,
            PROVIDER: users.filter((u: any) => u.role === 'PROVIDER').length,
           
          },
          recentRegistrations: users.filter((u: any) => 
            new Date(u.createdAt) > thirtyDaysAgo
          ).length,
        },
        invitations: {
          total: invitations.length,
          published: invitations.filter((i: any) => i.status === 'PUBLISHED').length,
          draft: invitations.filter((i: any) => i.status === 'DRAFT').length,
          archived: invitations.filter((i: any) => i.status === 'ARCHIVED').length,
          thisMonth: invitations.filter((i: any) => 
            new Date(i.createdAt) > thisMonth
          ).length,
        },
        guests: {
          total: guests.length,
          emailsSent: guests.filter((g: any) => g.invitationSentAt).length,
        },
        rsvps: {
          total: rsvps.length,
          confirmed: rsvps.filter((r: any) => r.status === 'CONFIRMED').length,
          declined: rsvps.filter((r: any) => r.status === 'DECLINED').length,
          pending: rsvps.filter((r: any) => r.status === 'PENDING').length,
        }
      };

      res.json(stats);
    } catch (error) {
      next(error);
    }
  };

  static getAdminInvitations: AsyncRequestHandler = async (req, res, next) => {
    try {
      // Vérifier que l'utilisateur est admin
      const userRole = req.user?.role;
      if (userRole !== 'ADMIN') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      // Récupérer toutes les invitations avec les détails des utilisateurs
      const invitations = await prisma.invitation.findMany({
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          },
          _count: {
            select: {
              guests: true,
              rsvps: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(invitations);
    } catch (error) {
      next(error);
    }
  };

  static getAdminInvitationDetail: AsyncRequestHandler = async (req, res, next) => {
    try {
      // Vérifier que l'utilisateur est admin
      const userRole = req.user?.role;
      if (userRole !== 'ADMIN') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      const { id } = req.params;

      // Récupérer l'invitation avec tous les détails
      const invitation = await prisma.invitation.findUnique({
        where: { id },
        select: {
          id: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              createdAt: true,
            }
          },
          guests: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              invitationSentAt: true,
              createdAt: true,
              rsvp: {
                select: {
                  id: true,
                  status: true,
                  respondedAt: true,
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          },
          _count: {
            select: {
              guests: true,
              rsvps: true,
            }
          }
        }
      });

      if (!invitation) {
        return res.status(404).json({ message: 'Invitation non trouvée' });
      }

      res.json(invitation);
    } catch (error) {
      next(error);
    }
  };

  static getAdminInvitationWithDesign: AsyncRequestHandler = async (req, res, next) => {
    try {
      // Vérifier que l'utilisateur est admin
      const userRole = req.user?.role;
      if (userRole !== 'ADMIN') {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      const { id } = req.params;

      // Récupérer l'invitation avec le design
      const invitation = await prisma.invitation.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          },
          design: {
            select: {
              id: true,
              name: true,
              template: true,
              styles: true,
              variables: true,
            }
          },
          guests: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              invitationSentAt: true,
              createdAt: true,
              rsvp: {
                select: {
                  id: true,
                  status: true,
                  respondedAt: true,
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          },
          _count: {
            select: {
              guests: true,
              rsvps: true,
            }
          }
        }
      });

      if (!invitation) {
        return res.status(404).json({ message: 'Invitation non trouvée' });
      }

      res.json(invitation);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Récupérer les messages RSVP pour un couple
   */
  static async getRSVPMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      try {
        const messages = await UserService.getRSVPMessages(userId);
        res.status(200).json(messages);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Utilisateur non trouvé') {
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
   * Marquer un message RSVP comme lu
   */
  static async markRSVPMessageAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { rsvpId } = req.params;
      
      if (!userId) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
      }

      if (!rsvpId) {
        res.status(400).json({ message: 'ID du RSVP requis' });
        return;
      }

      try {
        await UserService.markRSVPMessageAsRead(userId, rsvpId);
        res.status(200).json({ message: 'Message marqué comme lu' });
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'RSVP non trouvé ou accès non autorisé') {
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