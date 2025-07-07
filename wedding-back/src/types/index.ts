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
  subscriptionTier: string;
  subscriptionEndDate?: Date;
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
  title: string;
  description?: string;
  weddingDate: Date;
  ceremonyTime?: string;
  receptionTime?: string;
  venueName: string;
  venueAddress: string;
  venueCoordinates?: string;
  customDomain?: string;
  theme: ThemeConfig;
  photos?: string[];
  program?: ProgramDetails;
  restrictions?: string;
  languages?: string[];
  maxGuests?: number;
  designId: string;
}

export interface UpdateInvitationDto extends Partial<CreateInvitationDto> {
  status?: string;
}

export interface InvitationResponse {
  id: string;
  title: string;
  description?: string;
  weddingDate: Date;
  ceremonyTime?: string;
  receptionTime?: string;
  venueName: string;
  venueAddress: string;
  venueCoordinates?: string;
  customDomain?: string;
  status: string;
  theme: ThemeConfig;
  photos: string[];
  program?: ProgramDetails;
  restrictions?: string;
  languages: string[];
  maxGuests?: number;
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
  attendingCeremony?: boolean;
  attendingReception?: boolean;
  numberOfGuests?: number;
}

export interface RSVPResponse {
  id: string;
  status: string;
  message?: string;
  attendingCeremony: boolean;
  attendingReception: boolean;
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
  breakpoints: {
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

export interface CreateDesignDto {
  name: string;
  description?: string;
  isPremium?: boolean;
  price?: number;
  template: DesignTemplate;
  styles: DesignStyles;
  components?: DesignComponents;
  variables: DesignVariables;
}

export interface DesignResponse extends CreateDesignDto {
  id: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  version: string;
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

// Analytics Types
export interface AnalyticsResponse {
  id: string;
  invitationId: string;
  pageViews: number;
  uniqueVisitors: number;
  rsvpResponses: number;
  date: Date;
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

// Subscription Features
export interface SubscriptionFeatures {
  BASIC: string[];
  STANDARD: string[];
  PREMIUM: string[];
}

export const SUBSCRIPTION_FEATURES: SubscriptionFeatures = {
  BASIC: [
    '1 design simple',
    'Invitation personnalisée',
    'RSVP',
    'Liste des invités',
    'Export CSV'
  ],
  STANDARD: [
    'Plusieurs designs',
    'Album photo',
    'QR Code de partage',
    'Programme détaillé',
    'Statistiques simples'
  ],
  PREMIUM: [
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