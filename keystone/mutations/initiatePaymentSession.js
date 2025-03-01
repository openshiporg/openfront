"use server";

import { createPayment } from "../utils/paymentProviderAdapter";

async function initiatePaymentSession(
  root,
  { cartId, paymentProviderId },
  context
) {
  const sudoContext = context.sudo();

  // Get cart with all needed data for total calculation and payment status
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      rawTotal
      region {
        id
        taxRate
        currency {
          code
          noDivisionCurrency
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

  if (!cart) {
    throw new Error("Cart not found");
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
  if (!cart.paymentCollection) {
    // Create new payment collection if none exists
    cart.paymentCollection = await sudoContext.query.PaymentCollection.createOne({
      data: {
        cart: { connect: { id: cart.id } },
        amount: cart.rawTotal,
        description: "default",
      },
      query: "id",
    });
  }

  // Check for existing session with same provider
  const existingSession = cart.paymentCollection?.paymentSessions?.find(
    s => s.paymentProvider.code === paymentProviderId && !s.isInitiated
  );

  // If we have an existing session that hasn't been initiated, just select it
  if (existingSession) {
    // Unselect all other sessions first
    const otherSessions = cart.paymentCollection.paymentSessions.filter(
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

    return existingSession;
  }

  // If we get here, we need to create a new session
  try {
    // Initialize provider-specific session using the adapter
    const sessionData = await createPayment({
      provider,
      cart,
      amount: cart.rawTotal,
      currency: cart.region.currency.code,
    });

    // Unselect any existing selected sessions first
    const existingSelectedSessions = cart.paymentCollection.paymentSessions?.filter(
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
        paymentCollection: { connect: { id: cart.paymentCollection.id } },
        paymentProvider: { connect: { id: provider.id } },
        amount: cart.rawTotal,
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
    console.error("Payment session creation failed:", error);
    throw error;
  }
}

export default initiatePaymentSession;
