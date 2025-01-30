-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderEventTypeType" ADD VALUE 'ORDER_PLACED';
ALTER TYPE "OrderEventTypeType" ADD VALUE 'PAYMENT_CAPTURED';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "note" TEXT NOT NULL DEFAULT '';
