import { ServiceTier } from '@prisma/client';

// Les enums Prisma ne sont pas exportés, on utilise 'string' pour les types d'enum

// User Types
export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
}

// JWT Types
import { User, UserRole } from '@prisma/client';

export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

// Invitation Types
export interface CreateInvitationDto {
  // NOUVELLE ARCHITECTURE SIMPLIFIÉE
  eventTitle: string;      // "Emma & Lucas" ou "Anniversaire de Marie"
  eventDate: Date;         // Date de l'événement
  eventTime?: string;      // "15h00" (optionnel)
  location: string;        // "Château de la Roseraie, Paris"
  eventType?: string;      // Type d'événement (WEDDING, BIRTHDAY, etc.)
  customText?: string;     // Texte libre personnalisable
  moreInfo?: string;       // Informations supplémentaires
  
  // Champs techniques conservés
  description?: string;
  status?: string;
  photos?: string[];
  languages?: string[];
  designId: string;
}

export interface UpdateInvitationDto extends Partial<CreateInvitationDto> {
  status?: string;
}

export interface InvitationResponse {
  id: string;
  // NOUVELLE ARCHITECTURE SIMPLIFIÉE
  eventTitle: string;
  eventDate: Date;
  eventTime?: string;
  location: string;
  eventType: string;
  customText?: string;
  moreInfo?: string;
  
  // Champs techniques conservés
  description?: string;
  status: string;
  photos: string[];
  languages: string[];
  createdAt: Date;
  updatedAt: Date;
  design: DesignResponse;
  user: UserResponse;
  guestCount: number;
  rsvpCount: number;
}

// Guest Types
export interface CreateGuestDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  isVIP?: boolean;
  dietaryRestrictions?: string;
  plusOne?: boolean;
  plusOneName?: string;
}

export interface GuestResponse {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  isVIP: boolean;
  dietaryRestrictions?: string;
  plusOne: boolean;
  plusOneName?: string;
  createdAt: Date;
  rsvp?: RSVPResponse;
}

// RSVP Types
export interface CreateRSVPDto {
  status: string;
  message?: string;
  numberOfGuests?: number;
}

export interface RSVPResponse {
  id: string;
  status: string;
  message?: string;
  numberOfGuests: number;
  respondedAt?: Date;
  createdAt: Date;
  guest: GuestResponse;
}

// Design Types
export interface DesignTemplate {
  layout: string;      // Structure HTML de base
  sections: {
    [key: string]: {
      html: string;    // HTML du composant
      position: string; // Position dans le layout
    }
  };
}

export interface DesignStyles {
  base: {
    [selector: string]: {
      [property: string]: string;
    };
  };
  components: {
    [component: string]: {
      [selector: string]: {
        [property: string]: string;
      };
    };
  };
  animations?: {
    [name: string]: {
      keyframes: {
        [percentage: string]: {
          [property: string]: string;
        };
      };
    };
  };
}

export interface DesignVariables {
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
    background?: string;
    text?: string;
    [key: string]: string | undefined;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    fontSize: {
      base: string;
      heading: {
        h1: string;
        h2: string;
        h3: string;
      };
    };
  };
  spacing: {
    base: string;
    sections: string;
    components: string;
  };
  breakpoints?: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

export interface DesignComponents {
  [name: string]: {
    html: string;
    styles: {
      [selector: string]: {
        [property: string]: string;
      };
    };
    props?: string[];  // Variables que le composant peut accepter
  };
}

// NOUVELLE STRUCTURE SIMPLIFIÉE - Plus de template/styles/variables, tout est dans fabricData
export interface CreateDesignDto {
  name: string;
  description?: string;
  tags?: string[];
  isActive?: boolean;
  priceType?: ServiceTier;
  
  // Format Fabric.js (essentiel)
  fabricData?: any; // JSON Fabric.js complet du design (optionnel pour compatibilité legacy)
  editorVersion?: 'canva' | 'legacy'; // Version de l'éditeur utilisé
  
  // Dimensions du canvas
  canvasWidth?: number; // Largeur du canvas (ex: 794 pour A4)
  canvasHeight?: number; // Hauteur du canvas (ex: 1123 pour A4)
  canvasFormat?: string; // Format (ex: "A4", "A5", "custom")
  
  // Métadonnées
  backgroundImage?: string; // URL de l'image de fond (optionnel)
  thumbnail?: string; // URL de la miniature pour la galerie
  previewImage?: string; // URL de l'image de prévisualisation
  
  // Propriétaire du design (pour designs personnalisés)
  userId?: string; // null = modèle super-admin, rempli = design personnalisé user
  isTemplate?: boolean; // true = modèle réutilisable, false = design personnalisé
  originalDesignId?: string; // Référence au modèle original si c'est une personnalisation
}

export interface DesignResponse {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Format Fabric.js
  fabricData?: any; // Peut être null pour les designs legacy
  editorVersion?: 'canva' | 'legacy';
  
  // Dimensions du canvas (peuvent être null pour les anciens designs)
  canvasWidth: number; // Valeur par défaut 794 si null
  canvasHeight: number; // Valeur par défaut 1123 si null
  canvasFormat?: string;
  
  // Métadonnées
  backgroundImage?: string;
  thumbnail?: string;
  previewImage?: string;
  priceType: ServiceTier;
  
  // Propriétaire du design
  userId?: string;
  isTemplate: boolean;
  originalDesignId?: string;
}

// Theme Configuration
export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: string;
  spacing: string;
  borderRadius: string;
  shadows: boolean;
  animations: boolean;
}

// Program Details
export interface ProgramDetails {
  events: ProgramEvent[];
}

export interface ProgramEvent {
  time: string;
  title: string;
  description?: string;
  location?: string;
}

// File Upload Types
export interface FileUploadResponse {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

// Error Types
export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: any;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ServicePurchase Features
export interface ServicePurchaseFeatures {
  FREE: string[];
  ESSENTIAL: string[];
  ELEGANT: string[];
}

export const SUBSCRIPTION_FEATURES: ServicePurchaseFeatures = {
  FREE: [
    '1 design simple',
    'Invitation personnalisée',
    'RSVP',
    'Liste des invités',
    'Export CSV'
  ],
  ESSENTIAL: [
    'Plusieurs designs',
    'Album photo',
    'QR Code de partage',
    'Programme détaillé',
    'Statistiques simples'
  ],
  ELEGANT: [
    'Thèmes premium avec animations',
    'Notifications email/SMS',
    'Mini-vidéo d\'invitation',
    'Galerie photo post-mariage',
    'Gestion restrictions alimentaires',
    'Option multi-langues',
    'Heatmap géographique',
    'Intégration Google Calendar',
    'Badge VIP invités',
    'Espace liste de mariage/cadeaux'
  ]
}; 

import { Request, Response, NextFunction } from 'express';

export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response> | void | Response;

export type RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Response; 

// Provider Types V1
export interface CreateProviderProfileDto {
  businessName: string;
  categoryId: string;
  description: string;
  // GÉOLOCALISATION V1
  latitude: number;        // Coordonnées GPS (avec offset sécurité)
  longitude: number;       // Coordonnées GPS (avec offset sécurité)
  serviceRadius?: number;  // Rayon d'intervention en km (défaut: 25km)
  displayCity: string;     // Ville affichée publiquement
  // CONTACT OBLIGATOIRE V1
  phone: string;           // Téléphone obligatoire
  // PHOTOS FIREBASE V1
  profilePhoto?: string;   // URL Firebase
  portfolio?: string[];    // URLs Firebase (max 6)
}

export interface ProviderProfileResponse {
  id: string;
  businessName: string;
  categoryId: string;
  description: string;
  // GÉOLOCALISATION V1
  latitude: number;
  longitude: number;
  serviceRadius: number;
  displayCity: string;
  // CONTACT
  phone: string;
  // PHOTOS
  profilePhoto?: string;
  portfolio: string[];
  // STATUT V1 (auto-approuvé)
  status: string;
  verifiedAt: Date;
  // STRIPE CONNECT V1
  stripeAccountId?: string;
  stripeOnboarded: boolean;
  commissionRate: number;
  // MÉTRIQUES
  rating: number;
  reviewCount: number;
  bookingCount: number;
  totalEarnings: number;
  createdAt: Date;
  updatedAt: Date;
  category: ServiceCategoryResponse;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ServiceCategoryResponse {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

// NOUVEAU: Types pour géolocalisation V1
export interface GeoSearchParams {
  latitude: number;
  longitude: number;
  radius?: number;        // Rayon de recherche en km (défaut: 25km)
  categoryId?: string;
  eventType?: string;
  minRating?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

// NOUVEAU: Types pour booking V1
export interface CreateBookingDto {
  serviceId: string;
  eventDate: Date;
  eventTime?: string;
  eventType: string;      // WEDDING, BIRTHDAY, etc.
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  guestCount?: number;
  message?: string;
}

export interface BookingResponse {
  id: string;
  serviceId: string;
  eventDate: Date;
  eventTime?: string;
  eventType: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  guestCount?: number;
  message?: string;
  status: string;
  totalPrice: number;
  ourCommission: number;
  providerAmount: number;
  stripePaymentIntentId?: string;
  confirmedAt?: Date;
  paidAt?: Date;
  createdAt: Date;
  service: {
    id: string;
    name: string;
    price: number;
  };
  provider: {
    id: string;
    businessName: string;
    phone: string;
  };
}

// NOUVEAU: Types pour Stripe Connect V1
export interface StripeConnectDto {
  providerId: string;
  returnUrl: string;
  refreshUrl: string;
}

export interface CommissionCalculation {
  totalPrice: number;
  commissionRate: number;
  ourCommission: number;
  providerAmount: number;
} 