/*
  Warnings:

  - You are about to drop the column `servicePurchaseId` on the `purchase_history` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "purchase_history" DROP CONSTRAINT "purchase_history_servicePurchaseId_fkey";

-- AlterTable
ALTER TABLE "purchase_history" DROP COLUMN "servicePurchaseId";
