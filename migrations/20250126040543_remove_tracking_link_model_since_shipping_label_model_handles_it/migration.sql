/*
  Warnings:

  - You are about to drop the `TrackingLink` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TrackingLink" DROP CONSTRAINT "TrackingLink_fulfillment_fkey";

-- AlterTable
ALTER TABLE "ShippingLabel" ADD COLUMN     "carrier" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "service" TEXT NOT NULL DEFAULT '';

-- DropTable
DROP TABLE "TrackingLink";
