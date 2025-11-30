import { prisma } from '../lib/prisma';
import { TodoCategory, TodoStatus, TodoPriority } from '@prisma/client';

export interface CreateTodoDto {
  invitationId: string;
  title: string;
  description?: string;
  category?: TodoCategory;
  priority?: TodoPriority;
  dueDate?: string;
  bookingId?: string;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  category?: TodoCategory;
  status?: TodoStatus;
  priority?: TodoPriority;
  dueDate?: string;
}

export class TodoService {
  /**
   * Créer une nouvelle tâche
   */
  static async createTodo(userId: string, data: CreateTodoDto) {
    // Vérifier que l'invitation appartient à l'utilisateur
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: data.invitationId,
        userId
      }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée ou non autorisée');
    }

    // Si bookingId est fourni, vérifier qu'il appartient à l'utilisateur
    if (data.bookingId) {
      const booking = await prisma.booking.findFirst({
        where: {
          id: data.bookingId,
          clientId: userId
        }
      });

      if (!booking) {
        throw new Error('Réservation non trouvée ou non autorisée');
      }
    }

    const todo = await prisma.todoItem.create({
      data: {
        invitationId: data.invitationId,
        userId,
        title: data.title,
        description: data.description,
        category: data.category || 'OTHER',
        priority: data.priority || 'MEDIUM',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        bookingId: data.bookingId || null
      },
      include: {
        booking: {
          include: {
            service: {
              include: {
                category: true
              }
            },
            provider: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return todo;
  }

  /**
   * Obtenir toutes les tâches d'une invitation
   */
  static async getTodosByInvitation(userId: string, invitationId: string) {
    // Vérifier que l'invitation appartient à l'utilisateur
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        userId
      }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée ou non autorisée');
    }

    const todos = await prisma.todoItem.findMany({
      where: {
        invitationId,
        userId
      },
      include: {
        booking: {
          include: {
            service: {
              include: {
                category: true
              }
            },
            provider: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return todos;
  }

  /**
   * Obtenir toutes les tâches d'un utilisateur (toutes invitations confondues)
   */
  static async getAllUserTodos(userId: string, filters?: {
    status?: TodoStatus;
    category?: TodoCategory;
    priority?: TodoPriority;
  }) {
    const where: any = { userId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    const todos = await prisma.todoItem.findMany({
      where,
      include: {
        invitation: {
          select: {
            id: true,
            eventTitle: true,
            eventDate: true
          }
        },
        booking: {
          include: {
            service: {
              include: {
                category: true
              }
            },
            provider: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return todos;
  }

  /**
   * Obtenir une tâche par ID
   */
  static async getTodoById(userId: string, todoId: string) {
    const todo = await prisma.todoItem.findFirst({
      where: {
        id: todoId,
        userId
      },
      include: {
        invitation: {
          select: {
            id: true,
            eventTitle: true,
            eventDate: true
          }
        },
        booking: {
          include: {
            service: {
              include: {
                category: true
              }
            },
            provider: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!todo) {
      throw new Error('Tâche non trouvée ou non autorisée');
    }

    return todo;
  }

  /**
   * Mettre à jour une tâche
   */
  static async updateTodo(userId: string, todoId: string, data: UpdateTodoDto) {
    // Vérifier que la tâche appartient à l'utilisateur
    const existingTodo = await prisma.todoItem.findFirst({
      where: {
        id: todoId,
        userId
      }
    });

    if (!existingTodo) {
      throw new Error('Tâche non trouvée ou non autorisée');
    }

    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.status !== undefined) {
      updateData.status = data.status;
      // Si on marque comme complété, ajouter completedAt
      if (data.status === 'COMPLETED' && existingTodo.status !== 'COMPLETED') {
        updateData.completedAt = new Date();
      } else if (data.status !== 'COMPLETED' && existingTodo.status === 'COMPLETED') {
        updateData.completedAt = null;
      }
    }
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    const todo = await prisma.todoItem.update({
      where: { id: todoId },
      data: updateData,
      include: {
        booking: {
          include: {
            service: {
              include: {
                category: true
              }
            },
            provider: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return todo;
  }

  /**
   * Supprimer une tâche
   */
  static async deleteTodo(userId: string, todoId: string) {
    // Vérifier que la tâche appartient à l'utilisateur
    const todo = await prisma.todoItem.findFirst({
      where: {
        id: todoId,
        userId
      }
    });

    if (!todo) {
      throw new Error('Tâche non trouvée ou non autorisée');
    }

    await prisma.todoItem.delete({
      where: { id: todoId }
    });

    return { message: 'Tâche supprimée avec succès' };
  }

  /**
   * Obtenir les statistiques des tâches pour une invitation
   */
  static async getTodoStats(userId: string, invitationId: string) {
    // Vérifier que l'invitation appartient à l'utilisateur
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        userId
      }
    });

    if (!invitation) {
      throw new Error('Invitation non trouvée ou non autorisée');
    }

    const [total, pending, inProgress, completed, cancelled] = await Promise.all([
      prisma.todoItem.count({
        where: { invitationId, userId }
      }),
      prisma.todoItem.count({
        where: { invitationId, userId, status: 'PENDING' }
      }),
      prisma.todoItem.count({
        where: { invitationId, userId, status: 'IN_PROGRESS' }
      }),
      prisma.todoItem.count({
        where: { invitationId, userId, status: 'COMPLETED' }
      }),
      prisma.todoItem.count({
        where: { invitationId, userId, status: 'CANCELLED' }
      })
    ]);

    return {
      total,
      pending,
      inProgress,
      completed,
      cancelled,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  }
}

