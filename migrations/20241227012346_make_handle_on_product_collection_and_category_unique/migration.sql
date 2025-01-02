/*
  Warnings:

  - A unique constraint covering the columns `[handle]` on the table `ProductCollection` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ProductCategory" ALTER COLUMN "isActive" SET DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "ProductCollection_handle_key" ON "ProductCollection"("handle");
