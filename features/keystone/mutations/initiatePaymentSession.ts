"use server";

import { createPayment } from "../utils/paymentProviderAdapter";
import { assertCartAccess } from "../security/cart-access";
import { assertCheckoutWithinLaunchPolicy } from "../config/launch-policy";
import { isPaymentProviderConfigured } from "../utils/paymentProviderConfig";

async function initiatePaymentSession(
  root: any,
  { cartId, paymentProviderId }: { cartId: string; paymentProviderId: string },
  context: any
) {
  await assertCartAccess(context, cartId);
  const sudoContext = context.sudo();

  // Get cart with all needed data for total calculation and payment status
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      rawTotal
      metadata
      shippingAddress { id country { iso2 } }
      billingAddress { id }
      lineItems { productVariant { product { productTags { id } } } }
      region {
        id
        taxRate
        paymentProviders { id }
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
          amount
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

  if (!cart.shippingAddress?.id || !cart.billingAddress?.id || cart.rawTotal <= 0) {
    throw new Error("A positive cart with billing and shipping addresses is required");
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

  if (
    !provider ||
    !provider.isInstalled ||
    !isPaymentProviderConfigured(provider.code) ||
    !cart.region.paymentProviders?.some((item: any) => item.id === provider.id)
  ) {
    throw new Error("Payment provider not found, installed, and configured for this region");
  }
  assertCheckoutWithinLaunchPolicy(cart, provider.code);

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
    (session: any) => session.paymentProvider.code === paymentProviderId
  );

  if (
    existingSession?.isInitiated &&
    existingSession.amount === cart.rawTotal &&
    existingSession.data &&
    Object.keys(existingSession.data).length
  ) {
    await sudoContext.prisma.$transaction(async (tx: any) => {
      await tx.paymentSession.updateMany({
        where: { paymentCollectionId: cart.paymentCollection.id },
        data: { isSelected: false },
      });
      await tx.paymentSession.update({
        where: { id: existingSession.id },
        data: { isSelected: true },
      });
    });
    return { ...existingSession, isSelected: true };
  }

  // Initialize and select a pre-created provider session.
  if (existingSession) {
    const sessionData = await createPayment({
      provider,
      cart,
      amount: cart.rawTotal,
      currency: cart.region.currency.code,
    });
    await sudoContext.prisma.$transaction(async (tx: any) => {
      await tx.paymentSession.updateMany({
        where: { paymentCollectionId: cart.paymentCollection.id },
        data: { isSelected: false },
      });
      await tx.paymentSession.update({
        where: { id: existingSession.id },
        data: {
          isSelected: true,
          isInitiated: true,
          amount: cart.rawTotal,
          data: sessionData,
        },
      });
      await tx.paymentCollection.update({
        where: { id: cart.paymentCollection.id },
        data: { amount: cart.rawTotal },
      });
    });
    return { ...existingSession, amount: cart.rawTotal, data: sessionData, isInitiated: true };
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

    const newSession = await sudoContext.prisma.$transaction(async (tx: any) => {
      await tx.paymentSession.updateMany({
        where: { paymentCollectionId: cart.paymentCollection.id },
        data: { isSelected: false },
      });
      await tx.paymentCollection.update({
        where: { id: cart.paymentCollection.id },
        data: { amount: cart.rawTotal },
      });
      return tx.paymentSession.create({
        data: {
          paymentCollectionId: cart.paymentCollection.id,
          paymentProviderId: provider.id,
          amount: cart.rawTotal,
          isSelected: true,
          isInitiated: true,
          data: sessionData,
        },
      });
    });

    return newSession;
  } catch (error) {
    console.error("Payment session creation failed:", error);
    throw error;
  }
}

export default initiatePaymentSession;
