import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { getDefaultTemplateData, mergeTemplateData, invitationToTemplateData, TemplateData } from './templateEngine';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Exemple d'utilisation du système de templates
export function getExampleTemplateData(): TemplateData {
  return {
    coupleName: "Marie & Pierre",
    day: "15",
    month: "Juin",
    year: "2024",
    date: "15 Juin 2024",
    time: "15h00",
    invitationText: "Vous êtes cordialement invités à célébrer notre union",
    venue: "Château de Versailles",
    address: "Place d'Armes, 78000 Versailles",
    details: "Cérémonie suivie d'un cocktail et d'un dîner dansant",
    message: "Votre présence sera notre plus beau cadeau",
    blessingText: "Avec leurs familles",
    welcomeMessage: "Bienvenue à notre mariage",
    rsvpDetails: "Merci de confirmer votre présence avant le 1er mai",
    rsvpForm: "RSVP requis",
    rsvpDate: "1er Mai 2024",
    dressCode: "Tenue de soirée souhaitée",
    contact: "marie.pierre@email.com",
    moreInfo: "Hébergement disponible sur demande",
    ceremony: "Cérémonie à 15h00",
    reception: "Réception à 18h00"
  };
}

// Données d'exemple pour différents styles
export const exampleTemplateDataVariations = {
  classic: {
    ...getExampleTemplateData(),
    invitationText: "Ont l'honneur de vous inviter",
    message: "Votre présence sera notre plus beau cadeau",
    blessingText: "Avec leurs familles"
  },
  modern: {
    ...getExampleTemplateData(),
    invitationText: "Vous invitent à célébrer leur union",
    message: "Partagez notre bonheur"
  },
  english: {
    ...getExampleTemplateData(),
    invitationText: "Request the pleasure of your company",
    message: "Your presence is our greatest gift"
  },
  vintage: {
    ...getExampleTemplateData(),
    invitationText: "Vous convient à leurs noces",
    message: "Une soirée d'antan vous attend"
  },
  bohemian: {
    ...getExampleTemplateData(),
    invitationText: "Joignez-vous à nous pour célébrer l'amour",
    message: "Célébrons l'amour qui fleurit"
  },
  indian: {
    ...getExampleTemplateData(),
    invitationText: "आपको हमारे विवाह समारोह में आमंत्रित करते हैं",
    message: "हमारे साथ खुशियाँ मनाएं"
  }
};

// Fonction pour créer des données de test pour différents styles
export function getTemplateDataByStyle(style: 'elegant' | 'modern' | 'vintage' | 'floral' | 'indian') {
  const baseData = getDefaultTemplateData();
  
  switch (style) {
    case 'elegant':
      return mergeTemplateData({
        ...baseData,
        invitationText: "Nous avons l'honneur de vous inviter",
        celebrationText: "Partagez notre bonheur",
        venue: "Château de Malmaison",
        dressCode: "Tenue de soirée exigée"
      });
      
    case 'modern':
      return mergeTemplateData({
        ...baseData,
        invitationText: "Join us for our wedding celebration",
        celebrationText: "Let's party together",
        venue: "The Modern Loft",
        dressCode: "Smart casual"
      });
      
    case 'vintage':
      return mergeTemplateData({
        ...baseData,
        invitationText: "Nous vous prions de bien vouloir honorer",
        celebrationText: "Une soirée d'antan vous attend",
        venue: "Manoir des Glycines",
        dressCode: "Tenue vintage appréciée"
      });
      
    case 'floral':
      return mergeTemplateData({
        ...baseData,
        invitationText: "Comme deux fleurs qui s'épanouissent",
        celebrationText: "Célébrons l'amour qui fleurit",
        venue: "Jardin Botanique de Paris",
        dressCode: "Couleurs printanières bienvenues"
      });
      
    case 'indian':
      return mergeTemplateData({
        ...baseData,
        invitationText: "आपको सादर आमंत्रित करते हैं",
        celebrationText: "हमारे साथ खुशियाँ मनाएं",
        venue: "Palais Royal Indien",
        dressCode: "Tenue traditionnelle souhaitée"
      });
      
    default:
      return baseData;
  }
} 