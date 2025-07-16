-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'EXPIRED', 'PAST_DUE');

-- Créer le nouvel enum
CREATE TYPE "SubscriptionTier_new" AS ENUM ('FREE', 'ESSENTIAL', 'ELEGANT', 'PREMIUM', 'LUXE');

-- Convertir les anciennes valeurs
ALTER TABLE "users" ALTER COLUMN "subscriptionTier" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "subscriptionTier" TYPE TEXT;
UPDATE "users" SET "subscriptionTier" = 'FREE' WHERE "subscriptionTier" = 'BASIC';
UPDATE "users" SET "subscriptionTier" = 'ESSENTIAL' WHERE "subscriptionTier" = 'STANDARD';

-- Supprimer l'ancien enum et renommer le nouveau
DROP TYPE IF EXISTS "SubscriptionTier" CASCADE;
ALTER TYPE "SubscriptionTier_new" RENAME TO "SubscriptionTier";

-- Convertir la colonne vers le nouvel enum
ALTER TABLE "users" ALTER COLUMN "subscriptionTier" TYPE "SubscriptionTier" USING "subscriptionTier"::"SubscriptionTier";
ALTER TABLE "users" ALTER COLUMN "subscriptionTier" SET DEFAULT 'FREE';

-- Ajouter les nouvelles colonnes à la table users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT,
ADD COLUMN IF NOT EXISTS "stripePriceId" TEXT,
ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT,
ADD COLUMN IF NOT EXISTS "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_additional_services" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_additional_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "stripeCustomerId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- AddForeignKey
ALTER TABLE "user_additional_services" ADD CONSTRAINT "user_additional_services_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
