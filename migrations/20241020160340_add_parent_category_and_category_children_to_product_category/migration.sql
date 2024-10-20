-- AlterTable
ALTER TABLE "ProductCategory" ADD COLUMN     "parentCategory" TEXT;

-- CreateIndex
CREATE INDEX "ProductCategory_parentCategory_idx" ON "ProductCategory"("parentCategory");

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_parentCategory_fkey" FOREIGN KEY ("parentCategory") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
