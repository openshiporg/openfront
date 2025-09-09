async function createInvoicePaymentSessions(root, { invoiceId }, context) {
  const sudoContext = context.sudo();

  console.log('🔥 CREATING PAYMENT SESSIONS - Starting with invoice ID:', invoiceId);

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

  console.log('🔥 Found invoice:', invoice?.id, 'totalAmount:', invoice?.totalAmount);

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
  
  console.log('🔥 Found invoice line items:', invoiceLineItems.length);
  
  const invoiceLineItem = invoiceLineItems[0]; // Get first line item for region info
  console.log('🔥 First invoice line item region:', invoiceLineItem?.accountLineItem?.region?.id);
  
  // Allow all installed payment providers for invoice payments (same as checkout)
  const availableProviders = invoiceLineItem?.accountLineItem?.region?.paymentProviders?.filter(p => p.isInstalled) || [];
  console.log('🔥 Available payment providers:', availableProviders.map(p => ({ id: p.id, code: p.code })));
  
  if (availableProviders.length === 0) {
    throw new Error("No payment providers are available for this region");
  }

  // Create payment collection if it doesn't exist
  let paymentCollection = invoice.paymentCollection;
  console.log('🔥 Existing payment collection:', paymentCollection?.id);
  
  if (!paymentCollection) {
    console.log('🔥 Creating payment collection for invoice:', invoiceId, 'amount:', invoice.totalAmount);
    paymentCollection = await sudoContext.db.PaymentCollection.createOne({
      data: {
        invoice: { connect: { id: invoiceId } },
        description: "default",
        amount: invoice.totalAmount || 0,
      },
      query: "id"
    });
    console.log('🔥 Created payment collection:', paymentCollection.id);
  }

  // Create payment sessions for each available provider
  console.log('🔥 Creating payment sessions for', availableProviders.length, 'providers');
  
  for (let i = 0; i < availableProviders.length; i++) {
    const provider = availableProviders[i];
    // Skip if session already exists for this provider
    const existingSession = invoice.paymentCollection?.paymentSessions?.find(
      s => s.paymentProvider.id === provider.id
    );
    
    console.log('🔥 Processing provider:', provider.code, 'existing session:', !!existingSession);
    
    if (!existingSession) {
      console.log('🔥 Creating payment session for provider:', provider.code);
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
      console.log('🔥 Created payment session:', newSession.id, 'isSelected:', i === 0);
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