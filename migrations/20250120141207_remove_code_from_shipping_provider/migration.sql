/*
  Warnings:

  - You are about to drop the column `code` on the `ShippingProvider` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ShippingProvider_code_key";

-- AlterTable
ALTER TABLE "ShippingProvider" DROP COLUMN "code";
