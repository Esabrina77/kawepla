import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { z } from 'zod';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        res.status(400).json({
          message: 'Données invalides',
          errors,
        });
      } else {
        res.status(500).json({
          message: 'Erreur de validation',
        });
      }
    }
  };
};

export const validateBody = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        res.status(400).json({
          message: 'Données invalides',
          errors,
        });
      } else {
        res.status(500).json({
          message: 'Erreur de validation',
        });
      }
    }
  };
};

export const validateQuery = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        res.status(400).json({
          message: 'Paramètres de requête invalides',
          errors,
        });
      } else {
        res.status(500).json({
          message: 'Erreur de validation',
        });
      }
    }
  };
};

export const validateParams = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        res.status(400).json({
          message: 'Paramètres invalides',
          errors,
        });
      } else {
        res.status(500).json({
          message: 'Erreur de validation',
        });
      }
    }
  };
};

// NOTE: Les validations d'invitations ont été déplacées vers newInvitationValidation.ts
// Ce fichier contient maintenant uniquement les validations génériques et d'authentification

// Schémas d'authentification et utilisateur
export const createUserSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  role: z.enum(['ADMIN', 'HOST', 'GUEST', 'PROVIDER']).optional().default('HOST'),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),

});

// Types exportés
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>; 