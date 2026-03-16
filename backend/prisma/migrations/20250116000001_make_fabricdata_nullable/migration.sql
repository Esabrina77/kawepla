-- Migration: Rendre fabricData nullable pour compatibilité avec les anciens designs
-- Mettre à jour les designs existants sans fabricData

-- Étape 1: Rendre fabricData nullable
ALTER TABLE "designs" 
  ALTER COLUMN "fabricData" DROP NOT NULL;

-- Étape 2: Mettre à jour les designs existants sans fabricData
-- Pour les designs legacy (avec template/styles/variables), créer un fabricData vide
UPDATE "designs" 
SET "fabricData" = '{}'::jsonb
WHERE "fabricData" IS NULL;

-- Étape 3: S'assurer que editorVersion est défini
UPDATE "designs"
SET "editorVersion" = COALESCE("editorVersion", 
  CASE 
    WHEN "template" IS NOT NULL THEN 'legacy'
    ELSE 'canva'
  END
)
WHERE "editorVersion" IS NULL;

