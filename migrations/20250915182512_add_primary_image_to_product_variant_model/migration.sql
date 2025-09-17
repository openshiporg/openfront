-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "primaryImage" TEXT;

-- CreateIndex
CREATE INDEX "ProductVariant_primaryImage_idx" ON "ProductVariant"("primaryImage");

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_primaryImage_fkey" FOREIGN KEY ("primaryImage") REFERENCES "ProductImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
