/*
  Warnings:

  - You are about to drop the column `availability` on the `provider_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `certifications` on the `provider_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `dailyRate` on the `provider_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `hourlyRate` on the `provider_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `insurance` on the `provider_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `packageRates` on the `provider_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `professionalId` on the `provider_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `videos` on the `provider_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `workingHours` on the `provider_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `yearsExperience` on the `provider_profiles` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `provider_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "provider_profiles" DROP COLUMN "availability",
DROP COLUMN "certifications",
DROP COLUMN "dailyRate",
DROP COLUMN "hourlyRate",
DROP COLUMN "insurance",
DROP COLUMN "packageRates",
DROP COLUMN "professionalId",
DROP COLUMN "videos",
DROP COLUMN "workingHours",
DROP COLUMN "yearsExperience",
ADD COLUMN     "categoryId" TEXT NOT NULL,
ALTER COLUMN "postalCode" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "provider_profiles" ADD CONSTRAINT "provider_profiles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
