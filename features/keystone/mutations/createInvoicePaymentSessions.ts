async function createInvoicePaymentSessions(root, { invoiceId }, context) {
  const sudoContext = context.sudo();

  // Get invoice with payment provider info from region
  const invoice = await sudoContext.query.Invoice.findOne({
    where: { id: invoiceId },
    query: `
      id
      totalAmount
      currency {
        id
        code
      }
      account {
        id
        user {
          id
        }
      }
      paymentCollection {
        id
        paymentSessions {
          id
          paymentProvider {
            id
          }
        }
      }
    `
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  // Get available payment providers from the invoice line item region (same as checkout)
  const invoiceLineItems = await sudoContext.query.InvoiceLineItem.findMany({
    where: { invoice: { id: { equals: invoiceId } } },
    query: `
      accountLineItem {
        region {
          id
          paymentProviders {
            id
            code
            isInstalled
          }
        }
      }
    `
  });
  
  const invoiceLineItem = invoiceLineItems[0]; // Get first line item for region info
  
  // Allow all installed payment providers for invoice payments (same as checkout)
  const availableProviders = invoiceLineItem?.accountLineItem?.region?.paymentProviders?.filter(p => p.isInstalled) || [];
  
  if (availableProviders.length === 0) {
    throw new Error("No payment providers are available for this region");
  }

  // Create payment collection if it doesn't exist
  let paymentCollection = invoice.paymentCollection;
  
  if (!paymentCollection) {
    paymentCollection = await sudoContext.db.PaymentCollection.createOne({
      data: {
        invoice: { connect: { id: invoiceId } },
        description: "default",
        amount: invoice.totalAmount || 0,
      },
      query: "id"
    });
  }

  // Create payment sessions for each available provider
  for (let i = 0; i < availableProviders.length; i++) {
    const provider = availableProviders[i];
    // Skip if session already exists for this provider
    const existingSession = invoice.paymentCollection?.paymentSessions?.find(
      s => s.paymentProvider.id === provider.id
    );
    
    if (!existingSession) {
      const newSession = await sudoContext.db.PaymentSession.createOne({
        data: {
          paymentCollection: { connect: { id: paymentCollection.id } },
          paymentProvider: { connect: { id: provider.id } },
          amount: invoice.totalAmount || 0,
          data: {}, // Initialize with empty data object
          isSelected: i === 0, // Only select the first provider by default
          isInitiated: false,
        },
        query: "id"
      });
    }
  }

  // Return invoice with payment collection data from sudo context
  const invoiceWithPaymentCollection = await sudoContext.query.Invoice.findOne({
    where: { id: invoiceId },
    query: `
      id
      paymentCollection {
        id
        paymentSessions {
          id
          isSelected
          paymentProvider {
            id
            code
          }
          data
        }
      }
    `
  });

  return invoiceWithPaymentCollection;
}

export default createInvoicePaymentSessions;