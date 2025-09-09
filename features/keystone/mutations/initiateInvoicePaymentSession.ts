"use server";

import { createPayment } from "../utils/paymentProviderAdapter";

async function initiateInvoicePaymentSession(
  root,
  { invoiceId, paymentProviderId },
  context
) {
  console.log('🚀 INITIATE INVOICE PAYMENT SESSION - START');
  console.log('🚀 Invoice ID:', invoiceId);
  console.log('🚀 Payment Provider ID:', paymentProviderId);
  
  const sudoContext = context.sudo();

  // Get invoice with all needed data for payment processing
  const invoice = await sudoContext.query.Invoice.findOne({
    where: { id: invoiceId },
    query: `
      id
      totalAmount
      currency {
        code
        noDivisionCurrency
      }
      account {
        id
        user {
          id
        }
      }
      paymentCollection {
        id
        amount
        paymentSessions {
          id
          isSelected
          isInitiated
          paymentProvider {
            id
            code
          }
          data
        }
      }
    `,
  });

  if (!invoice) {
    console.log('🚀 ERROR: Invoice not found for ID:', invoiceId);
    throw new Error("Invoice not found");
  }
  
  console.log('🚀 Found invoice:', invoice.id, 'totalAmount:', invoice.totalAmount);
  console.log('🚀 Invoice payment collection ID:', invoice.paymentCollection?.id);
  console.log('🚀 Number of existing payment sessions:', invoice.paymentCollection?.paymentSessions?.length || 0);

  // Get payment provider with all required fields
  const provider = await sudoContext.query.PaymentProvider.findOne({
    where: { code: paymentProviderId },
    query: `
      id 
      code 
      isInstalled
      createPaymentFunction
      capturePaymentFunction
      refundPaymentFunction
      getPaymentStatusFunction
      generatePaymentLinkFunction
      credentials
    `,
  });

  if (!provider || !provider.isInstalled) {
    console.log('🚀 ERROR: Payment provider not found or not installed for code:', paymentProviderId);
    throw new Error("Payment provider not found or not installed");
  }
  
  console.log('🚀 Found payment provider:', provider.code, 'ID:', provider.id);
  console.log('🚀 Provider is installed:', provider.isInstalled);

  // First check if we have an existing payment collection
  if (!invoice.paymentCollection) {
    // Create new payment collection if none exists
    invoice.paymentCollection = await sudoContext.query.PaymentCollection.createOne({
      data: {
        invoice: { connect: { id: invoice.id } },
        amount: invoice.totalAmount,
        description: "default",
      },
      query: "id",
    });
  }

  // Check for existing session with same provider
  const existingSession = invoice.paymentCollection?.paymentSessions?.find(
    s => s.paymentProvider.code === paymentProviderId && !s.isInitiated
  );
  
  console.log('🚀 Looking for existing session for provider:', paymentProviderId);
  console.log('🚀 Found existing session:', !!existingSession, existingSession?.id);

  // If we have an existing session that hasn't been initiated, we need to initialize it
  if (existingSession) {
    console.log('🚀 Using existing session:', existingSession.id);
    console.log('🚀 Existing session data:', JSON.stringify(existingSession.data, null, 2));
    
    // Check if session data is empty (needs initialization)
    const needsInitialization = !existingSession.data || Object.keys(existingSession.data).length === 0;
    console.log('🚀 Session needs initialization:', needsInitialization);
    
    let sessionData = existingSession.data;
    
    if (needsInitialization) {
      console.log('🚀 Initializing session with payment adapter');
      try {
        sessionData = await createPayment({
          provider,
          cart: invoice,
          amount: invoice.totalAmount,
          currency: invoice.currency.code,
        });
        console.log('🚀 Payment adapter returned session data:', JSON.stringify(sessionData, null, 2));
        
        // Update the existing session with the new data
        await sudoContext.query.PaymentSession.updateOne({
          where: { id: existingSession.id },
          data: { 
            data: sessionData,
            isInitiated: true
          },
        });
        console.log('🚀 Updated existing session with new data');
      } catch (error) {
        console.error('🚀 Failed to initialize session:', error);
        throw error;
      }
    }
    
    // Unselect all other sessions first
    const otherSessions = invoice.paymentCollection.paymentSessions.filter(
      s => s.id !== existingSession.id && s.isSelected
    );
    
    console.log('🚀 Unselecting', otherSessions.length, 'other sessions');
    for (const session of otherSessions) {
      console.log('🚀 Unselecting session:', session.id, 'provider:', session.paymentProvider?.code);
      await sudoContext.query.PaymentSession.updateOne({
        where: { id: session.id },
        data: { isSelected: false },
      });
    }

    // Select this session
    console.log('🚀 Selecting existing session:', existingSession.id);
    await sudoContext.query.PaymentSession.updateOne({
      where: { id: existingSession.id },
      data: { isSelected: true },
    });

    console.log('🚀 EXISTING SESSION SELECTED AND INITIALIZED - DONE');
    return {
      ...existingSession,
      data: sessionData
    };
  }

  // If we get here, we need to create a new session
  console.log('🚀 No existing session found, creating new payment session');
  try {
    console.log('🚀 Calling createPayment adapter with:');
    console.log('🚀 - Provider code:', provider.code);
    console.log('🚀 - Amount:', invoice.totalAmount);
    console.log('🚀 - Currency:', invoice.currency.code);
    
    // Initialize provider-specific session using the adapter
    const sessionData = await createPayment({
      provider,
      cart: invoice, // Pass invoice as cart parameter
      amount: invoice.totalAmount,
      currency: invoice.currency.code,
    });
    
    console.log('🚀 Payment adapter returned session data:', JSON.stringify(sessionData, null, 2));

    // Unselect any existing selected sessions first
    const existingSelectedSessions = invoice.paymentCollection.paymentSessions?.filter(
      s => s.isSelected
    ) || [];
    
    console.log('🚀 Unselecting', existingSelectedSessions.length, 'existing selected sessions');
    for (const session of existingSelectedSessions) {
      console.log('🚀 Unselecting existing session:', session.id, 'provider:', session.paymentProvider?.code);
      await sudoContext.query.PaymentSession.updateOne({
        where: { id: session.id },
        data: { isSelected: false },
      });
    }

    // Create and select the new session
    console.log('🚀 Creating new payment session with data:', JSON.stringify(sessionData, null, 2));
    const newSession = await sudoContext.query.PaymentSession.createOne({
      data: {
        paymentCollection: { connect: { id: invoice.paymentCollection.id } },
        paymentProvider: { connect: { id: provider.id } },
        amount: invoice.totalAmount,
        isSelected: true,
        isInitiated: false,
        data: sessionData,
      },
      query: `
        id
        data
        amount
        isInitiated
      `,
    });
    
    console.log('🚀 Created new payment session:', newSession.id);
    console.log('🚀 NEW SESSION CREATED - DONE');
    return newSession;
  } catch (error) {
    console.error("Invoice payment session creation failed:", error);
    throw error;
  }
}

export default initiateInvoicePaymentSession;