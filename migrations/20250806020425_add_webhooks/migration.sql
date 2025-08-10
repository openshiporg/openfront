-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "canManageWebhooks" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canReadWebhooks" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "WebhookEndpoint" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL DEFAULT '',
    "events" JSONB DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "secret" TEXT NOT NULL DEFAULT '',
    "lastTriggered" TIMESTAMP(3),
    "failureCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "WebhookEndpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL DEFAULT '',
    "resourceId" TEXT NOT NULL DEFAULT '',
    "resourceType" TEXT NOT NULL DEFAULT '',
    "payload" JSONB,
    "deliveryAttempts" INTEGER DEFAULT 0,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "lastAttempt" TIMESTAMP(3),
    "nextAttempt" TIMESTAMP(3),
    "responseStatus" INTEGER,
    "responseBody" TEXT NOT NULL DEFAULT '',
    "endpoint" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebhookEvent_endpoint_idx" ON "WebhookEvent"("endpoint");

-- AddForeignKey
ALTER TABLE "WebhookEvent" ADD CONSTRAINT "WebhookEvent_endpoint_fkey" FOREIGN KEY ("endpoint") REFERENCES "WebhookEndpoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;
