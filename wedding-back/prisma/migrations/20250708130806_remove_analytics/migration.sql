/*
  Warnings:

  - You are about to drop the `analytics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "analytics" DROP CONSTRAINT "analytics_invitationId_fkey";

-- DropForeignKey
ALTER TABLE "analytics" DROP CONSTRAINT "analytics_userId_fkey";

-- DropTable
DROP TABLE "analytics";
