/*
  Warnings:

  - A unique constraint covering the columns `[uniqueKey]` on the table `ShippingOption` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ShippingOption" ADD COLUMN     "uniqueKey" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "ShippingOption_uniqueKey_key" ON "ShippingOption"("uniqueKey");
