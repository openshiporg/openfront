-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "billingAddress" TEXT,
ADD COLUMN     "shippingAddress" TEXT;

-- CreateIndex
CREATE INDEX "Cart_billingAddress_idx" ON "Cart"("billingAddress");

-- CreateIndex
CREATE INDEX "Cart_shippingAddress_idx" ON "Cart"("shippingAddress");

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_billingAddress_fkey" FOREIGN KEY ("billingAddress") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_shippingAddress_fkey" FOREIGN KEY ("shippingAddress") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
