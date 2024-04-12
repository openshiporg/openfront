/*
  Warnings:

  - You are about to drop the column `productVariant` on the `ProductOptionValue` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductOptionValue" DROP CONSTRAINT "ProductOptionValue_productVariant_fkey";

-- DropIndex
DROP INDEX "ProductOptionValue_productVariant_idx";

-- AlterTable
ALTER TABLE "ProductOptionValue" DROP COLUMN "productVariant";

-- CreateTable
CREATE TABLE "_ProductOptionValue_productVariants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProductOptionValue_productVariants_AB_unique" ON "_ProductOptionValue_productVariants"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductOptionValue_productVariants_B_index" ON "_ProductOptionValue_productVariants"("B");

-- AddForeignKey
ALTER TABLE "_ProductOptionValue_productVariants" ADD CONSTRAINT "_ProductOptionValue_productVariants_A_fkey" FOREIGN KEY ("A") REFERENCES "ProductOptionValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductOptionValue_productVariants" ADD CONSTRAINT "_ProductOptionValue_productVariants_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
