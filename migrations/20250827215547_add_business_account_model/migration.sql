/*
  Warnings:

  - You are about to drop the `InvoiceRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "InvoiceRequest" DROP CONSTRAINT "InvoiceRequest_generatedAccount_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceRequest" DROP CONSTRAINT "InvoiceRequest_reviewedBy_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceRequest" DROP CONSTRAINT "InvoiceRequest_user_fkey";

-- DropTable
DROP TABLE "InvoiceRequest";

-- CreateTable
CREATE TABLE "BusinessAccountRequest" (
    "id" TEXT NOT NULL,
    "user" TEXT,
    "businessName" TEXT NOT NULL DEFAULT '',
    "businessType" TEXT NOT NULL,
    "monthlyOrderVolume" TEXT NOT NULL,
    "requestedCreditLimit" INTEGER NOT NULL,
    "businessDescription" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewNotes" TEXT NOT NULL DEFAULT '',
    "approvedCreditLimit" INTEGER,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "generatedAccount" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessAccountRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessAccountRequest_user_key" ON "BusinessAccountRequest"("user");

-- CreateIndex
CREATE INDEX "BusinessAccountRequest_reviewedBy_idx" ON "BusinessAccountRequest"("reviewedBy");

-- CreateIndex
CREATE INDEX "BusinessAccountRequest_generatedAccount_idx" ON "BusinessAccountRequest"("generatedAccount");

-- AddForeignKey
ALTER TABLE "BusinessAccountRequest" ADD CONSTRAINT "BusinessAccountRequest_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessAccountRequest" ADD CONSTRAINT "BusinessAccountRequest_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessAccountRequest" ADD CONSTRAINT "BusinessAccountRequest_generatedAccount_fkey" FOREIGN KEY ("generatedAccount") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
