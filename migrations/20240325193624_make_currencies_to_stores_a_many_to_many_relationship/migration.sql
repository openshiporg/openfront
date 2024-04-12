/*
  Warnings:

  - You are about to drop the column `currency` on the `Store` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Store" DROP CONSTRAINT "Store_currency_fkey";

-- DropIndex
DROP INDEX "Store_currency_idx";

-- AlterTable
ALTER TABLE "Store" DROP COLUMN "currency";

-- CreateTable
CREATE TABLE "_Currency_stores" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Currency_stores_AB_unique" ON "_Currency_stores"("A", "B");

-- CreateIndex
CREATE INDEX "_Currency_stores_B_index" ON "_Currency_stores"("B");

-- AddForeignKey
ALTER TABLE "_Currency_stores" ADD CONSTRAINT "_Currency_stores_A_fkey" FOREIGN KEY ("A") REFERENCES "Currency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Currency_stores" ADD CONSTRAINT "_Currency_stores_B_fkey" FOREIGN KEY ("B") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
