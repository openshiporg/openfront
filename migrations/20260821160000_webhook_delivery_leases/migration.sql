-- Bound failed webhook delivery and expose exhausted events for operations.
ALTER TABLE "WebhookEvent"
ADD COLUMN "deadLetteredAt" TIMESTAMP(3);

UPDATE "WebhookEvent"
SET "deadLetteredAt" = COALESCE("lastAttempt", CURRENT_TIMESTAMP),
    "nextAttempt" = NULL
WHERE "delivered" = false AND "deliveryAttempts" >= 12;

CREATE INDEX "WebhookEvent_retry_queue_idx"
ON "WebhookEvent"("delivered", "deadLetteredAt", "nextAttempt");
