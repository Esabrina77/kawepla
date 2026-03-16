/**
 * Service d'adaptation pour charger un design Kawepla dans un canvas Fabric.js
 * 
 * Ce service permet de charger un design depuis la base de données Kawepla
 * dans l'éditeur Canva (Fabric.js) pour réédition
 */

import { DesignResponse } from '@/types';

/**
 * Charge un design Kawepla dans un canvas Fabric.js
 * 
 * @param design - Design depuis la base de données Kawepla
 * @returns JSON Fabric.js prêt à être chargé dans le canvas, ou null si impossible
 */
export function loadKaweplaDesignToFabric(design: DesignResponse): any | null {
  // Si fabricData existe, retourner directement (design créé avec l'éditeur Canva)
  if (design.fabricData) {
    return design.fabricData;
  }
  
  // Sinon, reconstruire depuis template/styles (design legacy)
  // Cette reconstruction est complexe et peut perdre certaines informations
  // Il est recommandé d'avoir fabricData pour une réédition complète
  if (design.editorVersion === 'legacy') {
    console.warn('Design legacy détecté. Reconstruction partielle depuis template/styles.');
    return reconstructFabricFromLegacy(design);
  }
  
  return null;
}

/**
 * Reconstruit un JSON Fabric.js depuis un design legacy (template/styles)
 * 
 * Note: Cette fonction est une approximation et peut ne pas restituer
 * exactement le design original. Il est préférable d'avoir fabricData.
 */
function reconstructFabricFromLegacy(design: DesignResponse): any {
  const canvasWidth = design.canvasWidth || 794;
  const canvasHeight = design.canvasHeight || 1123;
  
  const fabricObjects: any[] = [];
  
  // Extraire les éléments depuis les styles components
  if (design.styles?.components?.['positionable-elements']) {
    const elementStyles = design.styles.components['positionable-elements'];
    
    Object.keys(elementStyles).forEach((selector) => {
      // Extraire l'elementId depuis le selector (ex: ".element-eventTitle" → "eventTitle")
      const match = selector.match(/\.element-(.+)/);
      if (!match) return;
      
      const elementId = match[1];
      const styles = elementStyles[selector];
      
      // Trouver le mapping correspondant
      const mapping = design.textMappings?.[elementId];
      if (!mapping) return;
      
      // Convertir les pourcentages en pixels
      const leftPercent = parseFloat(styles.left?.replace('%', '') || '50');
      const topPercent = parseFloat(styles.top?.replace('%', '') || '50');
      const left = (leftPercent / 100) * canvasWidth;
      const top = (topPercent / 100) * canvasHeight;
      
      // Extraire les propriétés de style
      const fontSize = parseFloat(styles['font-size']?.replace('px', '') || '16');
      const fontFamily = styles['font-family'] || 'Montserrat, sans-serif';
      const color = styles.color || '#000000';
      const textAlign = styles['text-align'] || 'center';
      const fontWeight = styles['font-weight'] || 'normal';
      const fontStyle = styles['font-style'] || 'normal';
      const lineHeight = parseFloat(styles['line-height'] || '1.5');
      const charSpacing = parseFloat(styles['letter-spacing']?.replace('px', '') || '0');
      const opacity = parseFloat(styles.opacity || '1');
      
      // Calculer la largeur si disponible
      let width = 200; // Défaut
      if (styles.width) {
        const widthPercent = parseFloat(styles.width.replace('%', ''));
        width = (widthPercent / 100) * canvasWidth;
      }
      
      // Créer l'objet Fabric.js
      const fabricObject = {
        type: mapping.elementType || 'textbox',
        left: left,
        top: top,
        width: width,
        fontSize: fontSize,
        fontFamily: fontFamily,
        fill: color,
        textAlign: textAlign,
        fontWeight: fontWeight,
        fontStyle: fontStyle,
        lineHeight: lineHeight,
        charSpacing: charSpacing,
        opacity: opacity,
        text: `{{${mapping.invitationVariable}}}`,
        invitationVariable: mapping.invitationVariable,
        isPlaceholder: true,
        id: mapping.fabricObjectId || `obj-${fabricObjects.length}`
      };
      
      fabricObjects.push(fabricObject);
    });
  }
  
  // Créer le JSON Fabric.js
  const fabricJson = {
    version: '6.9.0',
    objects: fabricObjects,
    background: design.backgroundImage || '#ffffff',
    backgroundImage: design.backgroundImage || null
  };
  
  return fabricJson;
}

/**
 * Vérifie si un design peut être chargé dans l'éditeur Canva
 */
export function canLoadInCanvaEditor(design: DesignResponse): boolean {
  // Si fabricData existe, on peut le charger directement
  if (design.fabricData) {
    return true;
  }
  
  // Si c'est un design legacy avec textMappings, on peut le reconstruire
  if (design.editorVersion === 'legacy' && design.textMappings) {
    return true;
  }
  
  return false;
}

