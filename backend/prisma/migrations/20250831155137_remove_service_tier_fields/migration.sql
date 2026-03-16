/*
  Warnings:

  - You are about to drop the column `purchaseStatus` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `serviceTier` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "purchaseStatus",
DROP COLUMN "serviceTier",
DROP COLUMN "stripePriceId",
DROP COLUMN "stripeSubscriptionId";
