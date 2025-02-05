/*
  Warnings:

  - You are about to drop the column `height` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `hsCode` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `length` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `material` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `midCode` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `originCountry` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `length` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `ProductVariant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "height",
DROP COLUMN "hsCode",
DROP COLUMN "length",
DROP COLUMN "material",
DROP COLUMN "midCode",
DROP COLUMN "originCountry",
DROP COLUMN "weight",
DROP COLUMN "width";

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "height",
DROP COLUMN "length",
DROP COLUMN "weight",
DROP COLUMN "width";

-- CreateTable
CREATE TABLE "Measurement" (
    "id" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'g',
    "type" TEXT NOT NULL DEFAULT 'weight',
    "productVariant" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Measurement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Measurement_productVariant_idx" ON "Measurement"("productVariant");

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_productVariant_fkey" FOREIGN KEY ("productVariant") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
