/*
  Warnings:

  - A unique constraint covering the columns `[paymentCollection]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "paymentCollection" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_paymentCollection_key" ON "Invoice"("paymentCollection");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_paymentCollection_fkey" FOREIGN KEY ("paymentCollection") REFERENCES "PaymentCollection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
