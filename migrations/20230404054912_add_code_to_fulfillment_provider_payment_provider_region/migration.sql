/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `FulfillmentProvider` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `PaymentProvider` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Region` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FulfillmentProvider" ADD COLUMN     "code" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "PaymentProvider" ADD COLUMN     "code" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Region" ADD COLUMN     "code" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "FulfillmentProvider_code_key" ON "FulfillmentProvider"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentProvider_code_key" ON "PaymentProvider"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Region_code_key" ON "Region"("code");
