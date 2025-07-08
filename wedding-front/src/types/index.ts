export type Guest = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: 'pending' | 'confirmed' | 'declined';
  token: string;
  dietaryRestrictions?: string;
  isVIP?: boolean;
  plusOne?: boolean;
  plusOneName?: string;
  invitationSentAt?: string;
  usedAt?: string;
  rsvp?: {
    id: string;
    status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
    attendees: number;
    dietaryRestrictions?: string;
    message?: string;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type Design = {
  id: string;
  name: string;
  description: string;
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
    animations: Record<string, any>;
  };
  variables: {
    colors: Record<string, string>;
    typography: Record<string, any>;
    spacing: Record<string, string>;
  };
  createdAt: string;
  updatedAt: string;
};

export type WeddingConfig = {
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
  role: 'COUPLE' | 'GUEST' | 'ADMIN';
  subscriptionTier?: string;
  subscriptionEndDate?: string;
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
  title: string;
  description: string;
  weddingDate: string;
  ceremonyTime: string;
  receptionTime: string;
  venueName: string;
  venueAddress: string;
  venueCoordinates: string;
  customDomain: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  theme: Theme;
  photos: Photo[];
  program: Program;
  restrictions: string;
  languages: string[];
  maxGuests: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  designId: string;
}

// Types pour les messages RSVP
export interface RSVPMessage {
  id: string;
  message: string;
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
  numberOfGuests: number;
  attendingCeremony: boolean;
  attendingReception: boolean;
  respondedAt: string | null;
  createdAt: string;
  guest: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  invitation: {
    id: string;
    title: string;
    createdAt: string;
  };
} 