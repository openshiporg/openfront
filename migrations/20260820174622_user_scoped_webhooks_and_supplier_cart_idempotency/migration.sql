/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Cart" ALTER COLUMN "idempotencyKey" DROP NOT NULL,
ALTER COLUMN "idempotencyKey" DROP DEFAULT;

-- Empty strings came from the old default and do not represent real attempts.
UPDATE "Cart" SET "idempotencyKey" = NULL WHERE "idempotencyKey" = '';

-- AlterTable
ALTER TABLE "Store" ALTER COLUMN "logoColor" SET DEFAULT '0',
ALTER COLUMN "logoIcon" SET DEFAULT '<svg xmlns="http://www.w3.org/2000/svg" fill="none" height="100%" width="100%" viewBox="0 0 42 48"><path fill="#155eef" fill-rule="evenodd" d="m22.102 20.86 9.9-9.9L29.88 8.84l-7.339 7.339V3h-3v13.178l-7.339-7.34-2.121 2.122 9.9 9.9 1.06 1.06zm2.12 2.121 9.9-9.9 2.121 2.122-7.339 7.339H42v3H28.904l7.34 7.339L34.121 35l-9.9-9.899-1.06-1.06zM7.96 35.001l9.9-9.899 1.06-1.06-1.06-1.061-9.9-9.9-2.121 2.122 7.339 7.339H.002v3h13.176l-7.34 7.339zm12.02-7.777-9.9 9.9 2.122 2.12 7.339-7.338V45h3V31.906l7.339 7.338L32 37.124l-9.9-9.9-1.06-1.061z" clip-rule="evenodd"/></svg>';

-- Remove the legacy unsigned customer callback. Durable signed WebhookEndpoint
-- subscriptions are the only integration delivery path.
ALTER TABLE "User" DROP COLUMN "orderWebhookUrl";

-- AlterTable
ALTER TABLE "WebhookEndpoint" ADD COLUMN     "scope" TEXT NOT NULL DEFAULT 'STORE',
ADD COLUMN     "user" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Cart_idempotencyKey_key" ON "Cart"("idempotencyKey");

-- CreateIndex
CREATE INDEX "WebhookEndpoint_user_idx" ON "WebhookEndpoint"("user");

-- AddForeignKey
ALTER TABLE "WebhookEndpoint" ADD CONSTRAINT "WebhookEndpoint_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
