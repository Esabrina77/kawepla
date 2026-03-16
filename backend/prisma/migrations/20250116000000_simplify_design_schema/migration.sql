-- Migration: Simplification du schéma Design et ajout de la relation User
-- Suppression des champs obsolètes (template, styles, variables, etc.)
-- Ajout des champs pour la personnalisation (userId, isTemplate, originalDesignId)
-- Ajout des champs pour Invitation (customDesignId)

-- Étape 1: Ajouter les nouveaux champs à la table designs
ALTER TABLE "designs" 
  ADD COLUMN IF NOT EXISTS "userId" TEXT,
  ADD COLUMN IF NOT EXISTS "isTemplate" BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS "originalDesignId" TEXT,
  ADD COLUMN IF NOT EXISTS "thumbnail" TEXT,
  ADD COLUMN IF NOT EXISTS "previewImage" TEXT;

-- Étape 2: Rendre fabricData obligatoire (supprimer les anciens designs sans fabricData si nécessaire)
-- Note: On garde fabricData nullable temporairement pour la migration, mais on le rendra obligatoire après
UPDATE "designs" SET "fabricData" = '{}' WHERE "fabricData" IS NULL;

-- Étape 3: Mettre à jour les valeurs par défaut
UPDATE "designs" SET 
  "isTemplate" = true,
  "canvasWidth" = COALESCE("canvasWidth", 794),
  "canvasHeight" = COALESCE("canvasHeight", 1123),
  "canvasFormat" = COALESCE("canvasFormat", 'A4'),
  "editorVersion" = COALESCE("editorVersion", 'canva')
WHERE "isTemplate" IS NULL;

-- Étape 4: Ajouter les contraintes de clé étrangère (si elles n'existent pas déjà)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'designs_userId_fkey'
  ) THEN
    ALTER TABLE "designs"
      ADD CONSTRAINT "designs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'designs_originalDesignId_fkey'
  ) THEN
    ALTER TABLE "designs"
      ADD CONSTRAINT "designs_originalDesignId_fkey" FOREIGN KEY ("originalDesignId") REFERENCES "designs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Étape 5: Ajouter les nouveaux champs à la table invitations
ALTER TABLE "invitations"
  ADD COLUMN IF NOT EXISTS "customDesignId" TEXT,
  ADD COLUMN IF NOT EXISTS "customFabricData" JSONB,
  ADD COLUMN IF NOT EXISTS "customCanvasWidth" INTEGER,
  ADD COLUMN IF NOT EXISTS "customCanvasHeight" INTEGER;

-- Étape 6: Ajouter la contrainte de clé étrangère pour customDesignId (si elle n'existe pas déjà)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invitations_customDesignId_fkey'
  ) THEN
    ALTER TABLE "invitations"
      ADD CONSTRAINT "invitations_customDesignId_fkey" FOREIGN KEY ("customDesignId") REFERENCES "designs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Étape 7: Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS "designs_userId_idx" ON "designs"("userId");
CREATE INDEX IF NOT EXISTS "designs_isTemplate_idx" ON "designs"("isTemplate");
CREATE INDEX IF NOT EXISTS "designs_originalDesignId_idx" ON "designs"("originalDesignId");
CREATE INDEX IF NOT EXISTS "invitations_customDesignId_idx" ON "invitations"("customDesignId");

-- Note: Les colonnes category, template, styles, variables, textMappings, customFonts, version
-- seront supprimées dans une migration ultérieure après vérification que tout fonctionne

