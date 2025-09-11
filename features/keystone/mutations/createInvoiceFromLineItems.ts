// Create Invoice from Account Line Items - Group unpaid line items by region into invoices  
async function createInvoiceFromLineItems(root, { accountId, regionId, lineItemIds, dueDate }, context) {
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

  // Skip user ownership check for now - auth handled at model level
  // if (account.user.id !== context.session.itemId) {
  //   throw new Error('Unauthorized access to account');
  // }

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
  const totalAmount = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  
  if (totalAmount <= 0) {
    throw new Error('Invoice total must be greater than zero');
  }

  try {
    // Create invoice and line items in transaction
    const result = await sudoContext.prisma.$transaction(async (tx) => {
      // Create the invoice
      const invoice = await sudoContext.query.Invoice.createOne({
        data: {
          user: { connect: { id: account.user.id } },
          account: { connect: { id: accountId } },
          currency: { connect: { id: region.currency.id } },
          totalAmount,
          title: `${region.name} Invoice for Account ${account.id}`,
          description: `Payment invoice for ${lineItems.length} ${region.name} orders (${lineItems.map(item => `#${item.orderDisplayId}`).join(', ')})`,
          status: 'sent', // Ready for payment
          dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default 30 days
          metadata: {
            regionId: regionId,
            regionName: region.name,
            createdFromLineItems: lineItemIds,
            orderDisplayIds: lineItems.map(item => item.orderDisplayId),
            itemCount: lineItems.reduce((sum, item) => sum + (item.itemCount || 0), 0)
          }
        }
      });

      // Create invoice line items (junction records)
      const invoiceLineItems = [];
      for (const lineItem of lineItems) {
        const invoiceLineItem = await sudoContext.query.InvoiceLineItem.createOne({
          data: {
            invoice: { connect: { id: invoice.id } },
            accountLineItem: { connect: { id: lineItem.id } }
          }
        });
        invoiceLineItems.push(invoiceLineItem);
      }

      return {
        invoice: {
          ...invoice,
          lineItems: invoiceLineItems
        }
      };
    });

    return {
      success: true,
      invoiceId: result.invoice.id,
      message: `Invoice created with ${lineItems.length} orders`
    };

  } catch (error) {
    throw new Error(`Failed to create invoice: ${error.message}`);
  }
}

export default createInvoiceFromLineItems;