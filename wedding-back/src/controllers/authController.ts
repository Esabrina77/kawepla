import { Request, Response } from 'express';
import { UserService } from '@/services/userService';
import { EmailVerificationService } from '@/services/emailVerificationService';
import { createUserSchema, loginSchema } from '@/middleware/validation';
import { z } from 'zod';

const emailVerificationService = new EmailVerificationService();

// Schémas de validation
const sendVerificationCodeSchema = z.object({
  email: z.string().email('Email invalide'),
});

const verifyEmailSchema = z.object({
  email: z.string().email('Email invalide'),
  code: z.string().length(6, 'Le code doit contenir 6 chiffres'),
});

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const userData = createUserSchema.parse(req.body);
      
      // Créer l'utilisateur avec emailVerified = false
      const { user } = await UserService.createUser({
        ...userData,
        emailVerified: false
      });
      
      // Envoyer le code de vérification
      await emailVerificationService.sendVerificationCode(userData.email);
      
      res.status(201).json({
        message: 'Compte créé avec succès. Un code de vérification a été envoyé à votre email.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified
        }
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

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData = loginSchema.parse(req.body);
      
      // Vérifier si l'email est vérifié
      const isEmailVerified = await emailVerificationService.isEmailVerified(loginData.email);
      
      if (!isEmailVerified) {
        res.status(403).json({
          message: 'Veuillez vérifier votre email avant de vous connecter.',
          emailVerified: false
        });
        return;
      }
      
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

  static async sendVerificationCode(req: Request, res: Response): Promise<void> {
    try {
      const { email } = sendVerificationCodeSchema.parse(req.body);
      
      // Vérifier si l'utilisateur existe
      const user = await UserService.findByEmail(email);
      if (!user) {
        res.status(404).json({
          message: 'Aucun compte trouvé avec cet email'
        });
        return;
      }

      // Vérifier si l'email n'est pas déjà vérifié
      if (user.emailVerified) {
        res.status(400).json({
          message: 'Cet email est déjà vérifié'
        });
        return;
      }

      await emailVerificationService.sendVerificationCode(email);
      
      res.status(200).json({
        message: 'Code de vérification envoyé avec succès'
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

  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email, code } = verifyEmailSchema.parse(req.body);
      
      const isValid = await emailVerificationService.verifyCode(email, code);
      
      if (!isValid) {
        res.status(400).json({
          message: 'Code de vérification invalide ou expiré'
        });
        return;
      }

      // Récupérer l'utilisateur mis à jour
      const user = await UserService.findByEmail(email);
      
      res.status(200).json({
        message: 'Email vérifié avec succès',
        user: {
          id: user?.id,
          email: user?.email,
          firstName: user?.firstName,
          lastName: user?.lastName,
          emailVerified: user?.emailVerified
        }
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