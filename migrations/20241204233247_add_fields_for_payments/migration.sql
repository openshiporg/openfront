/*
  Warnings:

  - Added the required column `amount` to the `PaymentSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentProvider" ADD COLUMN     "metadata" JSONB DEFAULT '{}',
ADD COLUMN     "name" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "PaymentSession" ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "isInitiated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentAuthorizedAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'pending',
ALTER COLUMN "data" SET DEFAULT '{}';

-- CreateIndex
CREATE INDEX "PaymentSession_idempotencyKey_idx" ON "PaymentSession"("idempotencyKey");
