/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `GiftCard` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_code_key" ON "GiftCard"("code");
