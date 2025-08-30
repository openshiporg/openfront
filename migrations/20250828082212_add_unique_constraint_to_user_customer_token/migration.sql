/*
  Warnings:

  - A unique constraint covering the columns `[customerToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_customerToken_idx";

-- CreateIndex
CREATE UNIQUE INDEX "User_customerToken_key" ON "User"("customerToken");
