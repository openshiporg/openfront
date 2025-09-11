"use server";

import { createPayment } from "../utils/paymentProviderAdapter";

async function initiateInvoicePaymentSession(
  root,
  { invoiceId, paymentProviderId },
  context
) {
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
    throw new Error("Invoice not found");
  }

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
    throw new Error("Payment provider not found or not installed");
  }

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

  // If we have an existing session that hasn't been initiated, we need to initialize it
  if (existingSession) {
    // Check if session data is empty (needs initialization)
    const needsInitialization = !existingSession.data || Object.keys(existingSession.data).length === 0;
    
    let sessionData = existingSession.data;
    
    if (needsInitialization) {
      try {
        sessionData = await createPayment({
          provider,
          cart: invoice,
          amount: invoice.totalAmount,
          currency: invoice.currency.code,
        });
        
        // Update the existing session with the new data
        await sudoContext.query.PaymentSession.updateOne({
          where: { id: existingSession.id },
          data: { 
            data: sessionData,
            isInitiated: true
          },
        });
      } catch (error) {
        throw error;
      }
    }
    
    // Unselect all other sessions first
    const otherSessions = invoice.paymentCollection.paymentSessions.filter(
      s => s.id !== existingSession.id && s.isSelected
    );
    
    for (const session of otherSessions) {
      await sudoContext.query.PaymentSession.updateOne({
        where: { id: session.id },
        data: { isSelected: false },
      });
    }

    // Select this session
    await sudoContext.query.PaymentSession.updateOne({
      where: { id: existingSession.id },
      data: { isSelected: true },
    });
    return {
      ...existingSession,
      data: sessionData
    };
  }

  // If we get here, we need to create a new session
  try {
    // Initialize provider-specific session using the adapter
    const sessionData = await createPayment({
      provider,
      cart: invoice, // Pass invoice as cart parameter
      amount: invoice.totalAmount,
      currency: invoice.currency.code,
    });

    // Unselect any existing selected sessions first
    const existingSelectedSessions = invoice.paymentCollection.paymentSessions?.filter(
      s => s.isSelected
    ) || [];
    
    for (const session of existingSelectedSessions) {
      await sudoContext.query.PaymentSession.updateOne({
        where: { id: session.id },
        data: { isSelected: false },
      });
    }

    // Create and select the new session
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
    return newSession;
  } catch (error) {
    throw error;
  }
}

export default initiateInvoicePaymentSession;