/**
 * Validation middleware pour la nouvelle architecture d'invitations simplifiée
 */
import { z } from 'zod';

// Schema pour la nouvelle architecture simplifiée PURE
export const NewInvitationCreateSchema = z.object({
  // CHAMPS OBLIGATOIRES
  eventTitle: z.string().min(1, 'Le titre de l\'événement est requis').max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)').or(z.string().datetime()).or(z.date()),
  location: z.string().min(1, 'Le lieu est requis').max(200, 'Le lieu ne peut pas dépasser 200 caractères'),
  designId: z.string().cuid('ID de design invalide'),
  
  // CHAMPS OPTIONNELS
  eventType: z.enum([
    'WEDDING', 'BIRTHDAY', 'BAPTISM', 'ANNIVERSARY', 'GRADUATION', 
    'BABY_SHOWER', 'ENGAGEMENT', 'COMMUNION', 'CONFIRMATION', 
    'RETIREMENT', 'HOUSEWARMING', 'CORPORATE', 'OTHER'
  ], { errorMap: () => ({ message: 'Type d\'événement invalide' }) }).optional().default('WEDDING'),
  eventTime: z.string().optional(),
  customText: z.string().max(500, 'Le texte personnalisé ne peut pas dépasser 500 caractères').optional(),
  moreInfo: z.string().max(1000, 'Les informations supplémentaires ne peuvent pas dépasser 1000 caractères').optional(),
  
  // CHAMPS TECHNIQUES
  description: z.string().optional(),
  photos: z.array(z.any()).optional(),
  languages: z.array(z.string()).optional()
});

export const NewInvitationUpdateSchema = NewInvitationCreateSchema.partial();

// Fonction de validation pour la nouvelle architecture pure
export async function validateNewInvitationData(data: any, isUpdate: boolean = false) {
  const schema = isUpdate ? NewInvitationUpdateSchema : NewInvitationCreateSchema;
  return schema.parse(data);
}

// Types TypeScript générés à partir des schemas
export type NewInvitationCreateInput = z.infer<typeof NewInvitationCreateSchema>;
export type NewInvitationUpdateInput = z.infer<typeof NewInvitationUpdateSchema>;
