/*
  Warnings:

  - You are about to drop the column `cart` on the `PaymentSession` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paymentCollection]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentCollectionStatusType" AS ENUM ('not_paid', 'pending', 'partially_paid', 'paid', 'canceled');

-- CreateEnum
CREATE TYPE "PaymentCollectionDescriptionType" AS ENUM ('default', 'refund');

-- AlterEnum
ALTER TYPE "PaymentSessionStatusType" ADD VALUE 'processing';

-- DropForeignKey
ALTER TABLE "PaymentSession" DROP CONSTRAINT "PaymentSession_cart_fkey";

-- DropIndex
DROP INDEX "PaymentSession_cart_idx";

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "paymentCollection" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "paymentCollection" TEXT;

-- AlterTable
ALTER TABLE "PaymentSession" DROP COLUMN "cart",
ADD COLUMN     "paymentCollection" TEXT;

-- CreateTable
CREATE TABLE "PaymentCollection" (
    "id" TEXT NOT NULL,
    "status" "PaymentCollectionStatusType" NOT NULL DEFAULT 'not_paid',
    "description" "PaymentCollectionDescriptionType" DEFAULT 'default',
    "amount" INTEGER NOT NULL,
    "authorizedAmount" INTEGER DEFAULT 0,
    "refundedAmount" INTEGER DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentCollection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cart_paymentCollection_key" ON "Cart"("paymentCollection");

-- CreateIndex
CREATE INDEX "Payment_paymentCollection_idx" ON "Payment"("paymentCollection");

-- CreateIndex
CREATE INDEX "PaymentSession_paymentCollection_idx" ON "PaymentSession"("paymentCollection");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentCollection_fkey" FOREIGN KEY ("paymentCollection") REFERENCES "PaymentCollection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_paymentCollection_fkey" FOREIGN KEY ("paymentCollection") REFERENCES "PaymentCollection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSession" ADD CONSTRAINT "PaymentSession_paymentCollection_fkey" FOREIGN KEY ("paymentCollection") REFERENCES "PaymentCollection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
