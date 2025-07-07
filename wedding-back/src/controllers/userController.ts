import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AsyncRequestHandler } from '../types';

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
          role: true,
          isActive: true,
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
          role: true,
          isActive: true,
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
      if (!userId) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      await prisma.user.delete({
        where: { id: userId }
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  static list: AsyncRequestHandler = async (req, res, next) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
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
          role: true,
          isActive: true,
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
          role: true,
          isActive: true,
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
} 