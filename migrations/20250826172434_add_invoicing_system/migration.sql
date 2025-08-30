-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "invoice" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "customerToken" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "tokenGeneratedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "user" TEXT,
    "invoiceNumber" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT 'Business Invoice',
    "description" TEXT NOT NULL DEFAULT 'Running invoice for automated orders placed through API integration',
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

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceLineItem" (
    "id" TEXT NOT NULL,
    "invoice" TEXT,
    "order" TEXT,
    "description" TEXT NOT NULL DEFAULT 'Order line item',
    "amount" INTEGER NOT NULL,
    "orderDisplayId" TEXT NOT NULL DEFAULT '',
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceRequest" (
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
    "generatedInvoice" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Invoice_user_idx" ON "Invoice"("user");

-- CreateIndex
CREATE INDEX "Invoice_currency_idx" ON "Invoice"("currency");

-- CreateIndex
CREATE INDEX "InvoiceLineItem_invoice_idx" ON "InvoiceLineItem"("invoice");

-- CreateIndex
CREATE INDEX "InvoiceLineItem_order_idx" ON "InvoiceLineItem"("order");

-- CreateIndex
CREATE INDEX "InvoiceLineItem_orderDisplayId_idx" ON "InvoiceLineItem"("orderDisplayId");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceRequest_user_key" ON "InvoiceRequest"("user");

-- CreateIndex
CREATE INDEX "InvoiceRequest_reviewedBy_idx" ON "InvoiceRequest"("reviewedBy");

-- CreateIndex
CREATE INDEX "InvoiceRequest_generatedInvoice_idx" ON "InvoiceRequest"("generatedInvoice");

-- CreateIndex
CREATE INDEX "Order_invoice_idx" ON "Order"("invoice");

-- CreateIndex
CREATE INDEX "User_customerToken_idx" ON "User"("customerToken");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_currency_fkey" FOREIGN KEY ("currency") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_invoice_fkey" FOREIGN KEY ("invoice") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLineItem" ADD CONSTRAINT "InvoiceLineItem_order_fkey" FOREIGN KEY ("order") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRequest" ADD CONSTRAINT "InvoiceRequest_user_fkey" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRequest" ADD CONSTRAINT "InvoiceRequest_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceRequest" ADD CONSTRAINT "InvoiceRequest_generatedInvoice_fkey" FOREIGN KEY ("generatedInvoice") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_invoice_fkey" FOREIGN KEY ("invoice") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
