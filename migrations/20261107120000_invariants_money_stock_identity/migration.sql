-- Invariants the app relied on but the database did not enforce (2026-11-07).

-- 1. One order number per order. displayId used to be seconds-since-epoch, so two checkouts in the
--    same second shared a number. Renumber any duplicates (keep the oldest), then hand out numbers
--    from a sequence that starts above every existing one.
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "displayId" ORDER BY "createdAt", id) AS rn
  FROM "Order"
)
UPDATE "Order" o
SET "displayId" = (SELECT COALESCE(MAX("displayId"), 0) FROM "Order") + r.rn
FROM ranked r
WHERE o.id = r.id AND r.rn > 1;

CREATE SEQUENCE IF NOT EXISTS "Order_displayId_seq";
SELECT setval('"Order_displayId_seq"', GREATEST((SELECT COALESCE(MAX("displayId"), 0) FROM "Order"), 1000));
CREATE UNIQUE INDEX "Order_displayId_key" ON "Order"("displayId");

-- 2. A user has at most one active business account (checkout charges the first match).
CREATE UNIQUE INDEX "Account_one_active_business_per_user"
  ON "Account"("user") WHERE "status" = 'active' AND "accountType" = 'business' AND "user" IS NOT NULL;

-- 3. Money and stock bounds. Every writer already intends these; the database now refuses a writer
--    that forgets (a raw admin edit, a future mutation, a botched replay). NOT VALID: enforced on every
--    new insert and update, without failing the deploy on a row a demo visitor saved meanwhile.
ALTER TABLE "GiftCard" ADD CONSTRAINT "GiftCard_balance_bounds" CHECK ("value" > 0 AND "balance" >= 0 AND "balance" <= "value") NOT VALID;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_refund_bounds" CHECK ("amount" >= 0 AND "amountRefunded" >= 0 AND "amountRefunded" <= "amount") NOT VALID;
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_amount_positive" CHECK ("amount" > 0) NOT VALID;
ALTER TABLE "GiftCardTransaction" ADD CONSTRAINT "GiftCardTransaction_amount_positive" CHECK ("amount" > 0) NOT VALID;
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_quantity_positive" CHECK ("quantity" > 0) NOT VALID;
ALTER TABLE "OrderLineItem" ADD CONSTRAINT "OrderLineItem_quantity_positive" CHECK ("quantity" > 0) NOT VALID;
ALTER TABLE "FulfillmentItem" ADD CONSTRAINT "FulfillmentItem_quantity_positive" CHECK ("quantity" > 0) NOT VALID;
ALTER TABLE "Discount" ADD CONSTRAINT "Discount_usage_bounds" CHECK ("usageCount" >= 0 AND ("usageLimit" IS NULL OR "usageLimit" >= 0)) NOT VALID;
ALTER TABLE "Discount" ADD CONSTRAINT "Discount_dates_ordered" CHECK ("endsAt" IS NULL OR "endsAt" > "startsAt") NOT VALID;
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_stock_not_negative" CHECK ("allowBackorder" OR "inventoryQuantity" >= 0) NOT VALID;
