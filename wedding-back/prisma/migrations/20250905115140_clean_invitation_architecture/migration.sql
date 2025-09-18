/*
  Warnings:

  - The values [COUPLE] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `blessingText` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `ceremonyTime` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `contact` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `coupleName` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `dressCode` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `invitationText` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `receptionTime` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `rsvpDate` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `venueAddress` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `venueName` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `weddingDate` on the `invitations` table. All the data in the column will be lost.
  - Added the required column `eventDate` to the `invitations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventTitle` to the `invitations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `invitations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('WEDDING', 'BIRTHDAY', 'BAPTISM', 'ANNIVERSARY', 'GRADUATION', 'BABY_SHOWER', 'ENGAGEMENT', 'COMMUNION', 'CONFIRMATION', 'RETIREMENT', 'HOUSEWARMING', 'CORPORATE', 'OTHER');

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'HOST', 'GUEST', 'PROVIDER');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'HOST';
COMMIT;

-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "blessingText",
DROP COLUMN "ceremonyTime",
DROP COLUMN "contact",
DROP COLUMN "coupleName",
DROP COLUMN "dressCode",
DROP COLUMN "invitationText",
DROP COLUMN "receptionTime",
DROP COLUMN "rsvpDate",
DROP COLUMN "venueAddress",
DROP COLUMN "venueName",
DROP COLUMN "weddingDate",
ADD COLUMN     "customText" TEXT,
ADD COLUMN     "eventDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "eventTime" TEXT,
ADD COLUMN     "eventTitle" TEXT NOT NULL,
ADD COLUMN     "eventType" "EventType" NOT NULL DEFAULT 'WEDDING',
ADD COLUMN     "location" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'HOST';
