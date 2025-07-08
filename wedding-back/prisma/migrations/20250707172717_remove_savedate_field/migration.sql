/*
  Warnings:

  - You are about to drop the column `celebrationText` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `saveDate` on the `invitations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "celebrationText",
DROP COLUMN "saveDate";
