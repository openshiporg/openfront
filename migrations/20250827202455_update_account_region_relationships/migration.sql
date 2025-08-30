/*
  Warnings:

  - You are about to drop the column `isOpenship` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "isOpenship",
ADD COLUMN     "accountType" TEXT NOT NULL DEFAULT 'business';

-- AlterTable
ALTER TABLE "AccountLineItem" ADD COLUMN     "region" TEXT;

-- CreateIndex
CREATE INDEX "AccountLineItem_region_idx" ON "AccountLineItem"("region");

-- AddForeignKey
ALTER TABLE "AccountLineItem" ADD CONSTRAINT "AccountLineItem_region_fkey" FOREIGN KEY ("region") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;
