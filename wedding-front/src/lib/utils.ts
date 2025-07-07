import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { getDefaultTemplateData, mergeTemplateData, invitationToTemplateData } from './templateEngine';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Exemple d'utilisation du système de templates
export function getExampleTemplateData() {
  return {
    // Informations du couple
    coupleName: "Sophie & Alexandre",
    
    // Date et heure
    day: "15",
    month: "Juin",
    year: "2024",
    date: "15 Juin 2024",
    time: "16h00",
    
    // Textes d'invitation
    invitationText: "Vous êtes cordialement invités au mariage de",
    saveDate: "Réservez la date",
    celebrationText: "Venez célébrer avec nous ce moment unique",
    
    // Lieu et détails
    venue: "Domaine de la Roseraie",
    address: "123 Route des Vignes, 33000 Bordeaux",
    moreInfo: "Cérémonie laïque suivie d'un cocktail et dîner dansant",
    details: "Une journée magique nous attend, venez partager notre bonheur",
    
    // RSVP
    rsvpDetails: "Merci de confirmer votre présence avant le 15 mai 2024",
    rsvpForm: "RSVP obligatoire",
    rsvpDate: "15 Mai 2024",
    
    // Messages personnalisés
    message: "Votre présence illuminera notre plus beau jour",
    blessingText: "Entourés de leurs familles",
    welcomeMessage: "Bienvenue à notre union",
    
    // Informations supplémentaires
    dressCode: "Tenue chic de circonstance",
    reception: "Cocktail à partir de 17h30",
    ceremony: "Cérémonie à 16h00",
    contact: "Pour toute question : sophie.alexandre2024@email.com"
  };
}

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