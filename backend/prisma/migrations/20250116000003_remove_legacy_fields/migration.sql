-- Migration: Supprimer les colonnes legacy (template, styles, variables, textMappings, customFonts, version, category, isPremium)
-- Ces colonnes ne sont plus utilisées dans le nouveau système basé sur Fabric.js

-- Étape 1: Supprimer les colonnes obsolètes si elles existent
DO $$ 
BEGIN
  -- Supprimer template
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'designs' AND column_name = 'template') THEN
    ALTER TABLE "designs" DROP COLUMN "template";
  END IF;
  
  -- Supprimer styles
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'designs' AND column_name = 'styles') THEN
    ALTER TABLE "designs" DROP COLUMN "styles";
  END IF;
  
  -- Supprimer variables
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'designs' AND column_name = 'variables') THEN
    ALTER TABLE "designs" DROP COLUMN "variables";
  END IF;
  
  -- Supprimer textMappings
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'designs' AND column_name = 'textMappings') THEN
    ALTER TABLE "designs" DROP COLUMN "textMappings";
  END IF;
  
  -- Supprimer customFonts
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'designs' AND column_name = 'customFonts') THEN
    ALTER TABLE "designs" DROP COLUMN "customFonts";
  END IF;
  
  -- Supprimer version
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'designs' AND column_name = 'version') THEN
    ALTER TABLE "designs" DROP COLUMN "version";
  END IF;
  
  -- Supprimer category
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'designs' AND column_name = 'category') THEN
    ALTER TABLE "designs" DROP COLUMN "category";
  END IF;
  
  -- Supprimer isPremium
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'designs' AND column_name = 'isPremium') THEN
    ALTER TABLE "designs" DROP COLUMN "isPremium";
  END IF;
END $$;

