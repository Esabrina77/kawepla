interface TemplateSection {
  html: string;
  position?: string;
  variables?: string[];
}

interface TemplateStyles {
  base: Record<string, Record<string, string>>;
  components: Record<string, Record<string, Record<string, string>>>;
  animations: Record<string, Record<string, Record<string, string>>>;
}

interface TemplateVariables {
  colors: Record<string, string>;
  typography: {
    bodyFont: string;
    headingFont: string;
    fontSize: {
      base: string;
      heading: Record<string, string>;
    };
  };
  spacing: Record<string, string>;
  breakpoints?: Record<string, string>;
}

export interface DesignTemplate {
  layout: string;
  sections: Record<string, TemplateSection>;
  styles: TemplateStyles;
  variables: TemplateVariables;
  components?: any;
  version?: string;
}

export interface TemplateData {
  // Informations du couple
  coupleName: string;
  
  // Date et heure
  day: string;
  month: string;
  year: string;
  date: string; // Format complet de la date
  time: string;
  
  // Textes d'invitation
  invitationText: string;
  
  // Lieu et détails
  venue: string;
  address: string;
  moreInfo: string;
  details: string;
  
  // RSVP
  rsvpDetails: string;
  rsvpForm: string;
  rsvpDate: string;
  
  // Messages personnalisés
  message: string;
  blessingText: string;
  welcomeMessage: string;
  
  // Informations supplémentaires
  dressCode: string;
  reception: string;
  ceremony: string;
  contact: string;
  
  // Permettre des propriétés supplémentaires
  [key: string]: string;
}

// Fonction pour fournir des valeurs par défaut
export function getDefaultTemplateData(): TemplateData {
  return {
    // Informations du couple
    coupleName: "Marie & Pierre",
    
    // Date et heure
    day: "23",
    month: "Novembre",
    year: "2024",
    date: "23 Novembre 2024",
    time: "15h00",
    
    // Textes d'invitation
    invitationText: "Vous êtes cordialement invités",
    
    // Lieu et détails
    venue: "Château de Versailles",
    address: "Place d'Armes, 78000 Versailles",
    moreInfo: "Cérémonie suivie d'un cocktail et dîner",
    details: "Nous avons hâte de partager ce moment magique avec vous",
    
    // RSVP
    rsvpDetails: "Merci de confirmer votre présence avant le 1er novembre",
    rsvpForm: "RSVP requis",
    rsvpDate: "1er Novembre 2024",
    
    // Messages personnalisés
    message: "Votre présence sera notre plus beau cadeau",
    blessingText: "Avec leurs familles",
    welcomeMessage: "Bienvenue à notre mariage",
    
    // Informations supplémentaires
    dressCode: "Tenue de soirée souhaitée",
    reception: "Réception à partir de 18h00",
    ceremony: "Cérémonie à 15h00",
    contact: "Pour toute question : marie.pierre@email.com"
  };
}

// Fonction pour convertir les données d'invitation en données de template
export function invitationToTemplateData(invitation: any): Partial<TemplateData> {
  if (!invitation) return {};

  // Assembler les détails complets à partir de moreInfo et des autres informations
  const venueInfo = invitation.venueName ? `Lieu : ${invitation.venueName}` : '';
  const addressInfo = invitation.venueAddress ? `Adresse : ${invitation.venueAddress}` : '';
  const ceremonyInfo = invitation.ceremonyTime ? `Cérémonie : ${invitation.ceremonyTime}` : '';
  const receptionInfo = invitation.receptionTime ? `Réception : ${invitation.receptionTime}` : '';
  const moreInfoText = invitation.moreInfo || '';
  
  // Assembler tous les détails - moreInfo contient maintenant tous les détails
  const allDetails = [venueInfo, addressInfo, ceremonyInfo, receptionInfo, moreInfoText]
    .filter(Boolean)
    .join('\n');

  return {
    // Informations du couple
    coupleName: invitation.coupleName || invitation.title || "Marie & Pierre",
    
    // Date et heure
    day: invitation.weddingDate ? new Date(invitation.weddingDate).getDate().toString() : "23",
    month: invitation.weddingDate ? new Date(invitation.weddingDate).toLocaleDateString('fr-FR', { month: 'long' }) : "Novembre",
    year: invitation.weddingDate ? new Date(invitation.weddingDate).getFullYear().toString() : "2024",
    date: invitation.weddingDate ? new Date(invitation.weddingDate).toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }) : "23 Novembre 2024",
    time: invitation.ceremonyTime || "15h00",
    
    // Textes d'invitation
    invitationText: invitation.invitationText || "Vous êtes cordialement invités",
    
    // Lieu et détails
    venue: invitation.venueName || "Château de Versailles",
    address: invitation.venueAddress || "Place d'Armes, 78000 Versailles",
    details: allDetails || invitation.moreInfo || "Détails de la cérémonie",
    moreInfo: invitation.moreInfo || "Cérémonie suivie d'un cocktail et dîner",
    
    // RSVP
    rsvpDetails: invitation.rsvpDetails || "Merci de confirmer votre présence",
    rsvpForm: invitation.rsvpForm || "RSVP requis",
    rsvpDate: invitation.rsvpDate ? 
      new Date(invitation.rsvpDate).toLocaleDateString('fr-FR') :
      invitation.weddingDate ? 
        new Date(new Date(invitation.weddingDate).getTime() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR') :
        "1er Novembre 2024",
    
    // Messages personnalisés
    message: invitation.message || "Votre présence sera notre plus beau cadeau",
    blessingText: invitation.blessingText || "Avec leurs familles",
    welcomeMessage: invitation.welcomeMessage || "Bienvenue à notre mariage",
    
    // Informations supplémentaires
    dressCode: invitation.dressCode || "Tenue de soirée souhaitée",
    reception: invitation.receptionTime ? `Réception à partir de ${invitation.receptionTime}` : "Réception à partir de 18h00",
    ceremony: invitation.ceremonyTime ? `Cérémonie à ${invitation.ceremonyTime}` : "Cérémonie à 15h00",
    contact: invitation.contact || "Pour toute question, contactez-nous"
  };
}

// Fonction pour fusionner les données utilisateur avec les valeurs par défaut
export function mergeTemplateData(userData: Partial<TemplateData> = {}): TemplateData {
  const defaultData = getDefaultTemplateData();
  const merged = { ...defaultData, ...userData };
  
  // S'assurer que toutes les propriétés sont des chaînes non-undefined
  Object.keys(merged).forEach(key => {
    if (merged[key] === undefined) {
      merged[key] = defaultData[key as keyof TemplateData] || '';
    }
  });
  
  return merged as TemplateData;
}

export function generateCSS(styles: TemplateStyles, variables: TemplateVariables, designId: string): string {
  let css = '';

  // Inject CSS variables avec vérifications de sécurité et corrections
  css += `#design-${designId} {\n`;
  
  if (variables && variables.colors) {
    Object.entries(variables.colors).forEach(([key, value]) => {
      // Corriger les couleurs invalides
      let correctedValue = value;
      if (value === '#gold') {
        correctedValue = '#FFD700'; // Or véritable
      } else if (value === 'gold') {
        correctedValue = '#FFD700';
      }
      css += `  --color-${key}: ${correctedValue};\n`;
    });
  }
  
  if (variables && variables.typography) {
    css += `  --body-font: ${variables.typography.bodyFont || 'Arial, sans-serif'};\n`;
    css += `  --heading-font: ${variables.typography.headingFont || 'Georgia, serif'};\n`;
    if (variables.typography.fontSize) {
      css += `  --font-size-base: ${variables.typography.fontSize.base || '16px'};\n`;
    }
  }
  
  if (variables && variables.spacing) {
    Object.entries(variables.spacing).forEach(([key, value]) => {
      css += `  --spacing-${key}: ${value};\n`;
    });
  }
  
  // Styles de base pour le container principal
  css += `  font-family: var(--body-font, Arial, sans-serif) !important;\n`;
  css += `  line-height: 1.6 !important;\n`;
  css += `  color: var(--color-primary, #333) !important;\n`;
  css += `  background: white !important;\n`;
  css += `  padding: 2rem !important;\n`;
  css += `  border-radius: 8px !important;\n`;
  css += `  box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;\n`;
  css += `}\n\n`;

  // Créer un mapping des animations pour remplacer les noms
  const animationMapping: Record<string, string> = {};
  if (styles && styles.animations) {
    Object.keys(styles.animations).forEach(name => {
      animationMapping[name] = `${name}-${designId}`;
    });
  }

  // Base styles avec vérifications et spécificité augmentée
  if (styles && styles.base) {
    Object.entries(styles.base).forEach(([selector, rules]) => {
      css += `#design-${designId} ${selector} {\n`;
      Object.entries(rules).forEach(([prop, value]) => {
        // Remplacer les noms d'animations dans les propriétés CSS
        let processedValue = value;
        if (prop === 'animation' || prop === 'animation-name') {
          Object.entries(animationMapping).forEach(([oldName, newName]) => {
            processedValue = processedValue.replace(new RegExp(`\\b${oldName}\\b`, 'g'), newName);
          });
        }
        css += `  ${prop}: ${processedValue} !important;\n`;
      });
      css += `}\n`;
    });
  }

  // Component styles avec vérifications et spécificité augmentée
  if (styles && styles.components) {
    Object.entries(styles.components).forEach(([component, selectors]) => {
      Object.entries(selectors).forEach(([selector, rules]) => {
        css += `#design-${designId} ${selector} {\n`;
        Object.entries(rules).forEach(([prop, value]) => {
          // Remplacer les noms d'animations dans les propriétés CSS
          let processedValue = value;
          if (prop === 'animation' || prop === 'animation-name') {
            Object.entries(animationMapping).forEach(([oldName, newName]) => {
              processedValue = processedValue.replace(new RegExp(`\\b${oldName}\\b`, 'g'), newName);
            });
          }
          css += `  ${prop}: ${processedValue} !important;\n`;
        });
        css += `}\n`;
      });
    });
  }

  // Animations avec vérifications
  if (styles && styles.animations) {
    Object.entries(styles.animations).forEach(([name, animation]) => {
      css += `@keyframes ${name}-${designId} {\n`;
      if (animation && animation.keyframes) {
        Object.entries(animation.keyframes).forEach(([keyframe, rules]) => {
          css += `  ${keyframe} {\n`;
          Object.entries(rules).forEach(([prop, value]) => {
            css += `    ${prop}: ${value};\n`;
          });
          css += `  }\n`;
        });
      }
      css += `}\n`;
    });
  }

  return css;
}

export function renderTemplate(
  template: DesignTemplate,
  data: Partial<TemplateData>,
  designId: string
): { html: string; css: string } {
  // Vérifications de sécurité
  if (!template || !template.sections || !template.layout) {
    console.error('Template invalide:', template);
    return { 
      html: '<div>Erreur: Template invalide</div>', 
      css: '' 
    };
  }

  // Fusionner avec les valeurs par défaut
  const completeData = mergeTemplateData(data);

  // Remplacer les variables dans chaque section
  const processedSections: Record<string, string> = {};
  Object.entries(template.sections).forEach(([key, section]) => {
    let html = section.html || '';
    Object.entries(completeData).forEach(([variable, value]) => {
      html = html.replace(new RegExp(`{${variable}}`, 'g'), value);
    });
    processedSections[key] = html;
  });

  // Assembler le template final
  let html = template.layout;
  Object.entries(processedSections).forEach(([key, content]) => {
    html = html.replace(`{${key}}`, content);
  });

  // Ajouter l'ID unique pour le design
  if (html.includes('class="wedding-invitation"')) {
    html = html.replace('class="wedding-invitation"', `id="design-${designId}" class="wedding-invitation"`);
  } else {
    // Si pas de classe wedding-invitation, ajouter l'ID au premier div
    html = html.replace('<div', `<div id="design-${designId}"`);
  }

  // Générer le CSS avec vérifications
  const css = generateCSS(template.styles || {}, template.variables || {}, designId);

  console.log('Template rendu:', { designId, html: html.substring(0, 100), css: css.substring(0, 200) });

  return { html, css };
}

// Classe TemplateEngine pour compatibilité
export class TemplateEngine {
  render(design: any, data: Partial<TemplateData>): string {
    if (!design || !design.template || !design.styles || !design.variables) {
      return '<div>Erreur: Design invalide</div>';
    }

    const designId = design.id || 'preview';
    const template: DesignTemplate = {
      layout: design.template.layout,
      sections: design.template.sections,
      styles: design.styles,
      variables: design.variables
    };

    const { html, css } = renderTemplate(template, data, designId);
    
    // Combiner HTML et CSS
    return `<style>${css}</style>${html}`;
  }
}