import { Request, Response } from 'express';
import { TodoService } from '../services/todoService';

export class TodoController {
  /**
   * Créer une nouvelle tâche
   */
  static async createTodo(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Utilisateur non authentifié' });
        return;
      }

      const todo = await TodoService.createTodo(userId, req.body);

      res.status(201).json({
        message: 'Tâche créée avec succès',
        todo
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur interne du serveur' });
      }
    }
  }

  /**
   * Obtenir toutes les tâches d'une invitation
   */
  static async getTodosByInvitation(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { invitationId } = req.params;

      if (!userId) {
        res.status(401).json({ message: 'Utilisateur non authentifié' });
        return;
      }

      const todos = await TodoService.getTodosByInvitation(userId, invitationId);

      res.status(200).json({ todos });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur interne du serveur' });
      }
    }
  }

  /**
   * Obtenir toutes les tâches d'un utilisateur
   */
  static async getAllUserTodos(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Utilisateur non authentifié' });
        return;
      }

      const { status, category, priority } = req.query;

      const filters: any = {};
      if (status) filters.status = status;
      if (category) filters.category = category;
      if (priority) filters.priority = priority;

      const todos = await TodoService.getAllUserTodos(userId, filters);

      res.status(200).json({ todos });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur interne du serveur' });
      }
    }
  }

  /**
   * Obtenir une tâche par ID
   */
  static async getTodoById(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ message: 'Utilisateur non authentifié' });
        return;
      }

      const todo = await TodoService.getTodoById(userId, id);

      res.status(200).json({ todo });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur interne du serveur' });
      }
    }
  }

  /**
   * Mettre à jour une tâche
   */
  static async updateTodo(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ message: 'Utilisateur non authentifié' });
        return;
      }

      const todo = await TodoService.updateTodo(userId, id, req.body);

      res.status(200).json({
        message: 'Tâche mise à jour avec succès',
        todo
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur interne du serveur' });
      }
    }
  }

  /**
   * Supprimer une tâche
   */
  static async deleteTodo(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ message: 'Utilisateur non authentifié' });
        return;
      }

      const result = await TodoService.deleteTodo(userId, id);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur interne du serveur' });
      }
    }
  }

  /**
   * Obtenir les statistiques des tâches pour une invitation
   */
  static async getTodoStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { invitationId } = req.params;

      if (!userId) {
        res.status(401).json({ message: 'Utilisateur non authentifié' });
        return;
      }

      const stats = await TodoService.getTodoStats(userId, invitationId);

      res.status(200).json({ stats });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur interne du serveur' });
      }
    }
  }
}

