/*
  Warnings:

  - A unique constraint covering the columns `[handle]` on the table `ProductCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_handle_key" ON "ProductCategory"("handle");
