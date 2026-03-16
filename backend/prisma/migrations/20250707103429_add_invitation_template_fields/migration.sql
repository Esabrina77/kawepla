/*
  Warnings:

  - You are about to drop the column `theme` on the `invitations` table. All the data in the column will be lost.
  - Added the required column `coupleName` to the `invitations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "theme",
ADD COLUMN     "blessingText" TEXT DEFAULT 'Avec leurs familles',
ADD COLUMN     "celebrationText" TEXT DEFAULT 'Venez célébrer avec nous',
ADD COLUMN     "contact" TEXT,
ADD COLUMN     "coupleName" TEXT NOT NULL,
ADD COLUMN     "details" TEXT,
ADD COLUMN     "dressCode" TEXT DEFAULT 'Tenue de soirée souhaitée',
ADD COLUMN     "invitationText" TEXT DEFAULT 'Vous êtes cordialement invités',
ADD COLUMN     "message" TEXT DEFAULT 'Votre présence sera notre plus beau cadeau',
ADD COLUMN     "moreInfo" TEXT,
ADD COLUMN     "rsvpDate" TIMESTAMP(3),
ADD COLUMN     "rsvpDetails" TEXT DEFAULT 'Merci de confirmer votre présence',
ADD COLUMN     "rsvpForm" TEXT DEFAULT 'RSVP requis',
ADD COLUMN     "saveDate" TEXT DEFAULT 'Réservez la date',
ADD COLUMN     "welcomeMessage" TEXT DEFAULT 'Bienvenue à notre mariage',
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "photos" SET DEFAULT ARRAY[]::JSONB[];
