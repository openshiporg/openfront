-- Order.displayId was set from the clock (whole seconds), so two orders placed in the
-- same second got the same number. Let the database hand the numbers out instead.
-- The sequence starts after the highest number already in use, so existing orders keep
-- their numbers and new ones keep counting up.
CREATE SEQUENCE order_displayid_seq;
ALTER TABLE "Order" ALTER COLUMN "displayId" SET DEFAULT nextval('order_displayid_seq');
ALTER SEQUENCE order_displayid_seq OWNED BY "Order"."displayId";
SELECT setval('order_displayid_seq', COALESCE((SELECT MAX("displayId") FROM "Order"), 0) + 1, false);
