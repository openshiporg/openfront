/*
  Warnings:

  - You are about to drop the column `order` on the `Refund` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentStatusType" AS ENUM ('pending', 'authorized', 'captured', 'failed', 'canceled');

-- DropForeignKey
ALTER TABLE "Refund" DROP CONSTRAINT "Refund_order_fkey";

-- DropIndex
DROP INDEX "Refund_order_idx";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "status" "PaymentStatusType" NOT NULL DEFAULT 'pending',
ADD COLUMN     "user" TEXT;

-- AlterTable
ALTER TABLE "Refund" DROP COLUMN "order",
ADD COLUMN     "payment" TEXT;

-- CreateTable
CREATE TABLE "Capture" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "payment" TEXT,
    "metadata" JSONB,
    "createdBy" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Capture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Capture_payment_idx" ON "Capture"("payment");

-- CreateIndex
CREATE INDEX "Payment_user_idx" ON "Payment"("user");

-- CreateIndex
CREATE INDEX "Refund_payment_idx" ON "Refund"("payment");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Capture" ADD CONSTRAINT "Capture_payment_fkey" FOREIGN KEY ("payment") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_payment_fkey" FOREIGN KEY ("payment") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
