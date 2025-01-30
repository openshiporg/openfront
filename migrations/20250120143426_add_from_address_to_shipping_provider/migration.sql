-- AlterTable
ALTER TABLE "ShippingProvider" ADD COLUMN     "fromAddress" TEXT;

-- CreateIndex
CREATE INDEX "ShippingProvider_fromAddress_idx" ON "ShippingProvider"("fromAddress");

-- AddForeignKey
ALTER TABLE "ShippingProvider" ADD CONSTRAINT "ShippingProvider_fromAddress_fkey" FOREIGN KEY ("fromAddress") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
