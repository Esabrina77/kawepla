import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { getDefaultInvitationData, mergeInvitationData, invitationToTemplateData, InvitationData } from './templateEngine';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Exemple d'utilisation du système de templates (NOUVELLE architecture)
export function getExampleTemplateData(): InvitationData {
  return {
    eventTitle: "Marie & Pierre",
    eventDate: new Date('2024-06-15T15:00:00'),
    eventTime: "15h00",
    location: "Château de Versailles, Place d'Armes, 78000 Versailles",
    eventType: "event",
    customText: "Vous êtes cordialement invités à célébrer notre union",
    moreInfo: "cérémonie suivie d'un cocktail et d'un dîner dansant. Tenue de soirée souhaitée."
  };
}

// Données d'exemple pour différents styles (NOUVELLE architecture)
export const exampleTemplateDataVariations = {
  classic: {
    ...getExampleTemplateData(),
    customText: "Ont l'honneur de vous inviter à célébrer leur union",
    moreInfo: "Votre présence sera notre plus beau cadeau. cérémonie suivie d'une réception."
  },
  modern: {
    ...getExampleTemplateData(),
    customText: "Vous invitent à célébrer leur union",
    moreInfo: "Partagez notre bonheur dans une ambiance moderne et décontractée."
  },
  birthday: {
    eventTitle: "Anniversaire de Marie",
    eventDate: new Date('2024-08-20T14:00:00'),
    eventTime: "14h00",
    location: "Jardin des Tuileries, Paris",
    eventType: "BIRTHDAY",
    customText: "Venez célébrer mes 30 ans !",
    moreInfo: "Après-midi festif avec gâteau et surprises. Tenue décontractée."
  },
  baptism: {
    eventTitle: "Baptême de Lucas",
    eventDate: new Date('2024-09-15T10:00:00'),
    eventTime: "10h00",
    location: "Église Saint-Sulpice, Paris",
    eventType: "BAPTISM",
    customText: "Marie & Pierre vous invitent au baptême de leur fils",
    moreInfo: "cérémonie suivie d'un déjeuner en famille. Tenue sobre souhaitée."
  }
};

// Fonction pour créer des données de test pour différents événements (NOUVELLE architecture)
export function getTemplateDataByEventType(eventType: 'event' | 'BIRTHDAY' | 'BAPTISM' | 'ANNIVERSARY' | 'OTHER') {
  const baseData = getDefaultInvitationData();
  
  switch (eventType) {
    case 'event':
      return mergeInvitationData({
        ...baseData,
        eventType: 'event',
        customText: "Ont l'honneur de vous inviter à célébrer leur événement",
        moreInfo: "cérémonie suivie d'une réception. Tenue élégante souhaitée."
      });
      
    case 'BIRTHDAY':
      return mergeInvitationData({
        eventTitle: "Anniversaire de Marie",
        eventDate: new Date('2024-08-20T14:00:00'),
        eventTime: "14h00",
        location: "Jardin des Tuileries, Paris",
        eventType: 'BIRTHDAY',
        customText: "Venez célébrer cette journée spéciale !",
        moreInfo: "Après-midi festif avec gâteau et surprises. Tenue décontractée."
      });
      
    case 'BAPTISM':
      return mergeInvitationData({
        eventTitle: "Baptême de Lucas",
        eventDate: new Date('2024-09-15T10:00:00'),
        eventTime: "10h00",
        location: "Église Saint-Sulpice, Paris",
        eventType: 'BAPTISM',
        customText: "Marie & Pierre vous invitent au baptême de leur fils",
        moreInfo: "cérémonie suivie d'un déjeuner en famille. Tenue sobre souhaitée."
      });
      
    case 'ANNIVERSARY':
      return mergeInvitationData({
        eventTitle: "Marie & Pierre",
        eventDate: new Date('2024-10-12T19:00:00'),
        eventTime: "19h00",
        location: "Restaurant Le Grand Véfour, Paris",
        eventType: 'ANNIVERSARY',
        customText: "Célèbrent leurs 10 ans de événement",
        moreInfo: "Soirée intime entre amis. Tenue chic de mise."
      });
      
    default:
      return baseData;
  }
} 