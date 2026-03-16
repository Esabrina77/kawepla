import { prisma } from '../lib/prisma';
import { emailService } from '../utils/email';

export class EmailVerificationService {
  
  // Générer un code de vérification à 6 chiffres
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Envoyer un code de vérification
  async sendVerificationCode(email: string): Promise<void> {
    // Supprimer les anciens codes non utilisés pour cet email
    await prisma.emailVerification.deleteMany({
      where: {
        email,
        verified: false,
      },
    });

    // Générer un nouveau code
    const code = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Sauvegarder le code en base
    await prisma.emailVerification.create({
      data: {
        email,
        code,
        expiresAt,
        verified: false,
      },
    });

    // Envoyer l'email
    await emailService.sendVerificationCode(email, code);
  }

  // Vérifier un code
  async verifyCode(email: string, code: string): Promise<boolean> {
    const verification = await prisma.emailVerification.findFirst({
      where: {
        email,
        code,
        verified: false,
        expiresAt: {
          gt: new Date(), // Code non expiré
        },
      },
    });

    if (!verification) {
      return false;
    }

    // Marquer le code comme vérifié
    await prisma.emailVerification.update({
      where: {
        id: verification.id,
      },
      data: {
        verified: true,
      },
    });

    // Marquer l'utilisateur comme vérifié
    await prisma.user.updateMany({
      where: {
        email,
      },
      data: {
        emailVerified: true,
      },
    });

    return true;
  }

  // Vérifier si un email a été vérifié
  async isEmailVerified(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true },
    });

    return user?.emailVerified ?? false;
  }

  // Nettoyer les codes expirés (à appeler périodiquement)
  async cleanupExpiredCodes(): Promise<void> {
    await prisma.emailVerification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
} 