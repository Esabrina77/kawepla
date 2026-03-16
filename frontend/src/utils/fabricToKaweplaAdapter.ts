

import * as fabric from 'fabric';

export interface FabricToKaweplaResult {
  fabricData: any;
  canvasWidth: number;
  canvasHeight: number;
  canvasFormat: string;
  backgroundImage?: string;
}

/**
 * Sauvegarde le canvas dans le format Kawepla.
 * Les dimensions LOGIQUES (sans zoom) sont extraites et stockées.
 */
export function convertFabricToKawepla(
  canvas: fabric.Canvas,
  backgroundImage?: string
): FabricToKaweplaResult {
  const zoom = canvas.getZoom() || 1;
  const logicalWidth  = Math.round((canvas.width  || 794) / zoom);
  const logicalHeight = Math.round((canvas.height || 1123) / zoom);

  const fabricJson = (canvas as any).toJSON(['width', 'height', 'backgroundColor']);
  fabricJson.width  = logicalWidth;
  fabricJson.height = logicalHeight;

  return {
    fabricData:      fabricJson,
    canvasWidth:     logicalWidth,
    canvasHeight:    logicalHeight,
    canvasFormat:    'A4',
    backgroundImage,
  };
}

export function getCanvasFormat(_width: number, _height: number): string {
  return 'A4';
}

/**
 * Charge un design Kawepla dans un canvas Fabric.js.
 *
 * Résolution des dimensions logiques (dans l'ordre de priorité) :
 *  1. fabricData.width / fabricData.height  (si explicitement stocké)
 *  2. Taille calculée depuis l'image de fond (anciens designs sans dims)
 *  3. canvasWidth / canvasHeight de la DB (fallback)
 *  4. 524 × 742 par défaut
 */
export async function loadKaweplaDesignToFabric(
  design: { fabricData: any; canvasWidth?: number; canvasHeight?: number },
  canvas: fabric.Canvas
): Promise<{ width: number; height: number }> {
  if (!design.fabricData) {
    console.warn('[Kawepla] Pas de fabricData');
    return { width: 524, height: 742 };
  }

  const fabricData =
    typeof design.fabricData === 'string'
      ? JSON.parse(design.fabricData)
      : design.fabricData;

  // 1. Dimensions explicites dans le JSON (nouvelles sauvegardes)
  let logicalWidth  = fabricData.width;
  let logicalHeight = fabricData.height;

  // 2. Inférer depuis le backgroundImage pour les anciens designs
  if (!logicalWidth && fabricData.backgroundImage) {
    const bg = fabricData.backgroundImage;
    const bgW = bg.width  * (bg.scaleX || 1);
    const bgH = bg.height * (bg.scaleY || 1);
    if (bgW > 100 && bgH > 100) {
      logicalWidth  = Math.round(bgW);
      logicalHeight = Math.round(bgH);
      console.log(`[Kawepla] Dims inférées depuis backgroundImage: ${logicalWidth}×${logicalHeight}`);
    }
  }

  // 3. Fallback DB puis défaut 524×742
  logicalWidth  = logicalWidth  || design.canvasWidth  || 524;
  logicalHeight = logicalHeight || design.canvasHeight || 742;

  console.log(`[Kawepla] Loading ${logicalWidth}×${logicalHeight}`);

  // Redimensionner le canvas en respectant le zoom actuel
  const zoom = canvas.getZoom() || 1;
  canvas.setWidth(logicalWidth   * zoom);
  canvas.setHeight(logicalHeight * zoom);

  if (canvas.viewportTransform) {
    canvas.viewportTransform[4] = 0;
    canvas.viewportTransform[5] = 0;
  }

  canvas.renderOnAddRemove = false;
  try {
    await canvas.loadFromJSON(fabricData);
    canvas.renderOnAddRemove = true;
    canvas.requestRenderAll();
    console.log(`[Kawepla] ✅ Design ${logicalWidth}×${logicalHeight} chargé`);
    return { width: logicalWidth, height: logicalHeight };
  } catch (err) {
    canvas.renderOnAddRemove = true;
    console.error('[Kawepla] ❌ Erreur:', err);
    throw err;
  }
}
