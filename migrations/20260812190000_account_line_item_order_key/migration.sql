-- One financial posting per order. Existing duplicates must be reconciled rather
-- than silently collapsed, so deployment fails closed if duplicate order links exist.
ALTER TABLE "AccountLineItem" ADD COLUMN "orderKey" TEXT;

UPDATE "AccountLineItem"
SET "orderKey" = "order"
WHERE "order" IS NOT NULL;

CREATE UNIQUE INDEX "AccountLineItem_orderKey_key" ON "AccountLineItem"("orderKey");
