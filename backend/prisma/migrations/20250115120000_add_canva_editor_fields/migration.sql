-- AlterTable
-- Ajouter les nouveaux champs pour l'éditeur Canva
ALTER TABLE "designs" 
ADD COLUMN "fabricData" JSONB,
ADD COLUMN "textMappings" JSONB,
ADD COLUMN "editorVersion" TEXT,
ADD COLUMN "canvasWidth" INTEGER,
ADD COLUMN "canvasHeight" INTEGER,
ADD COLUMN "canvasFormat" TEXT;

-- Mettre à jour les designs existants avec editorVersion = 'legacy'
UPDATE "designs" SET "editorVersion" = 'legacy' WHERE "editorVersion" IS NULL;

