/*
  Warnings:

  - You are about to drop the column `fulfilledQuantity` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `returnedQuantity` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `shippedQuantity` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `fulfillmentStatus` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LineItem" DROP COLUMN "fulfilledQuantity",
DROP COLUMN "returnedQuantity",
DROP COLUMN "shippedQuantity";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "fulfillmentStatus";

-- DropEnum
DROP TYPE "OrderFulfillmentStatusType";
