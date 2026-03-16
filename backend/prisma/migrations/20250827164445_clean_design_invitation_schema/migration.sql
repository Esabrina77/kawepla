/*
  Warnings:

  - You are about to drop the column `backgroundImageRequired` on the `designs` table. All the data in the column will be lost.
  - You are about to drop the column `components` on the `designs` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `designs` table. All the data in the column will be lost.
  - You are about to drop the column `previewImages` on the `designs` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `designs` table. All the data in the column will be lost.
  - You are about to drop the column `customDomain` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `maxGuests` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `program` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `restrictions` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `shareableExpiresAt` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `venueCoordinates` on the `invitations` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "designs" DROP CONSTRAINT "designs_createdBy_fkey";

-- DropIndex
DROP INDEX "invitations_customDomain_key";

-- AlterTable
ALTER TABLE "designs" DROP COLUMN "backgroundImageRequired",
DROP COLUMN "components",
DROP COLUMN "createdBy",
DROP COLUMN "previewImages",
DROP COLUMN "price";

-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "customDomain",
DROP COLUMN "maxGuests",
DROP COLUMN "program",
DROP COLUMN "restrictions",
DROP COLUMN "shareableExpiresAt",
DROP COLUMN "title",
DROP COLUMN "venueCoordinates";
