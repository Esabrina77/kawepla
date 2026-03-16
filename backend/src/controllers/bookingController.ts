import { Request, Response } from 'express';
import { BookingService } from '../services/bookingService';
import { prisma } from '../lib/prisma';

export class BookingController {
  /**
   * Créer une nouvelle réservation
   */
  static async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const bookingData = req.body;
      const booking = await BookingService.createBooking(bookingData);
      
      res.status(201).json({
        message: 'Réservation créée avec succès',
        booking
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          message: error.message
        });
      } else {
        res.status(500).json({
          message: 'Erreur interne du serveur'
        });
      }
    }
  }

  /**
   * Obtenir les réservations d'un prestataire
   */
  static async getProviderBookings(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          message: 'Utilisateur non authentifié'
        });
        return;
      }

      // Récupérer le providerId depuis userId
      const provider = await prisma.providerProfile.findFirst({
        where: { userId },
        select: { id: true }
      });

      if (!provider) {
        res.status(404).json({
          message: 'Profil prestataire non trouvé'
        });
        return;
      }

      const { status, limit, offset } = req.query;
      
      const filters = {
        status: status as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      };

      const bookings = await BookingService.getProviderBookings(provider.id, filters);
      
      res.status(200).json({
        bookings,
        total: bookings.length
      });
    } catch (error) {
      res.status(500).json({
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Mettre à jour le statut d'une réservation
   */
  static async updateBookingStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          message: 'Utilisateur non authentifié'
        });
        return;
      }

      // Récupérer le providerId depuis userId
      const provider = await prisma.providerProfile.findFirst({
        where: { userId },
        select: { id: true }
      });

      if (!provider) {
        res.status(404).json({
          message: 'Profil prestataire non trouvé'
        });
        return;
      }

      const { bookingId } = req.params;
      const { status, reason } = req.body;

      if (!status) {
        res.status(400).json({
          message: 'Statut requis'
        });
        return;
      }

      const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'DISPUTED'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          message: 'Statut invalide'
        });
        return;
      }

      const booking = await BookingService.updateBookingStatus(bookingId, provider.id, status, reason);
      
      res.status(200).json({
        message: 'Statut de la réservation mis à jour avec succès',
        booking
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          message: error.message
        });
      } else {
        res.status(500).json({
          message: 'Erreur interne du serveur'
        });
      }
    }
  }

  /**
   * Obtenir une réservation par conversationId
   */
  static async getBookingByConversationId(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          message: 'Utilisateur non authentifié'
        });
        return;
      }

      // Récupérer le providerId depuis userId
      const provider = await prisma.providerProfile.findFirst({
        where: { userId },
        select: { id: true }
      });

      if (!provider) {
        res.status(404).json({
          message: 'Profil prestataire non trouvé'
        });
        return;
      }

      const { conversationId } = req.params;

      const booking = await BookingService.getBookingByConversationId(conversationId, userId);
      
      res.status(200).json({
        booking
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({
          message: error.message
        });
      } else {
        res.status(500).json({
          message: 'Erreur interne du serveur'
        });
      }
    }
  }

  /**
   * Obtenir une réservation par ID
   */
  static async getBookingById(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          message: 'Utilisateur non authentifié'
        });
        return;
      }

      // Récupérer le providerId depuis userId
      const provider = await prisma.providerProfile.findFirst({
        where: { userId },
        select: { id: true }
      });

      if (!provider) {
        res.status(404).json({
          message: 'Profil prestataire non trouvé'
        });
        return;
      }

      const { bookingId } = req.params;
      
      const booking = await BookingService.getBookingById(bookingId, provider.id, 'PROVIDER');
      
      if (!booking) {
        res.status(404).json({
          message: 'Réservation non trouvée'
        });
        return;
      }

      res.status(200).json({
        booking
      });
    } catch (error) {
      res.status(500).json({
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Obtenir les statistiques des réservations
   */
  static async getBookingStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          message: 'Utilisateur non authentifié'
        });
        return;
      }

      // Récupérer le providerId depuis userId
      const provider = await prisma.providerProfile.findFirst({
        where: { userId },
        select: { id: true }
      });

      if (!provider) {
        res.status(404).json({
          message: 'Profil prestataire non trouvé'
        });
        return;
      }

      const stats = await BookingService.getProviderBookingStats(provider.id);
      
      res.status(200).json({
        stats
      });
    } catch (error) {
      res.status(500).json({
        message: 'Erreur interne du serveur'
      });
    }
  }
}
