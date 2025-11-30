-- Migration: Rendre canvasWidth et canvasHeight nullable pour compatibilité avec les anciens designs
-- Mettre à jour les designs existants avec des valeurs null

-- Étape 1: Rendre les colonnes nullable
ALTER TABLE "designs" 
  ALTER COLUMN "canvasWidth" DROP NOT NULL,
  ALTER COLUMN "canvasHeight" DROP NOT NULL;

-- Étape 2: Mettre à jour les designs existants avec des valeurs null
UPDATE "designs" 
SET 
  "canvasWidth" = COALESCE("canvasWidth", 794),
  "canvasHeight" = COALESCE("canvasHeight", 1123)
WHERE "canvasWidth" IS NULL OR "canvasHeight" IS NULL;

