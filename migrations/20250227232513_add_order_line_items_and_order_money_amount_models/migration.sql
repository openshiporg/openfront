/*
  Warnings:

  - You are about to drop the column `order` on the `LineItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "LineItem" DROP CONSTRAINT "LineItem_order_fkey";

-- DropIndex
DROP INDEX "LineItem_order_idx";

-- AlterTable
ALTER TABLE "LineItem" DROP COLUMN "order";

-- CreateTable
CREATE TABLE "OrderLineItem" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "sku" TEXT NOT NULL DEFAULT '',
    "thumbnail" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB,
    "productData" JSONB,
    "variantData" JSONB,
    "order" TEXT,
    "productVariant" TEXT,
    "moneyAmount" TEXT,
    "originalLineItem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderMoneyAmount" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "originalAmount" INTEGER NOT NULL,
    "priceData" JSONB,
    "metadata" JSONB,
    "currency" TEXT,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderMoneyAmount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderLineItem_moneyAmount_key" ON "OrderLineItem"("moneyAmount");

-- CreateIndex
CREATE INDEX "OrderLineItem_order_idx" ON "OrderLineItem"("order");

-- CreateIndex
CREATE INDEX "OrderLineItem_productVariant_idx" ON "OrderLineItem"("productVariant");

-- CreateIndex
CREATE INDEX "OrderLineItem_originalLineItem_idx" ON "OrderLineItem"("originalLineItem");

-- CreateIndex
CREATE INDEX "OrderMoneyAmount_currency_idx" ON "OrderMoneyAmount"("currency");

-- CreateIndex
CREATE INDEX "OrderMoneyAmount_region_idx" ON "OrderMoneyAmount"("region");

-- AddForeignKey
ALTER TABLE "OrderLineItem" ADD CONSTRAINT "OrderLineItem_order_fkey" FOREIGN KEY ("order") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLineItem" ADD CONSTRAINT "OrderLineItem_productVariant_fkey" FOREIGN KEY ("productVariant") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLineItem" ADD CONSTRAINT "OrderLineItem_moneyAmount_fkey" FOREIGN KEY ("moneyAmount") REFERENCES "OrderMoneyAmount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLineItem" ADD CONSTRAINT "OrderLineItem_originalLineItem_fkey" FOREIGN KEY ("originalLineItem") REFERENCES "LineItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderMoneyAmount" ADD CONSTRAINT "OrderMoneyAmount_currency_fkey" FOREIGN KEY ("currency") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderMoneyAmount" ADD CONSTRAINT "OrderMoneyAmount_region_fkey" FOREIGN KEY ("region") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;
