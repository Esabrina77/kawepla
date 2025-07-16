/*
  Warnings:

  - A unique constraint covering the columns `[shareableToken]` on the table `invitations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "InvitationType" AS ENUM ('PERSONAL', 'SHAREABLE');

-- AlterTable
ALTER TABLE "guests" ADD COLUMN     "invitationType" "InvitationType" NOT NULL DEFAULT 'PERSONAL',
ADD COLUMN     "sharedLinkUsed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "invitations" ADD COLUMN     "shareableEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shareableExpiresAt" TIMESTAMP(3),
ADD COLUMN     "shareableMaxUses" INTEGER DEFAULT 50,
ADD COLUMN     "shareableToken" TEXT,
ADD COLUMN     "shareableUsedCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "invitations_shareableToken_key" ON "invitations"("shareableToken");
