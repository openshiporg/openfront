/*
  Warnings:

  - You are about to drop the column `status` on the `PaymentCollection` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `PaymentSession` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `ShippingProvider` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PaymentCollection" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "PaymentSession" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "ShippingProvider" ADD COLUMN     "cancelLabelFunction" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "code" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "createLabelFunction" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "getRatesFunction" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "trackShipmentFunction" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "validateAddressFunction" TEXT NOT NULL DEFAULT '';

-- DropEnum
DROP TYPE "PaymentCollectionStatusType";

-- DropEnum
DROP TYPE "PaymentSessionStatusType";

-- CreateIndex
CREATE UNIQUE INDEX "ShippingProvider_code_key" ON "ShippingProvider"("code");
