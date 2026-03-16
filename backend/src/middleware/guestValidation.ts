/**
 * Validation middleware pour les invités
 */
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Schéma de validation de base pour un invité
export const guestSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  isVIP: z.boolean().default(false)
});

// Schéma avec validation personnalisée (au moins un email ou téléphone)
export const guestSchemaWithValidation = guestSchema.refine((data) => data.email || data.phone, {
  message: 'Au moins un email ou un téléphone est requis',
  path: ['email']
});

// Middleware de validation pour la création d'invités
export const validateGuestCreation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await guestSchemaWithValidation.parseAsync(req.body);
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
      next(error);
    }
  }
};

// Middleware de validation pour la mise à jour d'invités
export const validateGuestUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await guestSchema.partial().parseAsync(req.body);
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
      next(error);
    }
  }
};

// Types TypeScript générés à partir des schemas
export type GuestInput = z.infer<typeof guestSchema>;
export type GuestUpdateInput = z.infer<typeof guestSchema>;
