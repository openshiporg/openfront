"use server";

import Stripe from "stripe";
import fetch from "node-fetch";

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

  // Get payment provider
  const provider = await sudoContext.query.PaymentProvider.findOne({
    where: { code: paymentProviderId },
    query: "id code isInstalled",
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
  let sessionData = {};

  // Initialize provider-specific session
  try {
    if (provider.code === "pp_stripe_stripe") {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("Stripe secret key not configured");
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16",
      });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: cart.rawTotal,
        currency: cart.region.currency.code.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
      });

      sessionData = {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } else if (provider.code === "pp_paypal_paypal") {
      if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
        throw new Error("PayPal credentials not configured");
      }

      // Get PayPal access token
      const tokenResponse = await fetch(
        "https://api-m.sandbox.paypal.com/v1/oauth2/token",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-Language": "en_US",
            Authorization: `Basic ${Buffer.from(
              `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
            ).toString("base64")}`,
          },
          body: "grant_type=client_credentials",
        }
      );

      const { access_token } = await tokenResponse.json();
      if (!access_token) {
        throw new Error("Failed to get PayPal access token");
      }

      // Create PayPal order
      const orderResponse = await fetch(
        "https://api-m.sandbox.paypal.com/v2/checkout/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify({
            intent: "AUTHORIZE",
            purchase_units: [
              {
                amount: {
                  currency_code: cart.region.currency.code,
                  value: (cart.rawTotal / 100).toFixed(2),
                },
              },
            ],
          }),
        }
      );

      const order = await orderResponse.json();
      if (order.error) {
        throw new Error(`PayPal order creation failed: ${order.error.message}`);
      }

      sessionData = {
        orderId: order.id,
        status: order.status,
      };
    }

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
