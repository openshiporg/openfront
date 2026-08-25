-- Expand WebhookEndpoint with owner-scoped logical registration identity.
-- URL is deliberately not unique: different users/scopes and topics may share a receiver.
DROP INDEX IF EXISTS "WebhookEndpoint_url_key";

ALTER TABLE "WebhookEndpoint"
ADD COLUMN "registrationKey" TEXT,
ADD COLUMN "subscriptionKey" TEXT;

-- Preserve every legacy subscription and all of its delivery history. Legacy
-- rows receive unique identities and remain active until the dedicated
-- registration mutation creates their logical replacement.
UPDATE "WebhookEndpoint"
SET
  "registrationKey" = 'legacy:' || "id",
  "subscriptionKey" = 'legacy:' || "id"
WHERE "registrationKey" IS NULL OR "subscriptionKey" IS NULL;

-- Multiple NULL values remain legal during rolling deployment so older app
-- replicas can continue writing until all replicas use the registration API.
CREATE UNIQUE INDEX "WebhookEndpoint_subscriptionKey_key"
ON "WebhookEndpoint"("subscriptionKey");
