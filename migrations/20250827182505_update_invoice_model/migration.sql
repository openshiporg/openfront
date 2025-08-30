/*
  Warnings:

  - You are about to drop the column `creditLimit` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `isOpenship` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `notApprovedAt` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `paidAmount` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `suspendedAt` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `InvoiceLineItem` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `InvoiceLineItem` table. All the data in the column will be lost.
  - You are about to drop the column `itemCount` on the `InvoiceLineItem` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `InvoiceLineItem` table. All the data in the column will be lost.
  - You are about to drop the column `orderDisplayId` on the `InvoiceLineItem` table. All the data in the column will be lost.
  - You are about to drop the column `generatedInvoice` on the `InvoiceRequest` table. All the data in the column will be lost.
  - You are about to drop the column `invoice` on the `Order` table. All the data in the column will be lost.
  - Made the column `totalAmount` on table `Invoice` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "InvoiceLineItem" DROP CONSTRAINT "InvoiceLineItem_order_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceRequest" DROP CONSTRAINT "InvoiceRequest_generatedInvoice_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_invoice_fkey";

-- DropIndex
DROP INDEX "InvoiceLineItem_orderDisplayId_idx";

-- DropIndex
DROP INDEX "InvoiceLineItem_order_idx";

-- DropIndex
DROP INDEX "InvoiceRequest_generatedInvoice_idx";

-- DropIndex
DROP INDEX "Order_invoice_idx";

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "creditLimit",
DROP COLUMN "isOpenship",
DROP COLUMN "notApprovedAt",
DROP COLUMN "paidAmount",
DROP COLUMN "suspendedAt",
ADD COLUMN     "account" TEXT,
ALTER COLUMN "title" SET DEFAULT 'Payment Invoice',
ALTER COLUMN "description" SET DEFAULT 'Invoice for selected orders payment',
ALTER COLUMN "totalAmount" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'paid',
ALTER COLUMN "paidAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "InvoiceLineItem" DROP COLUMN "amount",
DROP COLUMN "description",
DROP COLUMN "itemCount",
DROP COLUMN "order",
DROP COLUMN "orderDisplayId",
ADD COLUMN     "accountLineItem" TEXT;

-- AlterTable
ALTER TABLE "InvoiceRequest" DROP COLUMN "generatedInvoice",
ADD COLUMN     "generatedAccount" TEXT;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "invoice",
ADD COLUMN     "account" TEXT;

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "user" TEXT,
    "accountNumber" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT 'Business Account',
    "description" TEXT NOT NULL DEFAULT 'Running business account for automated orders placed through API integration',
    "totalAmount" INTEGER DEFAULT 0,
    "paidAmount" INTEGER DEFAULT 0,
    "creditLimit" INTEGER NOT NULL DEFAULT 100000,
    "currency" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "notApprovedAt" TIMESTAMP(3),
    "isOpenship" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountLineItem" (
    "id" TEXT NOT NULL,
    "account" TEXT,
    "order" TEXT,
    "description" TEXT NOT NULL DEFAULT 'Order line item',
    "amount" INTEGER NOT NULL,
    "orderDisplayId" TEXT NOT NULL DEFAULT '',
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_accountNumber_key" ON "Account"("accountNumber");

-- CreateIndex
CREATE INDEX "Account_user_idx" ON "Account"("user");

-- CreateIndex
CREATE INDEX "Account_currency_idx" ON "Account"("currency");

-- CreateIndex
CREATE INDEX "AccountLineItem_account_idx" ON "AccountLineItem"("account");

-- CreateIndex
CREATE INDEX "AccountLineItem_order_idx" ON "AccountLineItem"("order");

-- CreateIndex
CREATE INDEX "AccountLineItem_orderDisplayId_idx" ON "AccountLineItem"("orderDisplayId");

-- CreateIndex
CREATE INDEX "Invoice_account_idx" ON "Invoice"("account");

-- CreateIndex
CREATE INDEX "InvoiceLineItem_accountLineItem_idx" ON "InvoiceLineItem"("accountLineItem");

-- CreateIndex
CREATE INDEX "InvoiceRequest_generatedAccount_idx" ON "InvoiceRequest"("generatedAccount");

-- CreateIndex
CREATE INDEX "Order_account_idx" ON "Order"("account");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_currency_fkey" FOREIGN KEY ("currency") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountLineItem" ADD CONSTRAINT "AccountLineItem_account_fkey" FOREIGN KEY ("account") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountLineItem" ADD CONSTRAINT "AccountLineItem_order_fkey" FOREIGN KEY ("order") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_account_fkey" FOREIGN KEY ("account") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_accountLineItem_fkey" FOREIGN KEY ("accountLineItem") REFERENCES "AccountLineItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRequest" ADD CONSTRAINT "InvoiceRequest_generatedAccount_fkey" FOREIGN KEY ("generatedAccount") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_account_fkey" FOREIGN KEY ("account") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
