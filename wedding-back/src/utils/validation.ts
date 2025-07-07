import { z } from 'zod';

// User Validation Schemas
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
  subscriptionTier: z.enum(['BASIC', 'STANDARD', 'PREMIUM']).optional(),
});

// Invitation Validation Schemas
export const themeConfigSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur primaire invalide'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur secondaire invalide'),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur de fond invalide'),
  textColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur de texte invalide'),
  fontFamily: z.string().min(1, 'Famille de police requise'),
  fontSize: z.string().min(1, 'Taille de police requise'),
  spacing: z.string().min(1, 'Espacement requis'),
  borderRadius: z.string().min(1, 'Rayon de bordure requis'),
  shadows: z.boolean(),
  animations: z.boolean(),
});

export const programEventSchema = z.object({
  time: z.string().min(1, 'Heure requise'),
  title: z.string().min(1, 'Titre requis'),
  description: z.string().optional(),
  location: z.string().optional(),
});

export const programDetailsSchema = z.object({
  events: z.array(programEventSchema).min(1, 'Au moins un événement requis'),
});

export const createInvitationSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().optional(),
  weddingDate: z.string().datetime('Date de mariage invalide'),
  ceremonyTime: z.string().optional(),
  receptionTime: z.string().optional(),
  venueName: z.string().min(2, 'Nom du lieu requis'),
  venueAddress: z.string().min(10, 'Adresse du lieu requise'),
  venueCoordinates: z.string().optional(),
  customDomain: z.string().optional(),
  theme: themeConfigSchema,
  photos: z.array(z.string().url('URL de photo invalide')).optional(),
  program: programDetailsSchema.optional(),
  restrictions: z.string().optional(),
  languages: z.array(z.string()).min(1, 'Au moins une langue requise'),
  maxGuests: z.number().positive().optional(),
  designId: z.string().cuid('ID de design invalide'),
});

export const updateInvitationSchema = createInvitationSchema.partial().extend({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

// Guest Validation Schemas
export const createGuestSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide').optional(),
  phone: z.string().optional(),
  isVIP: z.boolean().optional().default(false),
  dietaryRestrictions: z.string().optional(),
  plusOne: z.boolean().optional().default(false),
  plusOneName: z.string().optional(),
});

export const updateGuestSchema = createGuestSchema.partial();

// RSVP Validation Schemas
export const createRSVPSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'DECLINED']),
  message: z.string().max(500, 'Le message ne peut pas dépasser 500 caractères').optional(),
  attendingCeremony: z.boolean().optional().default(true),
  attendingReception: z.boolean().optional().default(true),
  numberOfGuests: z.number().int().positive().optional().default(1),
});

export const updateRSVPSchema = createRSVPSchema.partial();

// Design Validation Schemas
export const createDesignSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().optional(),
  previewUrl: z.string().url('URL de prévisualisation invalide'),
  isPremium: z.boolean().optional().default(false),
  price: z.number().positive().optional(),
});

export const updateDesignSchema = createDesignSchema.partial();

// File Upload Validation
export const fileUploadSchema = z.object({
  file: z.any().refine((file) => file && file.size > 0, 'Fichier requis'),
});

// Pagination Validation
export const paginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Search Validation
export const searchSchema = z.object({
  query: z.string().min(1, 'Terme de recherche requis'),
  ...paginationSchema.shape,
});

// Analytics Validation
export const analyticsDateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Custom Domain Validation
export const customDomainSchema = z.object({
  domain: z.string().min(3, 'Domaine requis').regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/, 'Format de domaine invalide'),
});

// Export types from schemas
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type UpdateInvitationInput = z.infer<typeof updateInvitationSchema>;
export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
export type CreateRSVPInput = z.infer<typeof createRSVPSchema>;
export type UpdateRSVPInput = z.infer<typeof updateRSVPSchema>;
export type CreateDesignInput = z.infer<typeof createDesignSchema>;
export type UpdateDesignInput = z.infer<typeof updateDesignSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type AnalyticsDateRangeInput = z.infer<typeof analyticsDateRangeSchema>;
export type CustomDomainInput = z.infer<typeof customDomainSchema>; 