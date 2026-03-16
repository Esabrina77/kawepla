-- AlterTable
ALTER TABLE "purchase_history" ADD COLUMN     "servicePurchaseId" TEXT;

-- AddForeignKey
ALTER TABLE "purchase_history" ADD CONSTRAINT "purchase_history_servicePurchaseId_fkey" FOREIGN KEY ("servicePurchaseId") REFERENCES "service_purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
