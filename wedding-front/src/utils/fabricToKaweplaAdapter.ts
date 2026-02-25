/**
 * Adapter pour convertir les données Fabric.js vers le format Kawepla
 * Version simplifiée - Plus de placeholders, juste le fabricData
 */

import * as fabric from 'fabric';

export interface FabricToKaweplaResult {
  fabricData: any; // JSON Fabric.js complet
  canvasWidth: number;
  canvasHeight: number;
  canvasFormat: string;
  backgroundImage?: string;
}

/**
 * Convertit un canvas Fabric.js vers le format Kawepla simplifié
 */
export function convertFabricToKawepla(
  canvas: fabric.Canvas,
  backgroundImage?: string
): FabricToKaweplaResult {
  const fabricJson = canvas.toJSON();

  const canvasWidth = canvas.width || 794;
  const canvasHeight = canvas.height || 800;
  const canvasFormat = getCanvasFormat(canvasWidth, canvasHeight);

  return {
    fabricData: fabricJson,
    canvasWidth,
    canvasHeight,
    canvasFormat,
    backgroundImage
  };
}

/**
 * Détermine le format du canvas basé sur ses dimensions
 */
export function getCanvasFormat(width: number, height: number): string {
  // Formats standards
  const formats: Record<string, { width: number; height: number; tolerance: number }> = {
    'A4': { width: 794, height: 1123, tolerance: 10 },
    'A5': { width: 559, height: 794, tolerance: 10 },
    'A3': { width: 1123, height: 1587, tolerance: 10 },
    'Letter': { width: 816, height: 1056, tolerance: 10 },
  };

  for (const [format, specs] of Object.entries(formats)) {
    if (
      Math.abs(width - specs.width) <= specs.tolerance &&
      Math.abs(height - specs.height) <= specs.tolerance
    ) {
      return format;
    }
  }

  return 'custom';
}

/**
 * Charge un design Kawepla dans un canvas Fabric.js
 * Corrige le décalage du background image en le scalant pour couvrir tout le canvas
 */
export function loadKaweplaDesignToFabric(
  design: { fabricData: any; canvasWidth?: number; canvasHeight?: number },
  canvas: fabric.Canvas
): void {
  if (!design.fabricData) {
    console.warn('No fabricData found in design');
    return;
  }

  const targetWidth = design.canvasWidth || canvas.width || 794;
  const targetHeight = design.canvasHeight || canvas.height || 800;

  // Charger le JSON Fabric.js
  canvas.loadFromJSON(design.fabricData).then(() => {
    // Ajuster les dimensions du canvas
    canvas.setWidth(targetWidth);
    canvas.setHeight(targetHeight);

    // Corriger le background image pour qu'il couvre tout le canvas
    const bgImage = canvas.backgroundImage;
    if (bgImage && bgImage instanceof fabric.FabricImage) {
      const imgWidth = bgImage.width || 1;
      const imgHeight = bgImage.height || 1;

      // Calculer le scale pour couvrir (cover) tout le canvas
      const scaleX = targetWidth / imgWidth;
      const scaleY = targetHeight / imgHeight;
      const coverScale = Math.max(scaleX, scaleY);

      bgImage.set({
        scaleX: coverScale,
        scaleY: coverScale,
        left: 0,
        top: 0,
        originX: 'left',
        originY: 'top',
      });
    }

    canvas.renderAll();
    console.log('Canvas loaded and rendered from JSON');
  }).catch(err => {
    console.error('Error loading canvas from JSON:', err);
  });
}
