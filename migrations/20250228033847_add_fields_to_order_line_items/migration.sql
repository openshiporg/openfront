-- AlterTable
ALTER TABLE "OrderLineItem" ADD COLUMN     "formattedTotal" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "formattedUnitPrice" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "variantTitle" TEXT NOT NULL DEFAULT '';
