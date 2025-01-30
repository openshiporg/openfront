-- CreateEnum
CREATE TYPE "ShippingLabelStatusType" AS ENUM ('created', 'purchased', 'failed');

-- AlterTable
ALTER TABLE "FulfillmentProvider" ADD COLUMN     "credentials" JSONB,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "name" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "PaymentProvider" ADD COLUMN     "capturePaymentFunction" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "createPaymentFunction" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "credentials" JSONB DEFAULT '{}',
ADD COLUMN     "generatePaymentLinkFunction" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "getPaymentStatusFunction" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "refundPaymentFunction" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "ShippingProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "code" TEXT NOT NULL DEFAULT '',
    "isInstalled" BOOLEAN NOT NULL DEFAULT false,
    "credentials" JSONB,
    "metadata" JSONB,
    "createLabelFunction" TEXT NOT NULL DEFAULT 'createLabel',
    "getRatesFunction" TEXT NOT NULL DEFAULT 'getRates',
    "validateAddressFunction" TEXT NOT NULL DEFAULT 'validateAddress',
    "trackShipmentFunction" TEXT NOT NULL DEFAULT 'trackShipment',
    "cancelLabelFunction" TEXT NOT NULL DEFAULT 'cancelLabel',
    "fulfillmentProvider" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShippingProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingLabel" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ShippingLabelStatusType" NOT NULL DEFAULT 'created',
    "trackingNumber" TEXT NOT NULL DEFAULT '',
    "trackingUrl" TEXT NOT NULL DEFAULT '',
    "labelUrl" TEXT NOT NULL DEFAULT '',
    "rate" JSONB,
    "data" JSONB,
    "metadata" JSONB,
    "provider" TEXT,
    "order" TEXT,
    "fulfillment" TEXT,

    CONSTRAINT "ShippingLabel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Region_shippingProviders" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ShippingProvider_code_key" ON "ShippingProvider"("code");

-- CreateIndex
CREATE INDEX "ShippingProvider_fulfillmentProvider_idx" ON "ShippingProvider"("fulfillmentProvider");

-- CreateIndex
CREATE INDEX "ShippingLabel_provider_idx" ON "ShippingLabel"("provider");

-- CreateIndex
CREATE INDEX "ShippingLabel_order_idx" ON "ShippingLabel"("order");

-- CreateIndex
CREATE INDEX "ShippingLabel_fulfillment_idx" ON "ShippingLabel"("fulfillment");

-- CreateIndex
CREATE UNIQUE INDEX "_Region_shippingProviders_AB_unique" ON "_Region_shippingProviders"("A", "B");

-- CreateIndex
CREATE INDEX "_Region_shippingProviders_B_index" ON "_Region_shippingProviders"("B");

-- AddForeignKey
ALTER TABLE "ShippingProvider" ADD CONSTRAINT "ShippingProvider_fulfillmentProvider_fkey" FOREIGN KEY ("fulfillmentProvider") REFERENCES "FulfillmentProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingLabel" ADD CONSTRAINT "ShippingLabel_provider_fkey" FOREIGN KEY ("provider") REFERENCES "ShippingProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingLabel" ADD CONSTRAINT "ShippingLabel_order_fkey" FOREIGN KEY ("order") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingLabel" ADD CONSTRAINT "ShippingLabel_fulfillment_fkey" FOREIGN KEY ("fulfillment") REFERENCES "Fulfillment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Region_shippingProviders" ADD CONSTRAINT "_Region_shippingProviders_A_fkey" FOREIGN KEY ("A") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Region_shippingProviders" ADD CONSTRAINT "_Region_shippingProviders_B_fkey" FOREIGN KEY ("B") REFERENCES "ShippingProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
