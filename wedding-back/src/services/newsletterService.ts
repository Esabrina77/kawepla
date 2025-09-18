import { PrismaClient, NewsletterStatus, NewsletterAudience, UserRole } from '@prisma/client';
import { emailService } from '../utils/email';

const prisma = new PrismaClient();

interface CreateNewsletterData {
  title: string;
  subject: string;
  content: string;
  htmlContent?: string;
  targetAudience: NewsletterAudience;
  specificUserIds: string[];
  scheduledAt: Date | null;
  createdBy: string;
}

interface NewsletterFilters {
  page: number;
  limit: number;
  status?: string;
  audience?: string;
}

interface TargetUsersFilters {
  role?: string;
  search?: string;
  page: number;
  limit: number;
}

interface RecipientFilters {
  page: number;
  limit: number;
  status?: string;
}

export class NewsletterService {
  // Récupérer toutes les newsletters avec pagination et filtres
  static async getNewsletters(filters: NewsletterFilters) {
    const { page, limit, status, audience } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (status && status !== 'ALL') {
      where.status = status as NewsletterStatus;
    }
    
    if (audience && audience !== 'ALL') {
      where.targetAudience = audience as NewsletterAudience;
    }

    const [newsletters, total] = await Promise.all([
      prisma.newsletter.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              recipients: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.newsletter.count({ where }),
    ]);

    return {
      newsletters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Récupérer une newsletter par ID
  static async getNewsletterById(id: string) {
    return await prisma.newsletter.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        recipients: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  // Créer une nouvelle newsletter
  static async createNewsletter(data: CreateNewsletterData) {
    const newsletter = await prisma.newsletter.create({
      data: {
        title: data.title,
        subject: data.subject,
        content: data.content,
        htmlContent: data.htmlContent,
        targetAudience: data.targetAudience,
        specificUserIds: data.specificUserIds,
        scheduledAt: data.scheduledAt,
        createdBy: data.createdBy,
        status: data.scheduledAt ? NewsletterStatus.SCHEDULED : NewsletterStatus.DRAFT,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Si des utilisateurs spécifiques sont ciblés, créer les destinataires
    if (data.targetAudience === NewsletterAudience.SPECIFIC_USERS && data.specificUserIds.length > 0) {
      await this.createRecipients(newsletter.id, data.specificUserIds);
    }

    return newsletter;
  }

  // Mettre à jour une newsletter
  static async updateNewsletter(id: string, updateData: Partial<CreateNewsletterData>) {
    const newsletter = await prisma.newsletter.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!newsletter) {
      return null;
    }

    // Ne pas permettre la modification si déjà envoyée
    if (newsletter.status === NewsletterStatus.SENT) {
      throw new Error('Impossible de modifier une newsletter déjà envoyée');
    }

    const updatedNewsletter = await prisma.newsletter.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Mettre à jour les destinataires si nécessaire
    if (updateData.targetAudience === NewsletterAudience.SPECIFIC_USERS && updateData.specificUserIds) {
      await prisma.newsletterRecipient.deleteMany({
        where: { newsletterId: id },
      });
      await this.createRecipients(id, updateData.specificUserIds);
    }

    return updatedNewsletter;
  }

  // Supprimer une newsletter
  static async deleteNewsletter(id: string): Promise<boolean> {
    try {
      await prisma.newsletter.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la newsletter:', error);
      return false;
    }
  }

  // Envoyer une newsletter
  static async sendNewsletter(id: string, sendImmediately = true) {
    const newsletter = await prisma.newsletter.findUnique({
      where: { id },
      include: {
        creator: true,
      },
    });

    if (!newsletter) {
      return { success: false, message: 'Newsletter introuvable' };
    }

    if (newsletter.status === NewsletterStatus.SENT) {
      return { success: false, message: 'Newsletter déjà envoyée' };
    }

    // Marquer comme en cours d'envoi
    await prisma.newsletter.update({
      where: { id },
      data: { status: NewsletterStatus.SENDING },
    });

    try {
      // Récupérer les destinataires selon l'audience cible
      const recipients = await this.getRecipientsForNewsletter(newsletter);

      if (recipients.length === 0) {
        await prisma.newsletter.update({
          where: { id },
          data: { status: NewsletterStatus.DRAFT },
        });
        return { success: false, message: 'Aucun destinataire trouvé' };
      }

      // Créer ou mettre à jour les destinataires
      await this.createOrUpdateRecipients(id, recipients.map(r => r.id));

    // Envoyer les emails
      let sentCount = 0;
      const errors: string[] = [];

      for (const recipient of recipients) {
      try {
        await emailService.sendNewsletter(
            recipient.email,
            `${recipient.firstName} ${recipient.lastName}`,
            newsletter.subject,
            newsletter.content,
            newsletter.htmlContent || newsletter.content,
            newsletter.title
          );

          // Marquer comme envoyé
          await prisma.newsletterRecipient.updateMany({
            where: {
              newsletterId: id,
              userId: recipient.id,
            },
            data: {
              status: 'SENT',
              sentAt: new Date(),
            },
          });

          sentCount++;
        } catch (error) {
          console.error(`Erreur envoi email à ${recipient.email}:`, error);
          errors.push(`Erreur pour ${recipient.email}`);

          // Marquer comme échoué
          await prisma.newsletterRecipient.updateMany({
            where: {
              newsletterId: id,
              userId: recipient.id,
            },
            data: {
              status: 'FAILED',
            },
          });
        }
      }

      // Mettre à jour le statut final
      await prisma.newsletter.update({
        where: { id },
        data: {
          status: NewsletterStatus.SENT,
          sentAt: new Date(),
          sentCount,
        },
      });

      return {
        success: true,
        message: `Newsletter envoyée à ${sentCount} destinataires${errors.length > 0 ? ` (${errors.length} erreurs)` : ''}`,
        sentCount,
        errors,
      };
      } catch (error) {
      console.error('Erreur lors de l\'envoi de la newsletter:', error);
      
      // Remettre en draft en cas d'erreur
      await prisma.newsletter.update({
        where: { id },
        data: { status: NewsletterStatus.DRAFT },
      });

      return { success: false, message: 'Erreur lors de l\'envoi de la newsletter' };
    }
  }

  // Programmer une newsletter
  static async scheduleNewsletter(id: string, scheduledAt: Date) {
    return await prisma.newsletter.update({
      where: { id },
      data: {
        scheduledAt,
        status: NewsletterStatus.SCHEDULED,
      },
    });
  }

  // Annuler une newsletter programmée
  static async cancelNewsletter(id: string) {
    const newsletter = await prisma.newsletter.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!newsletter || newsletter.status === NewsletterStatus.SENT) {
      return null;
    }

    return await prisma.newsletter.update({
      where: { id },
      data: {
        status: NewsletterStatus.CANCELLED,
        scheduledAt: null,
      },
    });
  }

  // Prévisualiser une newsletter
  static async previewNewsletter(id: string) {
    const newsletter = await prisma.newsletter.findUnique({
      where: { id },
          select: { 
            id: true, 
        title: true,
        subject: true,
        content: true,
        htmlContent: true,
        targetAudience: true,
      },
    });

    if (!newsletter) {
      return null;
    }

    // Compter les destinataires potentiels
    const recipients = await this.getRecipientsForNewsletter(newsletter as any);

    return {
      ...newsletter,
      recipientCount: recipients.length,
      preview: {
        subject: newsletter.subject,
        content: newsletter.content,
        htmlContent: newsletter.htmlContent || newsletter.content,
      },
    };
  }

  // Statistiques d'une newsletter
  static async getNewsletterStats(id: string) {
    const newsletter = await prisma.newsletter.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            recipients: true,
          },
        },
      },
    });

    if (!newsletter) {
      return null;
    }

    const stats = await prisma.newsletterRecipient.groupBy({
      by: ['status'],
      where: { newsletterId: id },
      _count: {
        status: true,
      },
    });

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as Record<string, number>);

    return {
      newsletter: {
        id: newsletter.id,
        title: newsletter.title,
        status: newsletter.status,
        sentAt: newsletter.sentAt,
        sentCount: newsletter.sentCount,
      },
      stats: {
        totalRecipients: newsletter._count.recipients,
        sent: statusCounts['SENT'] || 0,
        failed: statusCounts['FAILED'] || 0,
        opened: statusCounts['OPENED'] || 0,
        clicked: statusCounts['CLICKED'] || 0,
        pending: statusCounts['PENDING'] || 0,
      },
    };
  }

  // Destinataires d'une newsletter
  static async getNewsletterRecipients(id: string, filters: RecipientFilters) {
    const { page, limit, status } = filters;
    const skip = (page - 1) * limit;

    const where: any = { newsletterId: id };
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [recipients, total] = await Promise.all([
      prisma.newsletterRecipient.findMany({
        where,
        include: {
          user: {
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
              email: true,
            role: true,
            },
          },
        },
        orderBy: { sentAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.newsletterRecipient.count({ where }),
    ]);

    return {
      recipients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Récupérer les utilisateurs cibles disponibles
  static async getTargetUsers(filters: TargetUsersFilters) {
    const { role, search, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    
    if (role && role !== 'ALL') {
      where.role = role as UserRole;
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
          email: true,
            role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Méthodes privées
  private static async getRecipientsForNewsletter(newsletter: any) {
    let where: any = { isActive: true };

    switch (newsletter.targetAudience) {
      case NewsletterAudience.ALL_USERS:
        // Tous les utilisateurs actifs
        break;
      case NewsletterAudience.HOSTS_ONLY:
        where.role = UserRole.HOST;
        break;
      case NewsletterAudience.PROVIDERS_ONLY:
        where.role = UserRole.PROVIDER;
        break;
      case NewsletterAudience.ADMINS_ONLY:
        where.role = UserRole.ADMIN;
        break;
      case NewsletterAudience.SPECIFIC_USERS:
        where.id = { in: newsletter.specificUserIds };
        break;
    }

    return await prisma.user.findMany({
      where,
      select: { 
        id: true, 
        firstName: true, 
        lastName: true, 
        email: true,
        role: true,
      },
    });
  }

  private static async createRecipients(newsletterId: string, userIds: string[]) {
    const recipients = userIds.map(userId => ({
      newsletterId,
      userId,
      status: 'PENDING',
    }));

    await prisma.newsletterRecipient.createMany({
      data: recipients,
      skipDuplicates: true,
    });
  }

  private static async createOrUpdateRecipients(newsletterId: string, userIds: string[]) {
    // Supprimer les anciens destinataires
    await prisma.newsletterRecipient.deleteMany({
      where: { newsletterId },
    });

    // Créer les nouveaux destinataires
    await this.createRecipients(newsletterId, userIds);
  }
}