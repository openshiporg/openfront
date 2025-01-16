/*
  Warnings:

  - You are about to drop the column `trackingNumbers` on the `Fulfillment` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "OrderEventTypeType" AS ENUM ('STATUS_CHANGE', 'PAYMENT_STATUS_CHANGE', 'FULFILLMENT_STATUS_CHANGE', 'NOTE_ADDED', 'EMAIL_SENT', 'TRACKING_NUMBER_ADDED', 'RETURN_REQUESTED', 'REFUND_PROCESSED');

-- AlterTable
ALTER TABLE "Fulfillment" DROP COLUMN "trackingNumbers";

-- CreateTable
CREATE TABLE "OrderEvent" (
    "id" TEXT NOT NULL,
    "order" TEXT,
    "user" TEXT,
    "type" "OrderEventTypeType" NOT NULL DEFAULT 'STATUS_CHANGE',
    "data" JSONB DEFAULT '{}',
    "time" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderEvent_order_idx" ON "OrderEvent"("order");

-- CreateIndex
CREATE INDEX "OrderEvent_user_idx" ON "OrderEvent"("user");

-- CreateIndex
CREATE INDEX "OrderEvent_createdBy_idx" ON "OrderEvent"("createdBy");

-- AddForeignKey
ALTER TABLE "OrderEvent" ADD CONSTRAINT "OrderEvent_order_fkey" FOREIGN KEY ("order") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEvent" ADD CONSTRAINT "OrderEvent_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEvent" ADD CONSTRAINT "OrderEvent_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
