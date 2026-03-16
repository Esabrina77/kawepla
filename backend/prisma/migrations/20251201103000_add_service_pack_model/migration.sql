-- CreateEnum (si n'existe pas déjà)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ServicePackType') THEN
    CREATE TYPE "ServicePackType" AS ENUM ('BASE', 'ADDON');
  END IF;
END $$;

-- CreateTable
CREATE TABLE "service_packs" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ServicePackType" NOT NULL,
    "tier" "ServiceTier",
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "features" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "invitations" INTEGER,
    "guests" INTEGER,
    "photos" INTEGER,
    "designs" INTEGER,
    "aiRequests" INTEGER,
    "quantity" INTEGER,
    "unit" TEXT,
    "isHighlighted" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_packs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_packs_slug_key" ON "service_packs"("slug");

-- AlterTable
ALTER TABLE "service_purchases"
    ALTER COLUMN "tier" DROP NOT NULL,
    ADD COLUMN     "servicePackId" TEXT;

-- AlterTable
ALTER TABLE "purchase_history"
    ALTER COLUMN "tier" DROP NOT NULL,
    ADD COLUMN     "servicePackId" TEXT;

-- AlterTable
ALTER TABLE "user_additional_services"
    ADD COLUMN     "servicePackId" TEXT;

-- AddForeignKey
ALTER TABLE "service_purchases" ADD CONSTRAINT "service_purchases_servicePackId_fkey" FOREIGN KEY ("servicePackId") REFERENCES "service_packs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_history" ADD CONSTRAINT "purchase_history_servicePackId_fkey" FOREIGN KEY ("servicePackId") REFERENCES "service_packs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_additional_services" ADD CONSTRAINT "user_additional_services_servicePackId_fkey" FOREIGN KEY ("servicePackId") REFERENCES "service_packs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed base service packs
INSERT INTO "service_packs" ("id", "slug", "name", "description", "type", "tier", "price", "currency", "features", "invitations", "guests", "photos", "designs", "aiRequests", "isHighlighted", "sortOrder")
VALUES
  ('pack_decouverte', 'decouverte', 'Découverte', 'Parfait pour tester', 'BASE', 'FREE', 0, 'EUR',
    ARRAY['1 invitation personnalisable', 'Jusqu''à 25 invités', 'Album 20 photos', '3 requêtes IA']::TEXT[], 1, 25, 20, 1, 3, false, 0),
  ('pack_essentiel', 'essentiel', 'Essentiel', 'Pour les petits mariages', 'BASE', 'ESSENTIAL', 25, 'EUR',
    ARRAY['2 invitations personnalisables', 'Jusqu''à 60 invités', 'Album 50 photos', '15 requêtes IA']::TEXT[], 2, 60, 50, 5, 15, false, 1),
  ('pack_elegant', 'elegant', 'Élégant', 'Le plus populaire', 'BASE', 'ELEGANT', 49, 'EUR',
    ARRAY['3 invitations personnalisables', 'Jusqu''à 120 invités', 'Album 150 photos', '40 requêtes IA']::TEXT[], 3, 120, 150, 10, 40, true, 2),
  ('pack_luxe', 'luxe', 'Luxe', 'L''expérience complète', 'BASE', 'LUXE', 99, 'EUR',
    ARRAY['5 invitations personnalisables', 'Jusqu''à 250 invités', 'Album 500 photos', '100 requêtes IA']::TEXT[], 5, 250, 500, 20, 100, false, 3);

-- Seed add-on packs
INSERT INTO "service_packs" ("id", "slug", "name", "description", "type", "price", "currency", "quantity", "unit", "features", "sortOrder")
VALUES
  ('addon_guests_25', 'addon-guests-25', 'Pack 25 invités', 'Ajoutez 25 invités supplémentaires', 'ADDON', 10, 'EUR', 25, 'GUEST', ARRAY['+25 invités']::TEXT[], 10),
  ('addon_guests_50', 'addon-guests-50', 'Pack 50 invités', 'Ajoutez 50 invités supplémentaires', 'ADDON', 20, 'EUR', 50, 'GUEST', ARRAY['+50 invités']::TEXT[], 11),
  ('addon_photos_50', 'addon-photos-50', 'Pack 50 photos', 'Ajoutez 50 photos supplémentaires', 'ADDON', 12, 'EUR', 50, 'PHOTO', ARRAY['+50 photos']::TEXT[], 12),
  ('addon_photos_100', 'addon-photos-100', 'Pack 100 photos', 'Ajoutez 100 photos supplémentaires', 'ADDON', 20, 'EUR', 100, 'PHOTO', ARRAY['+100 photos']::TEXT[], 13),
  ('addon_ai_10', 'addon-ia-10', 'Pack 10 requêtes IA', 'Ajoutez 10 requêtes IA supplémentaires', 'ADDON', 4, 'EUR', 10, 'AI_REQUEST', ARRAY['+10 requêtes IA']::TEXT[], 14),
  ('addon_ai_25', 'addon-ia-25', 'Pack 25 requêtes IA', 'Ajoutez 25 requêtes IA supplémentaires', 'ADDON', 8, 'EUR', 25, 'AI_REQUEST', ARRAY['+25 requêtes IA']::TEXT[], 15),
  ('addon_ai_50', 'addon-ia-50', 'Pack 50 requêtes IA', 'Ajoutez 50 requêtes IA supplémentaires', 'ADDON', 15, 'EUR', 50, 'AI_REQUEST', ARRAY['+50 requêtes IA']::TEXT[], 16),
  ('addon_design_premium', 'addon-design-premium', 'Design premium supplémentaire', 'Débloquez un design exclusif', 'ADDON', 15, 'EUR', 1, 'DESIGN', ARRAY['+1 design premium']::TEXT[], 17);

