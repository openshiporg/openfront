/*
  Warnings:

  - You are about to drop the column `productCollection` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_productCollection_fkey";

-- DropIndex
DROP INDEX "Product_productCollection_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "productCollection";

-- CreateTable
CREATE TABLE "_Product_productCollections" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Product_productCollections_AB_unique" ON "_Product_productCollections"("A", "B");

-- CreateIndex
CREATE INDEX "_Product_productCollections_B_index" ON "_Product_productCollections"("B");

-- AddForeignKey
ALTER TABLE "_Product_productCollections" ADD CONSTRAINT "_Product_productCollections_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Product_productCollections" ADD CONSTRAINT "_Product_productCollections_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
