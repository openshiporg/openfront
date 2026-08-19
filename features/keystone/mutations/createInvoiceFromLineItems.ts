import crypto from "node:crypto";
import { permissions } from "../access";

// Create Invoice from Account Line Items - Group unpaid line items by region into invoices  
async function createInvoiceFromLineItems(
  root: any,
  { accountId, regionId, lineItemIds, dueDate }: {
    accountId: string;
    regionId: string;
    lineItemIds: string[];
    dueDate?: string;
  },
  context: any
) {
  if (!lineItemIds?.length || new Set(lineItemIds).size !== lineItemIds.length) {
    throw new Error('Unique line item IDs are required');
  }
  if (dueDate && !Number.isFinite(new Date(dueDate).getTime())) {
    throw new Error('Due date is invalid');
  }
  const sudoContext = context.sudo();
  
  // Validate user has access to this account
  if (!context.session?.itemId) {
    throw new Error('Authentication required');
  }

  // Get account and verify ownership
  const account = await sudoContext.query.Account.findOne({
    where: { id: accountId },
    query: `
      id
      user {
        id
        email
      }
      currency {
        id
        code
        symbol
        noDivisionCurrency
      }
      totalAmount
      paidAmount
    `
  });

  if (!account) {
    throw new Error('Account not found');
  }

  const canManagePayments = permissions.canManagePayments({ session: context.session });
  if (!canManagePayments && account.user?.id !== context.session.itemId) {
    throw new Error('Account not found');
  }

  // Get region for currency information
  const region = await sudoContext.query.Region.findOne({
    where: { id: regionId },
    query: `
      id
      name
      currency {
        id
        code
        symbol
        noDivisionCurrency
      }
    `
  });

  if (!region) {
    throw new Error('Region not found');
  }
  if (region.currency.code !== account.currency.code) {
    throw new Error('Cross-currency invoicing is outside the supported launch boundary');
  }

  // Get and validate line items - must be from the specified region
  const lineItems = await sudoContext.query.AccountLineItem.findMany({
    where: {
      id: { in: lineItemIds },
      account: { id: { equals: accountId } },
      region: { id: { equals: regionId } },
      paymentStatus: { equals: 'unpaid' }
    },
    query: `
      id
      amount
      description
      orderDisplayId
      itemCount
      paymentStatus
      createdAt
      region {
        id
        currency {
          code
        }
      }
    `
  });

  if (!lineItems.length) {
    throw new Error('No valid unpaid line items found');
  }

  if (lineItems.length !== lineItemIds.length) {
    throw new Error(`Some line items were not found, are already paid, or are not from ${region.name} region`);
  }

  // Calculate total amount
  const totalAmount = lineItems.reduce(
    (sum: number, item: any) => sum + (item.amount || 0),
    0
  );
  
  if (totalAmount <= 0) {
    throw new Error('Invoice total must be greater than zero');
  }

  try {
    // Create invoice and line items in transaction
    const result = await sudoContext.prisma.$transaction(async (tx: any) => {
      const currentItems = await tx.accountLineItem.findMany({
        where: {
          id: { in: lineItemIds },
          accountId,
          regionId,
          paymentStatus: 'unpaid',
        },
        select: { id: true, amount: true },
      });
      if (currentItems.length !== lineItemIds.length) {
        throw new Error('Invoice line items changed; reload and retry');
      }
      const existingInvoiceLines = await tx.invoiceLineItem.findMany({
        where: { accountLineItemId: { in: lineItemIds } },
        select: { id: true, invoiceId: true, accountLineItemId: true },
      });
      if (existingInvoiceLines.length) {
        const invoiceIds = new Set(existingInvoiceLines.map((item: any) => item.invoiceId));
        const linkedItemIds = new Set(existingInvoiceLines.map((item: any) => item.accountLineItemId));
        if (
          existingInvoiceLines.length === lineItemIds.length &&
          invoiceIds.size === 1 &&
          lineItemIds.every((id) => linkedItemIds.has(id))
        ) {
          const existingInvoice = await tx.invoice.findUnique({
            where: { id: [...invoiceIds][0] as string },
            include: { lineItems: true },
          });
          if (
            existingInvoice?.accountId === accountId &&
            existingInvoice.totalAmount === totalAmount &&
            existingInvoice.status === 'sent'
          ) {
            return { invoice: existingInvoice, reused: true };
          }
        }
        throw new Error('One or more line items are already invoiced');
      }
      const transactionTotal = currentItems.reduce(
        (sum: number, item: any) => sum + item.amount,
        0
      );
      if (transactionTotal !== totalAmount) throw new Error('Invoice amount changed; reload and retry');

      const invoice = await tx.invoice.create({
        data: {
          userId: account.user.id,
          accountId,
          invoiceNumber: `INV-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
          currencyId: region.currency.id,
          totalAmount,
          title: `${region.name} Invoice for Account ${account.id}`,
          description: `Payment invoice for ${lineItems.length} ${region.name} orders (${lineItems.map((item: any) => `#${item.orderDisplayId}`).join(', ')})`,
          status: 'sent',
          paidAt: null,
          dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          metadata: {
            regionId,
            regionName: region.name,
            createdFromLineItems: lineItemIds,
            orderDisplayIds: lineItems.map((item: any) => item.orderDisplayId),
            itemCount: lineItems.reduce(
              (sum: number, item: any) => sum + (item.itemCount || 0),
              0
            )
          }
        }
      });

      const invoiceLineItems = [];
      for (const lineItem of lineItems) {
        invoiceLineItems.push(await tx.invoiceLineItem.create({
          data: { invoiceId: invoice.id, accountLineItemId: lineItem.id }
        }));
      }

      return { invoice: { ...invoice, lineItems: invoiceLineItems } };
    }, { isolationLevel: 'Serializable' });

    return {
      success: true,
      invoiceId: result.invoice.id,
      message: `Invoice created with ${lineItems.length} orders`
    };

  } catch (error) {
    throw new Error(
      `Failed to create invoice: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export default createInvoiceFromLineItems;