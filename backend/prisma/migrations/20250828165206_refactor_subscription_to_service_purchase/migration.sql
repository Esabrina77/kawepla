/*
  Warnings:

  - You are about to drop the column `isPremium` on the `designs` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionEndDate` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionStatus` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionTier` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `subscriptions` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ServiceTier" AS ENUM ('FREE', 'ESSENTIAL', 'ELEGANT', 'PREMIUM', 'LUXE');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'REFUNDED');

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_userId_fkey";

-- AlterTable
ALTER TABLE "designs" DROP COLUMN "isPremium",
ADD COLUMN     "priceType" "ServiceTier" NOT NULL DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "subscriptionEndDate",
DROP COLUMN "subscriptionStatus",
DROP COLUMN "subscriptionTier",
ADD COLUMN     "purchaseStatus" "PurchaseStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "serviceTier" "ServiceTier" NOT NULL DEFAULT 'FREE';

-- DropTable
DROP TABLE "subscriptions";

-- DropEnum
DROP TYPE "SubscriptionStatus";

-- DropEnum
DROP TYPE "SubscriptionTier";

-- CreateTable
CREATE TABLE "service_purchases" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "ServiceTier" NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripePaymentId" TEXT,
    "stripePriceId" TEXT,
    "stripeCustomerId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "ServiceTier" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "stripePaymentId" TEXT,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_purchases_stripePaymentId_key" ON "service_purchases"("stripePaymentId");

-- AddForeignKey
ALTER TABLE "service_purchases" ADD CONSTRAINT "service_purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_history" ADD CONSTRAINT "purchase_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
