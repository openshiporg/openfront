-- DropForeignKey
ALTER TABLE "FulfillmentItem" DROP CONSTRAINT "FulfillmentItem_lineItem_fkey";

-- AddForeignKey
ALTER TABLE "FulfillmentItem" ADD CONSTRAINT "FulfillmentItem_lineItem_fkey" FOREIGN KEY ("lineItem") REFERENCES "OrderLineItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
