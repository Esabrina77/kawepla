/*
  Warnings:

  - A unique constraint covering the columns `[invitationId,email]` on the table `guests` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "guests_invitationId_email_key" ON "guests"("invitationId", "email");
