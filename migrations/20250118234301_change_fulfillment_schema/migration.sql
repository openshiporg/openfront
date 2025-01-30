/*
  Warnings:

  - You are about to drop the column `cancelLabelFunction` on the `ShippingProvider` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `ShippingProvider` table. All the data in the column will be lost.
  - You are about to drop the column `createLabelFunction` on the `ShippingProvider` table. All the data in the column will be lost.
  - You are about to drop the column `credentials` on the `ShippingProvider` table. All the data in the column will be lost.
  - You are about to drop the column `getRatesFunction` on the `ShippingProvider` table. All the data in the column will be lost.
  - You are about to drop the column `isInstalled` on the `ShippingProvider` table. All the data in the column will be lost.
  - You are about to drop the column `trackShipmentFunction` on the `ShippingProvider` table. All the data in the column will be lost.
  - You are about to drop the column `validateAddressFunction` on the `ShippingProvider` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ShippingProvider_code_key";

-- AlterTable
ALTER TABLE "ShippingProvider" DROP COLUMN "cancelLabelFunction",
DROP COLUMN "code",
DROP COLUMN "createLabelFunction",
DROP COLUMN "credentials",
DROP COLUMN "getRatesFunction",
DROP COLUMN "isInstalled",
DROP COLUMN "trackShipmentFunction",
DROP COLUMN "validateAddressFunction",
ADD COLUMN     "accessToken" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;
