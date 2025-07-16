/*
  Warnings:

  - The values [IMAGE,FILE] on the enum `MessageType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `PasswordReset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Photo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PhotoAlbum` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[guestId]` on the table `shareable_links` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ShareableLinkStatus" AS ENUM ('SHARED', 'USED');

-- CreateEnum
CREATE TYPE "PhotoStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PUBLIC');

-- AlterEnum
BEGIN;
CREATE TYPE "MessageType_new" AS ENUM ('TEXT', 'RSVP_NOTIFICATION', 'SYSTEM');
ALTER TABLE "messages" ALTER COLUMN "messageType" DROP DEFAULT;
ALTER TABLE "messages" ALTER COLUMN "messageType" TYPE "MessageType_new" USING ("messageType"::text::"MessageType_new");
ALTER TYPE "MessageType" RENAME TO "MessageType_old";
ALTER TYPE "MessageType_new" RENAME TO "MessageType";
DROP TYPE "MessageType_old";
ALTER TABLE "messages" ALTER COLUMN "messageType" SET DEFAULT 'TEXT';
COMMIT;

-- DropForeignKey
ALTER TABLE "PasswordReset" DROP CONSTRAINT "PasswordReset_userId_fkey";

-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_albumId_fkey";

-- DropForeignKey
ALTER TABLE "PhotoAlbum" DROP CONSTRAINT "PhotoAlbum_invitationId_fkey";

-- AlterTable
ALTER TABLE "shareable_links" ADD COLUMN     "guestId" TEXT,
ADD COLUMN     "status" "ShareableLinkStatus" NOT NULL DEFAULT 'SHARED';

-- DropTable
DROP TABLE "PasswordReset";

-- DropTable
DROP TABLE "Photo";

-- DropTable
DROP TABLE "PhotoAlbum";

-- CreateTable
CREATE TABLE "password_resets" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo_albums" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "coverPhotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "invitationId" TEXT NOT NULL,

    CONSTRAINT "photo_albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "compressedUrl" TEXT,
    "thumbnailUrl" TEXT,
    "filename" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "mimeType" TEXT NOT NULL,
    "status" "PhotoStatus" NOT NULL DEFAULT 'PENDING',
    "caption" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "albumId" TEXT NOT NULL,
    "uploadedById" TEXT,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_resets_token_key" ON "password_resets"("token");

-- CreateIndex
CREATE UNIQUE INDEX "shareable_links_guestId_key" ON "shareable_links"("guestId");

-- AddForeignKey
ALTER TABLE "shareable_links" ADD CONSTRAINT "shareable_links_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_albums" ADD CONSTRAINT "photo_albums_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "photo_albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
