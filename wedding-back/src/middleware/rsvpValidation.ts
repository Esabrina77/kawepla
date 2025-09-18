/**
 * Validation middleware pour les RSVP
 */
import { z } from 'zod';

// Schéma de validation pour la réponse RSVP
export const rsvpSchema = z.object({
  status: z.enum(['CONFIRMED', 'DECLINED', 'PENDING']),
  message: z.string().optional(),
  attendingCeremony: z.boolean().optional().default(true),
  attendingReception: z.boolean().optional().default(true),
  profilePhotoUrl: z.string().optional(),
  plusOne: z.boolean().optional().default(false),
  plusOneName: z.string().optional(),
  dietaryRestrictions: z.string().optional()
});

// Schéma de validation pour la mise à jour RSVP
export const rsvpUpdateSchema = z.object({
  status: z.enum(['CONFIRMED', 'DECLINED', 'PENDING']).optional(),
  message: z.string().optional(),
  attendingCeremony: z.boolean().optional(),
  attendingReception: z.boolean().optional(),
  profilePhotoUrl: z.string().optional(),
  plusOne: z.boolean().optional(),
  plusOneName: z.string().optional(),
  dietaryRestrictions: z.string().optional()
});

// Schéma de validation pour la réponse RSVP partageable
export const shareableRSVPSchema = z.object({
  // Infos personnelles
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(8, 'Le numéro de téléphone doit contenir au moins 8 caractères'),
  // RSVP classique
  status: z.enum(['CONFIRMED', 'DECLINED', 'PENDING']),
  message: z.string().optional(),
  attendingCeremony: z.boolean().optional().default(true),
  attendingReception: z.boolean().optional().default(true),
  profilePhotoUrl: z.string().optional(),
  plusOne: z.boolean().optional().default(false),
  plusOneName: z.string().optional(),
  dietaryRestrictions: z.string().optional()
});

// Types TypeScript générés à partir des schemas
export type RSVPInput = z.infer<typeof rsvpSchema>;
export type RSVPUpdateInput = z.infer<typeof rsvpUpdateSchema>;
export type ShareableRSVPInput = z.infer<typeof shareableRSVPSchema>;
