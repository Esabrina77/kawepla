import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AsyncRequestHandler } from '../types';
import { UserService } from '../services/userService';
import { InvitationService } from '../services/invitationService';

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
      console.log('🔍 DELETE /api/users/me - userId:', userId, 'role:', req.user?.role);
      
      if (!userId) {
        console.log('❌ DELETE /api/users/me - Non authentifié');
        return res.status(401).json({ message: 'Non authentifié' });
      }

      console.log('✅ DELETE /api/users/me - Suppression du compte pour userId:', userId);
      await prisma.user.delete({
        where: { id: userId }
      });

      console.log('✅ DELETE /api/users/me - Compte supprimé avec succès');
      res.status(204).send();
    } catch (error) {
      console.error('❌ DELETE /api/users/me - Erreur:', error);
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

      const daysVal = parseInt(req.query.days as string) || 30;
      console.log(`[BACKEND] Fetching admin stats for ${daysVal} days`);
      const now = new Date();
      const periodStart = new Date(now.getTime() - daysVal * 24 * 60 * 60 * 1000);

      // Récupérer toutes les statistiques en parallèle
      const [
        users, 
        invitations, 
        guests, 
        rsvps, 
        bookings, 
        purchases,
        providerProfiles
      ] = await Promise.all([
        prisma.user.findMany({
          select: { id: true, role: true, isActive: true, createdAt: true }
        }),
        prisma.invitation.findMany({
          select: { id: true, status: true, createdAt: true }
        }),
        prisma.guest.findMany({
          select: { id: true, invitationSentAt: true, createdAt: true }
        }),
        prisma.rSVP.findMany({
          select: { id: true, status: true, createdAt: true }
        }),
        prisma.booking.findMany({
          where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
          select: { ourCommission: true, createdAt: true }
        }),
        prisma.purchaseHistory.findMany({
          select: { price: true, purchasedAt: true }
        }),
        prisma.providerProfile.findMany({
          select: { categoryId: true, category: { select: { name: true } } }
        })
      ]);

      // Calcul du chiffre d'affaires
      const totalRevenue = 
        bookings.reduce((sum, b) => sum + (b.ourCommission || 0), 0) +
        purchases.reduce((sum, p) => sum + (p.price || 0), 0);

      // Revenu sur la période choisie (ex: 7 ou 30 derniers jours)
      const commissionRevenueThisPeriod = bookings
        .filter(b => new Date(b.createdAt) >= periodStart)
        .reduce((sum, b) => sum + (b.ourCommission || 0), 0);
      const purchaseRevenueThisPeriod = purchases
        .filter(p => new Date(p.purchasedAt) >= periodStart)
        .reduce((sum, p) => sum + (p.price || 0), 0);
      const revenueThisPeriod = commissionRevenueThisPeriod + purchaseRevenueThisPeriod;

      // Evolution des données (Tendances)
      const trends = [];
      
      if (daysVal <= 30) {
        // Granularité quotidienne pour 7 ou 30 jours
        for (let i = daysVal - 1; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
          const label = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
          const start = new Date(date.setHours(0, 0, 0, 0));
          const end = new Date(date.setHours(23, 59, 59, 999));

          const dayUsers = users.filter(u => {
            const d = new Date(u.createdAt);
            return d >= start && d <= end;
          }).length;

          const dayComm = bookings
            .filter(b => {
              const d = new Date(b.createdAt);
              return d >= start && d <= end;
            })
            .reduce((sum, b) => sum + (b.ourCommission || 0), 0);

          const dayPurchases = purchases
            .filter(p => {
              const d = new Date(p.purchasedAt);
              return d >= start && d <= end;
            })
            .reduce((sum, p) => sum + (p.price || 0), 0);

          trends.push({
            month: label, // On garde 'month' comme clé pour la compatibilité frontend
            users: dayUsers,
            revenue: Math.round((dayComm + dayPurchases) * 100) / 100
          });
        }
      } else {
        // Granularité mensuelle pour 90 jours ou plus
        const monthsToShow = daysVal <= 90 ? 3 : 12;
        for (let i = monthsToShow - 1; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthLabel = monthDate.toLocaleString('fr-FR', { month: 'short' });
          const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

          const monthUsers = users.filter(u => {
            const d = new Date(u.createdAt);
            return d >= monthDate && d < nextMonthDate;
          }).length;

          const monthComm = bookings
            .filter(b => {
              const d = new Date(b.createdAt);
              return d >= monthDate && d < nextMonthDate;
            })
            .reduce((sum, b) => sum + (b.ourCommission || 0), 0);

          const monthPurchases = purchases
            .filter(p => {
              const d = new Date(p.purchasedAt);
              return d >= monthDate && d < nextMonthDate;
            })
            .reduce((sum, p) => sum + (p.price || 0), 0);

          trends.push({
            month: monthLabel,
            users: monthUsers,
            revenue: Math.round((monthComm + monthPurchases) * 100) / 100
          });
        }
      }

      // Répartition par catégorie de prestataires
      const categoryDistribution: Record<string, number> = {};
      providerProfiles.forEach(p => {
        const catName = p.category?.name || 'Autre';
        categoryDistribution[catName] = (categoryDistribution[catName] || 0) + 1;
      });

      const stats = {
        overview: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          revenueThisMonth: Math.round(revenueThisPeriod * 100) / 100,
          totalUsers: users.length,
          totalInvitations: invitations.length
        },
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
            new Date(u.createdAt) > periodStart
          ).length,
        },
        invitations: {
          total: invitations.length,
          published: invitations.filter((i: any) => i.status === 'PUBLISHED').length,
          draft: invitations.filter((i: any) => i.status === 'DRAFT').length,
          archived: invitations.filter((i: any) => i.status === 'ARCHIVED').length,
          thisMonth: invitations.filter((i: any) =>
            new Date(i.createdAt) > periodStart
          ).length,
        },
        guests: {
          total: guests.length,
          confirmed: rsvps.filter((r: any) => r.status === 'CONFIRMED' && new Date(r.createdAt) > periodStart).length,
          declined: rsvps.filter((r: any) => r.status === 'DECLINED' && new Date(r.createdAt) > periodStart).length,
          pending: rsvps.filter((r: any) => r.status === 'PENDING' && new Date(r.createdAt) > periodStart).length,
          emailsSent: guests.filter((g: any) => g.invitationSentAt && new Date(g.invitationSentAt) > periodStart).length,
          // Global for total reference
          totalConfirmed: rsvps.filter((r: any) => r.status === 'CONFIRMED').length,
          totalEmailsSent: guests.filter((g: any) => g.invitationSentAt).length,
        },
        revenue: {
          total: Math.round(totalRevenue * 100) / 100,
          commissions: Math.round(commissionRevenueThisPeriod * 100) / 100,
          purchases: Math.round(purchaseRevenueThisPeriod * 100) / 100,
          thisMonth: Math.round(revenueThisPeriod * 100) / 100,
        },
        trends: trends,
        categories: Object.entries(categoryDistribution).map(([name, value]) => ({ name, value }))
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

      // Utiliser le service pour récupérer toutes les invitations avec les données complètes (y compris design)
      const invitations = await InvitationService.getAllInvitations();

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

      // Utiliser le service pour récupérer l'invitation avec tous les détails
      const invitation = await InvitationService.getInvitationByIdAdmin(id);

      res.json(invitation);
    } catch (error) {
      if (error instanceof Error && error.message === 'Invitation non trouvée') {
        res.status(404).json({ message: 'Invitation non trouvée' });
      } else {
        next(error);
      }
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

      // Utiliser le service pour récupérer l'invitation avec le design complet
      const invitation = await InvitationService.getInvitationByIdAdmin(id);

      res.json(invitation);
    } catch (error) {
      if (error instanceof Error && error.message === 'Invitation non trouvée') {
        res.status(404).json({ message: 'Invitation non trouvée' });
      } else {
        next(error);
      }
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