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

// Interface pour les éléments positionnables
export interface PositionableElement {
  id: string;
  type: 'text' | 'image' | 'decoration';
  content: string;
  position: {
    x: number;  // Position X en pourcentage (0-100)
    y: number;  // Position Y en pourcentage (0-100)
    width?: number;  // Largeur en pourcentage (optionnel)
    height?: number; // Hauteur en pourcentage (optionnel)
  };
  styles: {
    fontSize?: string;
    fontFamily?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: string;
    fontStyle?: string;
    lineHeight?: string;
    letterSpacing?: string;
    textTransform?: string;
    opacity?: number;
    zIndex?: number;
  };
  responsive?: {
    mobile?: Partial<PositionableElement['position']> & Partial<PositionableElement['styles']>;
    tablet?: Partial<PositionableElement['position']> & Partial<PositionableElement['styles']>;
  };
}

// Interface pour les données d'invitation selon la NOUVELLE architecture backend
export interface InvitationData {
  // NOUVELLE ARCHITECTURE SIMPLIFIÉE (alignée sur le backend)
  eventTitle: string;       // "Emma & Lucas" ou "Anniversaire de Marie"
  eventDate: Date;          // Date de l'événement
  eventTime?: string;       // "15h00" (optionnel)
  location: string;         // "Château de la Roseraie, Paris"
  eventType?: string;       // event, BIRTHDAY, BAPTISM, etc.
  customText?: string;      // Texte libre personnalisable
  moreInfo?: string;        // Informations supplémentaires
  
  
  // Nouveaux éléments positionnables
  elements?: PositionableElement[];
}

// Fonction pour créer des éléments par défaut selon le type d'événement
export function getDefaultElements(eventType: string = 'event'): PositionableElement[] {
  const baseElements: PositionableElement[] = [
    {
      id: 'title',
      type: 'text',
      content: '{eventTitle}',
      position: { x: 50, y: 35, width: 80 },
      styles: {
        fontSize: '48px',
        fontFamily: 'Great Vibes, cursive',
        color: '#2c2c2c',
        textAlign: 'center',
        fontWeight: 'normal',
        lineHeight: '1.2',
        letterSpacing: '1px'
      },
      responsive: {
        mobile: { fontSize: '36px', y: 30 },
        tablet: { fontSize: '42px', y: 32 }
      }
    },
    {
      id: 'customText',
      type: 'text',
      content: '{customText}',
      position: { x: 50, y: 50, width: 70 },
      styles: {
        fontSize: '18px',
        fontFamily: 'Montserrat, sans-serif',
        color: '#555555',
        textAlign: 'center',
        fontWeight: '300',
        lineHeight: '1.4',
        letterSpacing: '0.5px'
      },
      responsive: {
        mobile: { fontSize: '16px', width: 85 },
        tablet: { fontSize: '17px', width: 75 }
      }
    },
    {
      id: 'eventDate',
      type: 'text',
      content: '{eventDate}',
      position: { x: 50, y: 65, width: 60 },
      styles: {
        fontSize: '22px',
        fontFamily: 'Montserrat, sans-serif',
        color: '#2c2c2c',
        textAlign: 'center',
        fontWeight: '400',
        letterSpacing: '1px',
        textTransform: 'uppercase'
      },
      responsive: {
        mobile: { fontSize: '18px', width: 80 },
        tablet: { fontSize: '20px', width: 70 }
      }
    },
    {
      id: 'eventTime',
      type: 'text',
      content: '{eventTime}',
      position: { x: 50, y: 72, width: 40 },
      styles: {
        fontSize: '16px',
        fontFamily: 'Montserrat, sans-serif',
        color: '#666666',
        textAlign: 'center',
        fontWeight: '300',
        letterSpacing: '0.5px'
      },
      responsive: {
        mobile: { fontSize: '14px', width: 60 },
        tablet: { fontSize: '15px', width: 50 }
      }
    },
    {
      id: 'location',
      type: 'text',
      content: '{location}',
      position: { x: 50, y: 80, width: 75 },
      styles: {
        fontSize: '16px',
        fontFamily: 'Montserrat, sans-serif',
        color: '#444444',
        textAlign: 'center',
        fontWeight: '300',
        lineHeight: '1.3',
        letterSpacing: '0.3px'
      },
      responsive: {
        mobile: { fontSize: '14px', width: 90, y: 82 },
        tablet: { fontSize: '15px', width: 85, y: 81 }
      }
    },
    {
      id: 'moreInfo',
      type: 'text',
      content: '{moreInfo}',
      position: { x: 50, y: 90, width: 80 },
      styles: {
        fontSize: '14px',
        fontFamily: 'Montserrat, sans-serif',
        color: '#666666',
        textAlign: 'center',
        fontWeight: '300',
        lineHeight: '1.4',
        letterSpacing: '0.2px',
        fontStyle: 'italic'
      },
      responsive: {
        mobile: { fontSize: '12px', width: 90, y: 92 },
        tablet: { fontSize: '13px', width: 85, y: 91 }
      }
    }
  ];

  // Ajuster selon le type d'événement
  if (eventType === 'BIRTHDAY') {
    baseElements[1].styles.color = '#ff6b6b';
    baseElements[2].styles.color = '#ff6b6b';
  } else if (eventType === 'BAPTISM') {
    baseElements[1].styles.color = '#4ecdc4';
    baseElements[2].styles.color = '#4ecdc4';
  }

  return baseElements;
}

// Fonction pour fournir des valeurs par défaut selon la NOUVELLE architecture
export function getDefaultInvitationData(): InvitationData {
  const defaultElements = getDefaultElements('event');
  
  return {
    eventTitle: "Mon Événement",
    eventDate: new Date('2025-06-14'),
    eventTime: "15:00",
    location: "Lieu de l'événement",
    eventType: "event",
    customText: "Vous êtes cordialement invité à notre événement", // Texte générique
    moreInfo: "Merci de confirmer votre présence", // Texte générique
    elements: defaultElements
  };
}

// Fonction pour obtenir des données de prévisualisation selon le type d'événement
export function getPreviewDataByType(eventType: string = 'event'): InvitationData {
  const defaultElements = getDefaultElements(eventType);
  
  const previewData: Record<string, InvitationData> = {
    'event': {
      eventTitle: "Mon Événement",
      eventDate: new Date('2025-06-14'),
      eventTime: "15:00",
      location: "Lieu de l'événement",
      eventType: "event",
      customText: "Vous êtes cordialement invité à notre événement",
      moreInfo: "Merci de confirmer votre présence",
      elements: defaultElements
    },
    'BIRTHDAY': {
      eventTitle: "Anniversaire de Marie",
      eventDate: new Date('2025-07-20'),
      eventTime: "19:00",
      location: "Restaurant Le Bistrot, Paris",
      eventType: "BIRTHDAY",
      customText: "Venez célébrer l'anniversaire de Marie",
      moreInfo: "Cadeaux optionnels",
      elements: defaultElements
    },
    'BAPTISM': {
      eventTitle: "Baptême de Lucas",
      eventDate: new Date('2025-08-15'),
      eventTime: "14:00",
      location: "Église Saint-Pierre, Lyon",
      eventType: "BAPTISM",
      customText: "Vous êtes invité au baptême de Lucas",
      moreInfo: "Cérémonie suivie d'un goûter",
      elements: defaultElements
    },
    'ANNIVERSARY': {
      eventTitle: "50 ans de Mariage",
      eventDate: new Date('2025-09-10'),
      eventTime: "18:00",
      location: "Salle des Fêtes, Marseille",
      eventType: "ANNIVERSARY",
      customText: "Célébrons ensemble nos 50 ans de bonheur",
      moreInfo: "Dîner dansant",
      elements: defaultElements
    },
    'CORPORATE': {
      eventTitle: "Séminaire Entreprise",
      eventDate: new Date('2025-10-05'),
      eventTime: "09:00",
      location: "Centre de Conférences, Paris",
      eventType: "CORPORATE",
      customText: "Séminaire annuel de l'entreprise",
      moreInfo: "Déjeuner inclus",
      elements: defaultElements
    }
  };
  
  return previewData[eventType] || previewData['event'];
}

// Fonction pour convertir les données d'invitation en données de template (NOUVELLE architecture)
export function invitationToTemplateData(invitation: any): InvitationData {
  if (!invitation) return getDefaultInvitationData();

  return {
    eventTitle: invitation.eventTitle || "",
    eventDate: invitation.eventDate ? new Date(invitation.eventDate) : new Date('2025-06-14'),
    eventTime: invitation.eventTime || "",
    location: invitation.location || "",
    eventType: invitation.eventType || "event",
    customText: invitation.customText || "", // Pas de texte par défaut pour les champs optionnels
    moreInfo: invitation.moreInfo || "" // Pas de texte par défaut pour les champs optionnels
  };
}

// Fonction pour fusionner les données utilisateur avec les valeurs par défaut
export function mergeInvitationData(userData: Partial<InvitationData> = {}): InvitationData {
  const defaultData = getDefaultInvitationData();
  return { 
    ...defaultData, 
    ...userData
  };
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
  
  // Styles de base pour format A4 responsive
  css += `  background-size: contain !important;\n`;
  css += `  background-position: center !important;\n`;
  css += `  background-repeat: no-repeat !important;\n`;
  css += `  margin: 2% auto !important;\n`;
  css += `  padding: 0 !important;\n`;
  css += `  width: 100% !important;\n`;
  css += `  max-width: 600px !important;\n`;
  css += `  aspect-ratio: 21/29.7 !important;\n`; // Format A4
  css += `  position: relative !important;\n`;
  css += `  overflow: hidden !important;\n`;
  css += `  border-radius: 12px !important;\n`;
  css += `  box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;\n`;
  
  // Ajouter le background image depuis les variables si disponible
  if (variables && variables.colors && variables.colors.background) {
    css += `  background-image: url(${variables.colors.background}) !important;\n`;
  }
  
  css += `}\n\n`;

  // Styles responsifs pour format A4
  css += `@media (max-width: 768px) {\n`;
  css += `  #design-${designId} {\n`;
  css += `    max-width: 95vw !important;\n`;
  css += `    margin: 1% auto !important;\n`;
  css += `  }\n`;
  css += `}\n\n`;

  css += `@media (max-width: 480px) {\n`;
  css += `  #design-${designId} {\n`;
  css += `    max-width: 98vw !important;\n`;
  css += `    margin: 0.5% auto !important;\n`;
  css += `  }\n`;
  css += `}\n\n`;

  // Responsive styles seront gérés par les styles personnalisés





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
        // Convertir camelCase vers kebab-case pour les propriétés CSS
        const cssProperty = prop.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
        
        // Remplacer les noms d'animations dans les propriétés CSS
        let processedValue = value;
        if (prop === 'animation' || prop === 'animation-name') {
          Object.entries(animationMapping).forEach(([oldName, newName]) => {
            processedValue = processedValue.replace(new RegExp(`\\b${oldName}\\b`, 'g'), newName);
          });
        }
        css += `  ${cssProperty}: ${processedValue} !important;\n`;
      });
      css += `}\n`;
    });
  }

  // Component styles avec vérifications et spécificité augmentée
  if (styles && styles.components) {
    Object.entries(styles.components).forEach(([component, selectors]) => {
      // Pour 'positionable-elements', les selectors sont directement les styles par classe
      if (component === 'positionable-elements' || component === 'text-elements') {
        Object.entries(selectors).forEach(([selector, rules]) => {
          css += `#design-${designId} ${selector} {\n`;
          Object.entries(rules).forEach(([prop, value]) => {
            // Convertir camelCase vers kebab-case pour les propriétés CSS
            const cssProperty = prop.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            
            // Les polices sont maintenant directement utilisables
            let processedValue = value;
            css += `  ${cssProperty}: ${processedValue} !important;\n`;
          });
          css += `}\n`;
        });
      } else {
        // Pour les autres composants, structure normale
        Object.entries(selectors).forEach(([selector, rules]) => {
          css += `#design-${designId} ${selector} {\n`;
          Object.entries(rules).forEach(([prop, value]) => {
            const cssProperty = prop.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            let processedValue = value;
            if (prop === 'animation' || prop === 'animation-name') {
              Object.entries(animationMapping).forEach(([oldName, newName]) => {
                processedValue = processedValue.replace(new RegExp(`\\b${oldName}\\b`, 'g'), newName);
              });
            }
            // Les polices sont maintenant directement utilisables
            css += `  ${cssProperty}: ${processedValue} !important;\n`;
          });
          css += `}\n`;
        });
      }
    });
  }

  // Les styles personnalisés sont maintenant gérés dans la section component ci-dessus

  // Styles de base pour les éléments positionnables
  css += `#design-${designId} .invitation-container {\n`;
  css += `  width: 100%;\n`;
  css += `  height: 100%;\n`;
  css += `  position: relative;\n`;
  css += `}\n\n`;

  css += `#design-${designId} .positionable-element {\n`;
  css += `  position: absolute;\n`;
  css += `  word-wrap: break-word;\n`;
  css += `  hyphens: auto;\n`;
  css += `  user-select: none;\n`;
  css += `}\n\n`;

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

// Fonction pour générer les styles d'un élément positionnable
export function generateElementCSS(element: PositionableElement, designId: string): string {
  let css = '';
  const elementId = `element-${element.id}`;
  
  css += `#design-${designId} .${elementId} {\n`;
  css += `  position: absolute;\n`;
  css += `  left: ${element.position.x}%;\n`;
  css += `  top: ${element.position.y}%;\n`;
  css += `  transform: translate(-50%, -50%);\n`;
  
  if (element.position.width) {
    css += `  width: ${element.position.width}%;\n`;
  }
  if (element.position.height) {
    css += `  height: ${element.position.height}%;\n`;
  }
  
  // Appliquer les styles
  Object.entries(element.styles).forEach(([prop, value]) => {
    if (value !== undefined) {
      const cssProperty = prop.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
      css += `  ${cssProperty}: ${value};\n`;
    }
  });
  
  css += `  word-wrap: break-word;\n`;
  css += `  hyphens: auto;\n`;
  css += `}\n`;

  // Styles responsifs
  if (element.responsive?.tablet) {
    css += `@media (max-width: 768px) {\n`;
    css += `  #design-${designId} .${elementId} {\n`;
    Object.entries(element.responsive.tablet).forEach(([prop, value]) => {
      if (value !== undefined) {
        if (prop === 'x') css += `    left: ${value}%;\n`;
        else if (prop === 'y') css += `    top: ${value}%;\n`;
        else if (prop === 'width') css += `    width: ${value}%;\n`;
        else if (prop === 'height') css += `    height: ${value}%;\n`;
        else if (prop === 'fontSize') css += `    font-size: ${value};\n`;
      }
    });
    css += `  }\n`;
    css += `}\n`;
  }

  if (element.responsive?.mobile) {
    css += `@media (max-width: 480px) {\n`;
    css += `  #design-${designId} .${elementId} {\n`;
    Object.entries(element.responsive.mobile).forEach(([prop, value]) => {
      if (value !== undefined) {
        if (prop === 'x') css += `    left: ${value}%;\n`;
        else if (prop === 'y') css += `    top: ${value}%;\n`;
        else if (prop === 'width') css += `    width: ${value}%;\n`;
        else if (prop === 'height') css += `    height: ${value}%;\n`;
        else if (prop === 'fontSize') css += `    font-size: ${value};\n`;
      }
    });
    css += `  }\n`;
    css += `}\n`;
  }

  return css;
}

// Fonction pour générer le HTML avec éléments positionnables
export function generateModernInvitationHTML(data: InvitationData): string {
  const formatDate = (date: Date) => {
    // Format fixe et élégant : "19 octobre 2025"
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    
    // Convertir le format HH:MM vers HHhMM (ex: "15:30" -> "15h30")
    const timeRegex = /^(\d{1,2}):(\d{2})$/;
    const match = time.match(timeRegex);
    
    if (match) {
      const [, hours, minutes] = match;
      return `${hours}h${minutes}`;
    }
    
    // Si ce n'est pas au format HH:MM, retourner tel quel
    return time;
  };


  let html = '<div class="invitation-container">';
  
  // Générer chaque élément positionnable
  if (data.elements && data.elements.length > 0) {
    data.elements.forEach(element => {
      let content = element.content;
      
      // Remplacer les variables par les vraies valeurs
      content = content.replace('{eventTitle}', data.eventTitle || '');
      
      
      // Formatage simple et direct
      content = content.replace('{eventDate}', data.eventDate ? formatDate(data.eventDate) : '');
      content = content.replace('{eventTime}', data.eventTime ? formatTime(data.eventTime) : '');
      content = content.replace('{location}', data.location || '');
      content = content.replace('{customText}', data.customText || '');
      content = content.replace('{moreInfo}', data.moreInfo || '');
      
      
      // Ne pas afficher l'élément si le contenu est vide après remplacement
      const trimmedContent = content.trim();
      if (trimmedContent && trimmedContent !== '' && trimmedContent !== '{customText}' && trimmedContent !== '{moreInfo}') {
        html += `<div class="element-${element.id} positionable-element" data-element-id="${element.id}" data-draggable="true">`;
        html += trimmedContent;
        html += '</div>';
      }
    });
  } else {
    // Fallback vers l'ancien système si pas d'éléments définis
    if (data.eventTitle) {
      html += `<div class="element-title positionable-element">${data.eventTitle}</div>`;
    }
    if (data.customText && data.customText.trim()) {
      html += `<div class="element-customText positionable-element">${data.customText}</div>`;
    }
    if (data.eventDate) {
      html += `<div class="element-eventDate positionable-element">${formatDate(data.eventDate)}</div>`;
    }
    if (data.eventTime && data.eventTime.trim()) {
      html += `<div class="element-eventTime positionable-element">${formatTime(data.eventTime)}</div>`;
    }
    if (data.location && data.location.trim()) {
      html += `<div class="element-location positionable-element">${data.location}</div>`;
    }
    if (data.moreInfo && data.moreInfo.trim()) {
      html += `<div class="element-moreInfo positionable-element">${data.moreInfo}</div>`;
    }
  }
  
  html += '</div>';
  return html;
}

// Fonction pour générer le HTML selon la NOUVELLE architecture simplifiée (legacy)
export function generateInvitationHTML(data: InvitationData): string {
  // Utiliser la nouvelle fonction moderne
  return generateModernInvitationHTML(data);
}

export function renderTemplate(
  template: DesignTemplate,
  data: Partial<InvitationData>,
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
  const completeData = mergeInvitationData(data);

  // Générer le HTML moderne avec éléments positionnables
  const invitationHTML = generateModernInvitationHTML(completeData);

  // Remplacer les variables dans chaque section
  const processedSections: Record<string, string> = {};
  Object.entries(template.sections).forEach(([key, section]) => {
    let html = section.html || '';
    Object.entries(completeData).forEach(([variable, value]) => {
      if (typeof value === 'string') {
        // Si la valeur est vide, remplacer par une chaîne vide
        const replacementValue = value.trim() === '' ? '' : value;
        html = html.replace(new RegExp(`{${variable}}`, 'g'), replacementValue);
      } else if (value instanceof Date) {
        html = html.replace(new RegExp(`{${variable}}`, 'g'), value.toLocaleDateString('fr-FR'));
      }
    });
    processedSections[key] = html;
  });

  // Assembler le template final
  let html = template.layout;
  Object.entries(processedSections).forEach(([key, content]) => {
    html = html.replace(`{${key}}`, content);
  });

  // Remplacer le contenu principal par notre HTML d'invitation moderne
  html = html.replace('{content}', invitationHTML);

  // Ajouter l'ID unique pour le design
  if (html.includes('class="invitation"')) {
    html = html.replace('class="invitation"', `id="design-${designId}" class="invitation"`);
  } else {
    // Si pas de classe invitation, ajouter l'ID au premier div
    html = html.replace('<div', `<div id="design-${designId}"`);
  }

  // Générer le CSS de base avec vérifications
  let css = generateCSS(template.styles || {}, template.variables || {}, designId);

  // Les styles des éléments positionnables sont maintenant inclus dans template.styles.components
  // Pas besoin de les ajouter dynamiquement

  return { html, css };
}

// Classe TemplateEngine pour compatibilité
export class TemplateEngine {
  render(design: any, data: Partial<InvitationData>): string {
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
    
    // Ajouter les polices CSS personnalisées
    const fontCSS = `
      @font-face {
        font-family: 'Featherscript';
        src: url('/fonts/featherscript.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Harrington';
        src: url('/fonts/harrington.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'OpenDyslexic';
        src: url('/fonts/opendyslexic.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Great Vibes';
        src: url('/fonts/greatvibes.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Montserrat';
        src: url('/fonts/montserrat.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Poppins';
        src: url('/fonts/poppins.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Bride';
        src: url('/fonts/Bride.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'FFF Tusj';
        src: url('/fonts/fff_tusj.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Kalam';
        src: url('/fonts/kalam.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Windsong';
        src: url('/fonts/windsong.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Alex Brush';
        src: url('/fonts/alexbrush.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Miama';
        src: url('/fonts/miama.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Blackjack';
        src: url('/fonts/blackjack.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'League Script';
        src: url('/fonts/league-script.league-script.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Daisy';
        src: url('/fonts/daisy.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      
      /* Animations */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      @keyframes bounce {
        0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
        40%, 43% { transform: translateY(-15px); }
        70% { transform: translateY(-7px); }
        90% { transform: translateY(-3px); }
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
    `;
    
    // Combiner HTML et CSS
    return `<style>${fontCSS}${css}</style>${html}`;
  }
}