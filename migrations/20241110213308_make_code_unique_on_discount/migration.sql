/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Discount` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Discount_code_key" ON "Discount"("code");
