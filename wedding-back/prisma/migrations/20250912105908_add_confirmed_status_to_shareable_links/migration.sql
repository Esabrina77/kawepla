/*
  Warnings:

  - You are about to drop the column `cancelledAt` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `depositAmount` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `depositPaid` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `fullPaymentPaid` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `specialRequests` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `stripeRefundId` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `provider_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `provider_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `provider_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `provider_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `rejectionReason` on the `provider_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `provider_profiles` table. All the data in the column will be lost.
  - Added the required column `eventType` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ourCommission` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerAmount` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Made the column `clientPhone` on table `bookings` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `displayCity` to the `provider_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `provider_profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `provider_profiles` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `provider_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `verifiedAt` on table `provider_profiles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "ShareableLinkStatus" ADD VALUE 'CONFIRMED';

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "cancelledAt",
DROP COLUMN "depositAmount",
DROP COLUMN "depositPaid",
DROP COLUMN "duration",
DROP COLUMN "endTime",
DROP COLUMN "fullPaymentPaid",
DROP COLUMN "specialRequests",
DROP COLUMN "startTime",
DROP COLUMN "stripeRefundId",
ADD COLUMN     "eventTime" TEXT,
ADD COLUMN     "eventType" "EventType" NOT NULL,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "ourCommission" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "providerAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "stripeTransferId" TEXT,
ALTER COLUMN "clientPhone" SET NOT NULL;

-- AlterTable
ALTER TABLE "provider_profiles" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "postalCode",
DROP COLUMN "rejectionReason",
DROP COLUMN "website",
ADD COLUMN     "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
ADD COLUMN     "displayCity" TEXT NOT NULL,
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "serviceRadius" INTEGER NOT NULL DEFAULT 25,
ADD COLUMN     "stripeAccountId" TEXT,
ADD COLUMN     "stripeOnboarded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'APPROVED',
ALTER COLUMN "verifiedAt" SET NOT NULL,
ALTER COLUMN "verifiedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "eventTypes" "EventType"[];
