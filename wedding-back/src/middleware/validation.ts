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
  // Informations du couple
  coupleName: z.string().min(1, 'Le nom du couple est requis'),
  
  // Date et heure
  weddingDate: z.coerce.date(),
  ceremonyTime: z.string().optional(),
  receptionTime: z.string().optional(),
  
  // Textes d'invitation
  invitationText: z.string().optional(),
  
  // Lieu et détails
  venueName: z.string().min(1, 'Le lieu est requis'),
  venueAddress: z.string().min(1, 'L\'adresse est requise'),
  venueCoordinates: z.string().optional(),
  moreInfo: z.string().optional(),
  
  // RSVP
  rsvpDetails: z.string().optional(),
  rsvpForm: z.string().optional(),
  rsvpDate: z.coerce.date().optional(),
  
  // Messages personnalisés
  message: z.string().optional(),
  blessingText: z.string().optional(),
  welcomeMessage: z.string().optional(),
  
  // Informations supplémentaires
  dressCode: z.string().optional(),
  contact: z.string().optional(),
  
  // Champs existants (optionnels maintenant)
  title: z.string().optional(),
  description: z.string().optional(),
  customDomain: z.string().optional(),
  photos: z.array(z.object({ url: z.string(), caption: z.string().optional() })).optional(),
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

// Schémas d'authentification et utilisateur
export const createUserSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  role: z.enum(['ADMIN', 'COUPLE', 'GUEST']).optional().default('COUPLE'),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  subscriptionTier: z.enum(['FREE', 'ESSENTIAL', 'ELEGANT', 'PREMIUM', 'LUXE']).optional(),
});

// Types exportés
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>; 