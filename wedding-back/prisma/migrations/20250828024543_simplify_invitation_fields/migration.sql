/*
  Warnings:

  - You are about to drop the column `message` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `rsvpDetails` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `rsvpForm` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `welcomeMessage` on the `invitations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "message",
DROP COLUMN "rsvpDetails",
DROP COLUMN "rsvpForm",
DROP COLUMN "welcomeMessage";
