export type Guest = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  profilePhotoUrl?: string;
  isVIP: boolean;
  dietaryRestrictions?: string;
  plusOne: boolean;
  plusOneName?: string;
  inviteToken: string;
  usedAt?: string;
  invitationSentAt?: string;
  createdAt: Date;
  updatedAt: Date;
  invitationType: 'PERSONAL' | 'SHAREABLE';
  sharedLinkUsed: boolean;
  userId: string;
  invitationId: string;
  rsvp?: {
    id: string;
    status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
    message?: string;
    respondedAt?: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type Design = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  isPremium: boolean;
  isActive: boolean;
  backgroundImageRequired?: boolean;
  customFonts?: Record<string, string>;
  template: {
    layout: string;
    sections: Record<string, any>;
  };
  styles: {
    base: Record<string, any>;
    components: Record<string, any>;
    animations?: Record<string, any>;
  };
  variables: {
    colors: Record<string, string | undefined>;
    typography: Record<string, any>;
    spacing: Record<string, string>;
  };
  createdAt: string;
  updatedAt: string;
};

export type eventConfig = {
  id: string;
  designId: string;
  brideFirstName: string;
  brideLastName: string;
  groomFirstName: string;
  groomLastName: string;
  date: Date;
  location: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  message: string;
  photos: string[];
  schedule?: {
    time: string;
    description: string;
  }[];
  additionalInfo?: string;
  languages?: string[];
};

export type PlanTier = 'basic' | 'standard' | 'premium';

export type Statistics = {
  totalGuests: number;
  confirmed: number;
  declined: number;
  pending: number;
  responseRate: number;
  dietaryRestrictionsCount: number;
};

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'HOST' | 'GUEST' | 'ADMIN' | 'PROVIDER'; // HOST remplace organisateur
  serviceTier?: string;
  purchasedAt?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName?: string;
  lastName?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface Theme {
  fonts: {
    body: string;
    heading: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface Photo {
  url: string;
  caption: string;
}

export interface Program {
  ceremony: string;
  cocktail: string;
  dinner: string;
}

export interface Invitation {
  id: string;
  // NOUVELLE ARCHITECTURE SIMPLIFIÉE
  eventTitle: string;       // "Emma & Lucas" ou "Anniversaire de Marie"
  eventDate?: string;       // Date de l'événement (optionnel)
  eventTime?: string;       // "15h00" (optionnel)
  location: string;         // "Château de la Roseraie, Paris"
  eventType?: 'WEDDING' | 'BIRTHDAY' | 'BAPTISM' | 'ANNIVERSARY' | 'GRADUATION' | 'BABY_SHOWER' | 'ENGAGEMENT' | 'COMMUNION' | 'CONFIRMATION' | 'RETIREMENT' | 'HOUSEWARMING' | 'CORPORATE' | 'OTHER';
  customText?: string;      // Texte libre personnalisable
  moreInfo?: string;        // Informations supplémentaires
  
  // Champs techniques conservés
  description?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  photos: string[];         // URLs des photos
  languages: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  designId: string;
  
  // Champs pour l'admin (avec relations)
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  _count?: {
    guests: number;
    rsvps: number;
  };
}

// Types pour les messages RSVP
export interface RSVPMessage {
  id: string;
  message: string;
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
  respondedAt: string | null;
  createdAt: string;
  guest: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    plusOne: boolean;
    plusOneName?: string;
    dietaryRestrictions?: string;
    profilePhotoUrl?: string;
  };
  invitation: {
    id: string;
    eventTitle: string;     // Nouveau champ
    eventType: string;      // Type d'événement
    createdAt: string;
  };
}

// NOUVEAU V1: Types pour les prestataires
export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface ProviderProfile {
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
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  verifiedAt: string;
  // STRIPE CONNECT V1
  stripeAccountId?: string;
  stripeOnboarded: boolean;
  commissionRate: number;
  // MÉTRIQUES
  rating: number;
  reviewCount: number;
  bookingCount: number;
  totalEarnings: number;
  distance?: number; // Distance calculée pour la recherche géolocalisée
  createdAt: string;
  updatedAt: string;
  category: ServiceCategory;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateProviderProfileDto {
  businessName: string;
  categoryId: string;
  description: string;
  // GÉOLOCALISATION V1
  latitude: number;
  longitude: number;
  serviceRadius?: number;
  displayCity: string;
  // CONTACT OBLIGATOIRE V1
  phone: string;
  // PHOTOS FIREBASE V1
  profilePhoto?: string;
  portfolio?: string[];
}

export interface ServiceDto {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  priceType: 'hourly' | 'daily' | 'fixed' | 'package';
  currency: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  capacity?: number;
  includes: string[];
  requirements: string[];
  photos: string[];
  eventTypes: string[]; // Types d'événements supportés
  isActive: boolean;
  rating: number;
  reviewCount: number;
  bookingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookingDto {
  id: string;
  serviceId: string;
  eventDate: string;
  eventTime?: string;
  eventType: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  guestCount?: number;
  message?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'DISPUTED';
  totalPrice: number;
  ourCommission: number;
  providerAmount: number;
  stripePaymentIntentId?: string;
  confirmedAt?: string;
  paidAt?: string;
  createdAt: string;
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

// NOUVEAU V1: Types pour recherche géolocalisée
export interface GeoSearchParams {
  latitude: number;
  longitude: number;
  radius?: number;
  categoryId?: string;
  eventType?: string;
  minRating?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
} 