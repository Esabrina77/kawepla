import { Request, Response } from 'express';
import { UserService } from '@/services/userService';
import { createUserSchema, loginSchema } from '@/utils/validation';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const userData = createUserSchema.parse(req.body);
      const { user } = await UserService.createUser(userData);
      
      res.status(201).json(user);
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

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData = loginSchema.parse(req.body);
      const tokenResponse = await UserService.login(loginData);
      
      res.status(200).json({
        message: 'Connexion réussie',
        ...tokenResponse
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({
          message: error.message
        });
      } else {
        res.status(500).json({
          message: 'Erreur interne du serveur'
        });
      }
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(400).json({
          message: 'Token de rafraîchissement requis'
        });
        return;
      }

      const tokenResponse = await UserService.refreshToken(refreshToken);
      
      res.status(200).json({
        message: 'Token rafraîchi avec succès',
        ...tokenResponse
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({
          message: error.message
        });
      } else {
        res.status(500).json({
          message: 'Erreur interne du serveur'
        });
      }
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (refreshToken) {
        await UserService.logout(refreshToken);
      }
      
      res.status(200).json({
        message: 'Déconnexion réussie'
      });
    } catch (error) {
      res.status(500).json({
        message: 'Erreur interne du serveur'
      });
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        res.status(401).json({
          message: 'Utilisateur non authentifié'
        });
        return;
      }

      const user = await UserService.getUserById(userId);
      
      if (!user) {
        res.status(404).json({
          message: 'Utilisateur non trouvé'
        });
        return;
      }

      res.status(200).json({
        user
      });
    } catch (error) {
      res.status(500).json({
        message: 'Erreur interne du serveur'
      });
    }
  }

  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        res.status(401).json({
          message: 'Utilisateur non authentifié'
        });
        return;
      }

      const updateData = req.body;
      const user = await UserService.updateUser(userId, updateData);
      
      res.status(200).json({
        message: 'Profil mis à jour avec succès',
        user
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