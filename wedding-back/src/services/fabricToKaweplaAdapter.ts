/**
 * Service d'adaptation pour convertir les données Fabric.js vers le format Kawepla
 * 
 * Ce service permet de convertir un JSON Fabric.js (depuis l'éditeur Canva)
 * vers le format template/styles/variables utilisé par Kawepla pour le rendu
 */

import { DesignTemplate, DesignStyles, DesignVariables, TextMapping } from '@/types';

export interface FabricToKaweplaResult {
  template: DesignTemplate;
  styles: DesignStyles;
  variables: DesignVariables;
  fabricData: any; // JSON Fabric.js complet pour réédition
  textMappings: Record<string, TextMapping>;
  canvasWidth: number;
  canvasHeight: number;
  canvasFormat: string;
}

/**
 * Convertit un JSON Fabric.js vers le format Kawepla
 * 
 * @param fabricJson - JSON Fabric.js (objet ou string)
 * @param canvasWidth - Largeur du canvas (optionnel, défaut: 794 pour A4)
 * @param canvasHeight - Hauteur du canvas (optionnel, défaut: 1123 pour A4)
 * @param backgroundImage - URL de l'image de fond (optionnel)
 * @returns Résultat de conversion avec template, styles, variables, etc.
 */
export function convertFabricToKawepla(
  fabricJson: any,
  canvasWidth: number = 794,
  canvasHeight: number = 1123,
  backgroundImage?: string
): FabricToKaweplaResult {
  // Normaliser le JSON (peut être string ou objet)
  const fabricData = typeof fabricJson === 'string' ? JSON.parse(fabricJson) : fabricJson;
  const objects = fabricData.objects || [];
  
  // Déterminer le format du canvas
  const canvasFormat = getCanvasFormat(canvasWidth, canvasHeight);
  
  // Extraire les textes avec leurs mappings
  const textMappings: Record<string, TextMapping> = {};
  const textElements: string[] = [];
  
  objects.forEach((obj: any, index: number) => {
    if (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text') {
      // Extraire la variable d'invitation depuis le texte ou la propriété custom
      const invitationVariable = obj.invitationVariable || extractVariableFromText(obj.text || '');
      
      if (invitationVariable) {
        const elementId = `element-${invitationVariable}`;
        const fabricObjectId = obj.id || `obj-${index}`;
        
        textMappings[elementId] = {
          elementId,
          invitationVariable,
          elementType: obj.type,
          fabricObjectId
        };
        
        textElements.push(`
          <div class="element-${elementId} positionable-element" 
               data-element-id="${elementId}"
               data-invitation-variable="${invitationVariable}">
            {${invitationVariable}}
          </div>
        `);
      }
    }
  });
  
  // Générer le template HTML
  const template: DesignTemplate = {
    layout: '<div class="invitation">{content}</div>',
    sections: {
      content: {
        html: `
          <div class="invitation-container">
            ${textElements.join('\n')}
          </div>
        `,
        position: 'content'
      }
    }
  };
  
  // Générer les styles pour chaque élément
  const elementStyles: Record<string, Record<string, string>> = {};
  
  objects.forEach((obj: any) => {
    if (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text') {
      const invitationVariable = obj.invitationVariable || extractVariableFromText(obj.text || '');
      
      if (invitationVariable) {
        const elementId = `element-${invitationVariable}`;
        const leftPercent = ((obj.left || 0) / canvasWidth) * 100;
        const topPercent = ((obj.top || 0) / canvasHeight) * 100;
        
        elementStyles[`.element-${elementId}`] = {
          position: 'absolute',
          left: `${leftPercent}%`,
          top: `${topPercent}%`,
          transform: 'translate(-50%, -50%)',
          'font-size': `${obj.fontSize || 16}px`,
          'font-family': obj.fontFamily || 'Montserrat, sans-serif',
          color: obj.fill || '#000000',
          'text-align': obj.textAlign || 'center',
          'font-weight': obj.fontWeight || 'normal',
          'font-style': obj.fontStyle || 'normal',
          'line-height': obj.lineHeight?.toString() || '1.5',
          'letter-spacing': `${obj.charSpacing || 0}px`,
          opacity: (obj.opacity || 1).toString(),
          'z-index': (obj.zIndex || 0).toString(),
          ...(obj.width && { width: `${(obj.width / canvasWidth) * 100}%` }),
          ...(obj.height && { height: `${(obj.height / canvasHeight) * 100}%` })
        };
      }
    }
  });
  
  // Styles de base
  const baseStyles: Record<string, any> = {
    '.invitation': {
      'width': '100%',
      'max-width': '600px',
      'aspect-ratio': `${canvasWidth}/${canvasHeight}`,
      'position': 'relative',
      'margin': '2% auto',
      'border-radius': '12px',
      'box-shadow': '0 8px 32px rgba(0,0,0,0.12)',
      'overflow': 'hidden',
      ...(backgroundImage && {
        'background-image': `url(${backgroundImage})`,
        'background-size': 'contain',
        'background-position': 'center',
        'background-repeat': 'no-repeat'
      })
    },
    '.invitation-container': {
      'width': '100%',
      'height': '100%',
      'position': 'relative'
    },
    '.positionable-element': {
      'position': 'absolute',
      'word-wrap': 'break-word',
      'hyphens': 'auto',
      'user-select': 'none'
    }
  };
  
  // Extraire les couleurs utilisées
  const colors: Record<string, string> = {
    primary: '#2c2c2c',
    secondary: '#555555',
    accent: '#666666'
  };
  
  objects.forEach((obj: any) => {
    if (obj.fill && typeof obj.fill === 'string' && !Object.values(colors).includes(obj.fill)) {
      if (!colors.primary || colors.primary === '#2c2c2c') {
        colors.primary = obj.fill;
      } else if (!colors.secondary || colors.secondary === '#555555') {
        colors.secondary = obj.fill;
      }
    }
  });
  
  // Variables
  const variables: DesignVariables = {
    colors,
    typography: {
      headingFont: 'Great Vibes, cursive',
      bodyFont: 'Montserrat, sans-serif',
      fontSize: {
        base: '16px',
        heading: {
          h1: '48px',
          h2: '22px',
          h3: '18px'
        }
      }
    },
    spacing: {
      base: '1rem',
      sections: '2rem',
      components: '1.5rem'
    }
  };
  
  return {
    template,
    styles: {
      base: baseStyles,
      components: {
        'positionable-elements': elementStyles
      },
      animations: {}
    },
    variables,
    fabricData,
    textMappings,
    canvasWidth,
    canvasHeight,
    canvasFormat
  };
}

/**
 * Extrait le nom de variable depuis un texte placeholder
 * Ex: "{{eventTitle}}" → "eventTitle"
 */
function extractVariableFromText(text: string): string | null {
  const match = text.match(/\{\{(\w+)\}\}/);
  return match ? match[1] : null;
}

/**
 * Détermine le format du canvas selon ses dimensions
 */
function getCanvasFormat(width: number, height: number): string {
  // A4: 794 x 1123 (portrait)
  if (width === 794 && height === 1123) return 'A4';
  // A4 landscape: 1123 x 794
  if (width === 1123 && height === 794) return 'A4-landscape';
  // A5: 559 x 794
  if (width === 559 && height === 794) return 'A5';
  // A3: 1123 x 1587
  if (width === 1123 && height === 1587) return 'A3';
  
  return 'custom';
}

/**
 * Valide qu'un design contient tous les champs requis pour une invitation
 */
export function validateInvitationDesign(
  result: FabricToKaweplaResult
): { isValid: boolean; missingFields: string[] } {
  const REQUIRED_FIELDS = ['eventTitle', 'eventDate', 'location'];
  
  const missingFields = REQUIRED_FIELDS.filter(
    field => !result.textMappings[`element-${field}`]
  );
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

