import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { JWTService } from '../utils/jwt';
import { 
  CreateUserDto, 
  LoginDto, 
  UserResponse, 
  TokenResponse
} from '../types';
import { UpdateUserInput } from '@/middleware/validation';
import { SUBSCRIPTION_FEATURES } from '@/types';
import { UserRole, User } from '@prisma/client';
import { randomBytes } from 'crypto';
import { EmailVerificationService } from '@/services/emailVerificationService';
import { emailService } from '../utils/email';
import { StripeService } from './stripeService';

export class UserService {
  static async createUser(data: CreateUserDto & { emailVerified?: boolean }): Promise<TokenResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || UserRole.HOST,
        isActive: true,
        emailVerified: data.emailVerified ?? false
      }
    });

    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,

      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    };

    const tokenResponse = JWTService.generateTokenResponse({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return {
      ...tokenResponse,
      user: userResponse
    };
  }

  // NOUVEAU: Créer un utilisateur sans générer de token (pour l'inscription)
  static async createUserWithoutToken(data: CreateUserDto & { emailVerified?: boolean }): Promise<UserResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || UserRole.HOST,
        isActive: true,
        emailVerified: data.emailVerified ?? false
      }
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    };
  }

  static async login(data: LoginDto): Promise<TokenResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    if (!user.isActive) {
      throw new Error('Ce compte a été désactivé');
    }

    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,

      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    };

    const tokenResponse = JWTService.generateTokenResponse({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return {
      ...tokenResponse,
      user: userResponse
    };
  }

  static async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const payload = JWTService.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new Error('Token de rafraîchissement invalide');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    });

    if (!user || !user.isActive) {
      throw new Error('Utilisateur non trouvé ou compte désactivé');
    }

    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,

      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    };

    const tokenResponse = JWTService.generateTokenResponse({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return {
      ...tokenResponse,
      user: userResponse
    };
  }

  static async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.delete({
      where: { token: refreshToken }
    });
  }

  static async getUserById(userId: string): Promise<UserResponse | null> {
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
      }
    });

    if (!user) return null;

    return user;
  }

  static async updateUser(userId: string, updateData: UpdateUserInput): Promise<UserResponse> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,


        isActive: true,
        emailVerified: true,
        createdAt: true,
      }
    });

    return user;
  }

  static async deleteUser(userId: string): Promise<void> {
    // Nettoyer les fichiers Firebase avant la suppression
    const { FirebaseCleanupService } = await import('./firebaseCleanupService');
    await FirebaseCleanupService.deleteUserFiles(userId);

    // Supprimer l'utilisateur (les relations en cascade s'occuperont du reste)
    await prisma.user.delete({
      where: { id: userId }
    });
  }

  static async getServicePurchaseFeatures(serviceTier: string): Promise<string[]> {
    return SUBSCRIPTION_FEATURES[serviceTier as keyof typeof SUBSCRIPTION_FEATURES] || [];
  }

  static async checkServicePurchaseAccess(userId: string, requiredFeature: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, isActive: true }
    });

    if (!user) return false;



    const currentTier = await StripeService.getUserCurrentTier(userId);
    const features = await this.getServicePurchaseFeatures(currentTier);
    return features.includes(requiredFeature);
  }

  static async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
  
  
          isActive: true,
          emailVerified: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count()
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
  }): Promise<User> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    const hashedPassword = await hashPassword(data.password);

    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword
      }
    });
  }

  static async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  static async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  static async update(id: string, data: Partial<User>): Promise<User> {
    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    return prisma.user.update({
      where: { id },
      data
    });
  }

  static async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id }
    });
  }

  static async validateCredentials(data: { email: string; password: string }): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    return user;
  }

  /**
   * Récupérer les messages RSVP pour un couple
   */
  static async getRSVPMessages(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Récupérer toutes les invitations du couple avec leurs RSVP contenant des messages
    const invitations = await prisma.invitation.findMany({
      where: { 
        userId: userId,
        status: 'PUBLISHED'
      },
              select: {
          id: true,
          eventTitle: true,
          eventType: true,
          createdAt: true,
        rsvps: {
          where: {
            message: {
              not: null
            }
          },
          select: {
            id: true,
            message: true,
            status: true,
            numberOfGuests: true,
            respondedAt: true,
            createdAt: true,
            guest: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformer les données pour une meilleure structure
    const messages = invitations.flatMap((invitation: any) => 
      invitation.rsvps.map((rsvp: any) => ({
        id: rsvp.id,
        message: rsvp.message,
        status: rsvp.status,
        numberOfGuests: rsvp.numberOfGuests,
        respondedAt: rsvp.respondedAt,
        createdAt: rsvp.createdAt,
        guest: rsvp.guest,
        invitation: {
          id: invitation.id,
          eventTitle: invitation.eventTitle,
          eventType: invitation.eventType,
          createdAt: invitation.createdAt
        }
      }))
    );

    return messages;
  }

  /**
   * Marquer un message RSVP comme lu (pour usage futur)
   */
  static async markRSVPMessageAsRead(userId: string, rsvpId: string) {
    // Vérifier que l'utilisateur a accès à ce RSVP
    const rsvp = await prisma.rSVP.findFirst({
      where: {
        id: rsvpId,
        invitation: {
          userId: userId
        }
      }
    });

    if (!rsvp) {
      throw new Error('RSVP non trouvé ou accès non autorisé');
    }

    // Pour l'instant, on ne fait rien car le schéma n'a pas de champ "lu"
    // Cette méthode est prête pour une future extension
    return { success: true };
  }
  

  /**
   * Envoyer un token de réinitialisation de mot de passe
   */
  static async sendPasswordResetToken(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Generate unique token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    try {
      // Save token
      await prisma.passwordReset.create({
        data: {
          token,
          email,
          userId: user.id,
          expiresAt
        }
      });

      // Send reset email
      const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
      await emailService.sendEmail({
        to: email,
        subject: 'Réinitialisation de votre mot de passe',
        html: `Pour réinitialiser votre mot de passe, cliquez sur ce lien : ${resetLink}\n\nCe lien expirera dans 1 heure.`,
        text: `Pour réinitialiser votre mot de passe, cliquez sur ce lien : ${resetLink}\n\nCe lien expirera dans 1 heure.`
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du token de réinitialisation:', error);
      throw new Error('Erreur lors de l\'envoi du token de réinitialisation');
    }
  }

  static async verifyResetToken(token: string): Promise<boolean> {
    const resetToken = await prisma.passwordReset.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date()
        },
        used: false
      }
    });

    return !!resetToken;
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await prisma.passwordReset.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date()
        },
        used: false
      },
      include: {
        user: true
      }
    });

    if (!resetToken) {
      throw new Error('Token invalide ou expiré');
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await hashPassword(newPassword);

    // Mettre à jour le mot de passe et marquer le token comme utilisé
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword }
      }),
      prisma.passwordReset.update({
        where: { id: resetToken.id },
        data: { used: true }
      })
    ]);
  }
} 