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

// Schéma de validation pour une invitation
const invitationSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  weddingDate: z.coerce.date(),
  ceremonyTime: z.string().optional(),
  receptionTime: z.string().optional(),
  venueName: z.string().min(1, 'Le lieu est requis'),
  venueAddress: z.string().min(1, 'L\'adresse est requise'),
  venueCoordinates: z.string().optional(),
  customDomain: z.string().optional(),
  theme: z.record(z.unknown()),
  photos: z.array(z.object({ url: z.string(), caption: z.string().optional() })),
  program: z.record(z.unknown()).optional(),
  restrictions: z.string().optional(),
  languages: z.array(z.string()).default(['fr']),
  maxGuests: z.number().optional(),
  designId: z.string().min(1, 'Le design est requis')
});

// Schéma de validation pour la mise à jour d'une invitation
const invitationUpdateSchema = invitationSchema.partial();

/**
 * Fonction de validation pour les invitations
 */
export const validateInvitationData = async (data: any, isUpdate = false): Promise<any> => {
  const schema = isUpdate ? invitationUpdateSchema : invitationSchema;
  return await schema.parseAsync(data);
};

/**
 * Middleware de validation pour les invitations
 */
export const validateInvitation = (isUpdate = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await validateInvitationData(req.body, isUpdate);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: 'Données invalides',
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      } else {
        next(error);
      }
    }
  };
}; 