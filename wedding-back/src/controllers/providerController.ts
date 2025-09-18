import { Request, Response } from 'express';
import { ProviderService } from '@/services/providerService';

export class ProviderController {
  /**
   * Créer un profil prestataire
   */
  static async createProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          message: 'Utilisateur non authentifié'
        });
        return;
      }

      const profileData = req.body;
      const profile = await ProviderService.createProviderProfile(userId, profileData);
      
      res.status(201).json({
        message: 'Profil prestataire créé avec succès',
        profile
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
   * Mettre à jour un profil prestataire
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          message: 'Utilisateur non authentifié'
        });
        return;
      }

      const updateData = req.body;
      const profile = await ProviderService.updateProviderProfile(userId, updateData);
      
      res.status(200).json({
        message: 'Profil mis à jour avec succès',
        profile
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
   * Obtenir le profil prestataire de l'utilisateur connecté
   */
  static async getMyProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          message: 'Utilisateur non authentifié'
        });
        return;
      }

      const profile = await ProviderService.getProviderProfile(userId);
      
      if (!profile) {
        res.status(404).json({
          message: 'Profil prestataire non trouvé'
        });
        return;
      }

      res.status(200).json({
        profile
      });
    } catch (error) {
      res.status(500).json({
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Obtenir toutes les catégories de services
   */
  static async getServiceCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await ProviderService.getServiceCategories();
      
      res.status(200).json({
        categories
      });
    } catch (error) {
      res.status(500).json({
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * NOUVEAU V1: Recherche géolocalisée de prestataires
   */
  static async searchByLocation(req: Request, res: Response): Promise<void> {
    try {
      const { 
        latitude, 
        longitude, 
        radius, 
        categoryId, 
        eventType, 
        minRating, 
        maxPrice, 
        limit, 
        offset 
      } = req.query;

      // Validation des coordonnées obligatoires
      if (!latitude || !longitude) {
        res.status(400).json({
          message: 'Coordonnées GPS requises (latitude, longitude)'
        });
        return;
      }

      const searchParams = {
        latitude: parseFloat(latitude as string),
        longitude: parseFloat(longitude as string),
        radius: radius ? parseInt(radius as string) : 25,
        categoryId: categoryId as string,
        eventType: eventType as string,
        minRating: minRating ? parseFloat(minRating as string) : 0,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        limit: limit ? parseInt(limit as string) : 20,
        offset: offset ? parseInt(offset as string) : 0
      };

      const result = await ProviderService.searchProvidersByLocation(searchParams);
      
      res.status(200).json({
        ...result,
        message: `${result.total} prestataire(s) trouvé(s) dans un rayon de ${searchParams.radius}km`
      });
    } catch (error) {
      console.error('Erreur recherche géolocalisée:', error);
      res.status(500).json({
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Obtenir tous les prestataires approuvés (public) - LEGACY
   */
  static async getApprovedProviders(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId, minRating, limit, offset } = req.query;
      
      const filters = {
        categoryId: categoryId as string,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        limit: limit ? parseInt(limit as string) : 20,
        offset: offset ? parseInt(offset as string) : 0
      };

      const providers = await ProviderService.getApprovedProviders(filters);
      
      res.status(200).json({
        providers,
        total: providers.length,
        message: 'Utilisez /search-location pour une recherche géolocalisée'
      });
    } catch (error) {
      res.status(500).json({
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Approuver un prestataire (admin seulement)
   */
  static async approveProvider(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user?.id;
      const { providerId } = req.params;
      
      if (!adminId) {
        res.status(401).json({
          message: 'Utilisateur non authentifié'
        });
        return;
      }

      const profile = await ProviderService.approveProvider(providerId, adminId);
      
      res.status(200).json({
        message: 'Prestataire approuvé avec succès',
        provider: profile
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
   * Rejeter un prestataire (admin seulement)
   */
  static async rejectProvider(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user?.id;
      const { providerId } = req.params;
      const { reason } = req.body;
      
      if (!adminId) {
        res.status(401).json({
          message: 'Utilisateur non authentifié'
        });
        return;
      }

      if (!reason) {
        res.status(400).json({
          message: 'Raison du rejet requise'
        });
        return;
      }

      const profile = await ProviderService.rejectProvider(providerId, adminId, reason);
      
      res.status(200).json({
        message: 'Prestataire rejeté avec succès',
        provider: profile
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
   * Suspendre un prestataire (admin seulement)
   */
  static async suspendProvider(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user?.id;
      const { providerId } = req.params;
      
      if (!adminId) {
        res.status(401).json({
          message: 'Utilisateur non authentifié'
        });
        return;
      }

      const profile = await ProviderService.suspendProvider(providerId, adminId);
      
      res.status(200).json({
        message: 'Prestataire suspendu avec succès',
        provider: profile
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
   * Obtenir les statistiques des prestataires (admin seulement)
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user?.id;
      
      if (!adminId) {
        res.status(401).json({
          message: 'Utilisateur non authentifié'
        });
        return;
      }

      const stats = await ProviderService.getProviderStats();
      
      res.status(200).json({
        stats
      });
    } catch (error) {
      res.status(500).json({
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Supprimer un prestataire (admin seulement)
   */
  static async deleteProvider(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user?.id;
      const { providerId } = req.params;
      
      if (!adminId) {
        res.status(401).json({
          message: 'Utilisateur non authentifié'
        });
        return;
      }

      await ProviderService.deleteProvider(providerId, adminId);
      
      res.status(200).json({
        message: 'Prestataire supprimé avec succès'
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
   * Créer un service
   */
  static async createService(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          message: 'Utilisateur non authentifié'
        });
        return;
      }

      const serviceData = req.body;
      const service = await ProviderService.createService(userId, serviceData);
      
      res.status(201).json({
        message: 'Service créé avec succès',
        service
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
   * Obtenir les services d'un prestataire
   */
  static async getMyServices(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          message: 'Utilisateur non authentifié'
        });
        return;
      }

      const services = await ProviderService.getProviderServices(userId);
      
      res.status(200).json({
        services
      });
    } catch (error) {
      res.status(500).json({
        message: 'Erreur interne du serveur'
      });
    }
  }

  /**
   * Mettre à jour un service
   */
  static async updateService(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { serviceId } = req.params;
      
      if (!userId) {
        res.status(401).json({
          message: 'Utilisateur non authentifié'
        });
        return;
      }

      const updateData = req.body;
      const service = await ProviderService.updateService(userId, serviceId, updateData);
      
      res.status(200).json({
        message: 'Service mis à jour avec succès',
        service
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
   * Supprimer un service
   */
  static async deleteService(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { serviceId } = req.params;
      
      if (!userId) {
        res.status(401).json({
          message: 'Utilisateur non authentifié'
        });
        return;
      }

      await ProviderService.deleteService(userId, serviceId);
      
      res.status(200).json({
        message: 'Service supprimé avec succès'
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
   * Obtenir tous les providers (admin)
   */
  static async getAllProviders(req: Request, res: Response): Promise<void> {
    try {
      const { status, limit, offset } = req.query;
      
      const providers = await ProviderService.getAllProviders({
        status: status as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      });
      
      res.status(200).json({
        providers: providers.data,
        total: providers.total
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
}
