import {
  assertCartAccess,
  assertPaymentSessionBelongsToCart,
} from "../security/cart-access";
import {
  capturePayment,
  getPaymentStatus,
} from "../utils/paymentProviderAdapter";
import {
  checkoutKey,
  getOrCreateCheckoutAttempt,
  releaseCheckoutResources,
  reserveCartInventory,
  reserveDiscountUsage,
  updateCheckoutAttempt,
} from "../checkout/recovery";
import {
  assertCheckoutWithinLaunchPolicy,
  commerceLaunchPolicy,
} from "../config/launch-policy";
import { createOrderFromCartAtomically } from "../checkout/order-commit";
import {
  enqueueWebhookOutbox,
  subscribedWebhookEndpointIds,
} from "../../webhooks/outbox";

async function completeActiveCart(
  root: any,
  { cartId, paymentSessionId }: { cartId: string; paymentSessionId?: string },
  context: any
) {
  await assertCartAccess(context, cartId, { allowCompleted: true });
  if (paymentSessionId) {
    await assertPaymentSessionBelongsToCart(context, cartId, paymentSessionId);
  }
  const sudoContext = context.sudo();
  const user = context.session?.itemId;

  // Get cart with all necessary data
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      email
      rawTotal
      metadata
      order {
        id
        status
        displayId
        secretKey
        payments { id }
        account { id }
        shippingAddress { country { iso2 } }
      }
      user {
        id
        hasAccount
      }
      shippingAddress {
        id
        country { iso2 }
        user {
          id
          hasAccount
        }
      }
      region {
        id
        taxRate
        currency {
          code
          id
        }
      }
      billingAddress {
        id
      }
      shippingAddress {
        id
      }
      discounts {
        id
        code
      }
      giftCards { id }
      shippingMethods {
        id
      }
      lineItems {
        id
        quantity
        metadata
        unitPrice
        total
        productVariant {
          id
          sku
          title
          inventoryQuantity
          manageInventory
          allowBackorder
          primaryImage {
            image {
              url
            }
            imagePath
          }
          product {
            id
            title
            thumbnail
            productTags { id }
            description {
              document
            }
            metadata
          }
          prices {
            id
            amount
            compareAmount
            currency {
              code
            }
            calculatedPrice {
              calculatedAmount
              originalAmount
              currencyCode
            }
          }
          measurements {
            id
            value
            unit
            type
          }
        }
      }
      paymentCollection {
        id
        amount
        paymentSessions {
          id
          amount
          data
          paymentProvider {
            id
            code
            capturePaymentFunction
            getPaymentStatusFunction
            credentials
          }
        }
      }
    `,
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  // The cart/order relationship is the local recovery anchor. Complete any
  // post-provider local records before returning a previously created order.
  if (cart.order?.id) {
    const existingAttempt = await sudoContext.prisma.idempotencyKey.findUnique({
      where: { idempotencyKey: checkoutKey(cartId) },
    });
    if (paymentSessionId && !cart.order.payments?.length) {
      const selectedSession = cart.paymentCollection?.paymentSessions?.find(
        (session: any) => session.id === paymentSessionId
      );
      const paymentResult = existingAttempt?.responseBody?.paymentResult;
      if (!selectedSession || !paymentResult || existingAttempt.recoveryPoint !== 'payment_confirmed') {
        throw new Error('Checkout requires payment reconciliation');
      }
      await createPaymentRecord(paymentResult, selectedSession, cart.order, cart, sudoContext);
    } else if (!paymentSessionId && !cart.order.account?.id) {
      if (!user) throw new Error('Checkout requires account reconciliation');
      const accounts = await sudoContext.query.Account.findMany({
        where: {
          user: { id: { equals: user } },
          accountType: { equals: 'business' },
          status: { equals: 'active' },
        },
        take: 1,
        query: 'id',
      });
      if (!accounts[0]) throw new Error('Checkout requires account reconciliation');
      await addOrderToAccount(accounts[0].id, cart.order, sudoContext);
    }
    if (existingAttempt) {
      await updateCheckoutAttempt(
        sudoContext.prisma,
        existingAttempt.id,
        'completed',
        { orderId: cart.order.id },
        200
      );
    }
    return sudoContext.query.Order.findOne({
      where: { id: cart.order.id },
      query: 'id status displayId secretKey shippingAddress { country { iso2 } }',
    });
  }
  assertCheckoutWithinLaunchPolicy(cart);
  if (cart.giftCards?.length) {
    throw new Error('Gift-card redemption is outside the bounded launch boundary');
  }

  const attempt = await getOrCreateCheckoutAttempt(
    sudoContext.prisma,
    cartId,
    paymentSessionId
  );
  if (attempt.recoveryPoint === 'completed' && attempt.responseBody?.orderId) {
    return sudoContext.query.Order.findOne({
      where: { id: attempt.responseBody.orderId },
      query: 'id status displayId secretKey shippingAddress { country { iso2 } }',
    });
  }

  let inventoryReserved = attempt.recoveryPoint !== 'started';
  let discountsReserved = [
    'resources_reserved',
    'payment_unknown',
    'order_created',
    'payment_confirmed',
  ].includes(attempt.recoveryPoint);
  try {
    if (!inventoryReserved) {
      await reserveCartInventory(
        sudoContext.prisma,
        cart.lineItems,
        checkoutKey(cartId),
        attempt.id
      );
      inventoryReserved = true;
      attempt.recoveryPoint = 'stock_reserved';
    }
    if (!discountsReserved) {
      await reserveDiscountUsage(
        sudoContext.prisma,
        cart.discounts || [],
        attempt.id
      );
      discountsReserved = true;
      attempt.recoveryPoint = 'resources_reserved';
    }

    const order = !paymentSessionId
      ? await handleAccountOrder(cart, user, sudoContext, attempt)
      : await handlePaidOrder(cart, paymentSessionId, sudoContext, attempt);

    await updateCheckoutAttempt(
      sudoContext.prisma,
      attempt.id,
      'completed',
      { orderId: order.id },
      200
    );
    return order;
  } catch (error) {
    // Before an external payment succeeds, stock can be safely released. Once
    // payment is confirmed the durable attempt remains recoverable and a retry
    // completes the local order without charging again.
    if (
      inventoryReserved &&
      !['payment_unknown', 'order_created', 'payment_confirmed'].includes(attempt.recoveryPoint)
    ) {
      await releaseCheckoutResources(
        sudoContext.prisma,
        cart.lineItems,
        discountsReserved ? (cart.discounts || []) : [],
        checkoutKey(cartId),
        attempt.id,
        error instanceof Error ? error.message : 'Checkout failed'
      );
    }
    throw error;
  }
}

// Handle orders that go to accounts (Openship customer token flow)
async function handleAccountOrder(cart: any, user: string, sudoContext: any, attempt: any) {
  if (!user) {
    throw new Error('Authentication required for account orders');
  }
  
  // Get cart currency for account matching
  const cartCurrency = cart.region?.currency?.code;
  if (!cartCurrency) {
    throw new Error('Cart region or currency not found');
  }
  
  // Find the user's business account (single account approach)
  const accounts = await sudoContext.query.Account.findMany({
    where: { 
      user: { id: { equals: user } },
      accountType: { equals: 'business' },
      status: { equals: 'active' }
    },
    query: `
      id
      totalAmount
      paidAmount
      creditLimit
      currency {
        id
        code
        noDivisionCurrency
      }
      user {
        id
        email
      }
    `
  });
  
  const activeAccount = accounts[0];
  
  if (!activeAccount) {
    throw new Error(`No active business account found. Contact administrator to set up business account access.`);
  }
  
  // Cross-currency credit requires an owner-approved rate source and accounting
  // policy. The bounded launch fails closed instead of using an approximation.
  if (cartCurrency !== activeAccount.currency.code) {
    throw new Error('Cross-currency account orders are outside the supported launch boundary');
  }
  const orderInAccountCurrency = cart.rawTotal;
  
  // Create order without payment processing
  const order = await createOrderFromCartAtomically(cart, sudoContext);
  await updateCheckoutAttempt(
    sudoContext.prisma,
    attempt.id,
    'order_created',
    { orderId: order.id }
  );
  attempt.recoveryPoint = 'order_created';
  
  // Add order to account with transaction safety
  await addOrderToAccount(activeAccount.id, order, sudoContext);
  
  return order;
}

// Handle orders with payment processing (regular storefront)
async function handlePaidOrder(cart: any, paymentSessionId: string, sudoContext: any, attempt: any) {
  // Find the specific payment session by ID
  const selectedSession = cart.paymentCollection?.paymentSessions?.find(
    (session: any) => session.id === paymentSessionId
  );

  if (!selectedSession) {
    throw new Error(`Payment session not found. Looking for session ID: ${paymentSessionId}`);
  }
  
  if (!selectedSession.paymentProvider) {
    throw new Error("Payment provider not found in session");
  }
  
  if (!selectedSession.paymentProvider.code) {
    throw new Error("Payment provider code is missing");
  }
  assertCheckoutWithinLaunchPolicy(cart, selectedSession.paymentProvider.code);
  
  if (selectedSession.amount !== cart.rawTotal) {
    throw new Error("Payment session amount no longer matches cart total");
  }

  let paymentResult = attempt.responseBody?.paymentResult;
  if (attempt.recoveryPoint !== 'payment_confirmed' || !paymentResult) {
    try {
      paymentResult = await settlePaymentSession(selectedSession, cart);
    } catch (error) {
      await updateCheckoutAttempt(
        sudoContext.prisma,
        attempt.id,
        'payment_unknown',
        { error: error instanceof Error ? error.message : String(error) }
      );
      attempt.recoveryPoint = 'payment_unknown';
      throw error;
    }
    if (paymentResult.status !== 'succeeded') {
      await updateCheckoutAttempt(
        sudoContext.prisma,
        attempt.id,
        'resources_reserved',
        { paymentResult }
      );
      attempt.recoveryPoint = 'resources_reserved';
      throw new Error(`Payment failed: ${paymentResult.error || paymentResult.status}`);
    }
    await updateCheckoutAttempt(
      sudoContext.prisma,
      attempt.id,
      'payment_confirmed',
      { paymentResult }
    );
    attempt.recoveryPoint = 'payment_confirmed';
    attempt.responseBody = { paymentResult };
  }

  // Create order and payment record
  const order = await createOrderFromCartAtomically(cart, sudoContext);
  await createPaymentRecord(paymentResult, selectedSession, order, cart, sudoContext);

  return order;
}

async function settlePaymentSession(session: any, cart: any) {
  const provider = session.paymentProvider;
  if (provider.code === 'pp_system_default') {
    throw new Error('Manual tender cannot complete storefront checkout');
  }

  const paymentId =
    session.data?.paymentIntentId ||
    session.data?.clientSecret?.split('_secret_')[0] ||
    session.data?.orderId;
  if (!paymentId) throw new Error('Payment provider reference is missing');

  let result = await getPaymentStatus({ provider, paymentId });
  const normalizedStatus = String(result.status || '').toLowerCase();
  if (['requires_capture', 'approved', 'authorized'].includes(normalizedStatus)) {
    result = await capturePayment({
      provider,
      paymentId,
      amount: cart.rawTotal,
      currency: cart.region.currency.code,
      idempotencyKey: checkoutKey(cart.id),
    });
  }

  const finalStatus = String(result.status || '').toLowerCase();
  const succeeded = ['succeeded', 'completed', 'captured'].includes(finalStatus);
  const resultAmount = Number(result.amount);
  const expectedCurrency = String(cart.region.currency.code).toUpperCase();
  const resultCurrency = String(result.currency || expectedCurrency).toUpperCase();

  if (!succeeded) {
    return { status: 'failed', paymentIntentId: paymentId, error: `Payment status: ${result.status}` };
  }
  if (!Number.isInteger(resultAmount) || resultAmount !== cart.rawTotal) {
    throw new Error('Provider payment amount does not match cart total');
  }
  if (resultCurrency !== expectedCurrency) {
    throw new Error('Provider payment currency does not match cart currency');
  }

  return {
    status: 'succeeded',
    paymentIntentId: paymentId,
    amount: resultAmount,
    currency: resultCurrency,
    data: result.data,
  };
}

// Helper function to add order to account
async function addOrderToAccount(accountId: string, order: any, sudoContext: any) {
  const orderDetails = await sudoContext.query.Order.findOne({
    where: { id: order.id },
    query: `
      id
      displayId
      rawTotal
      region {
        id
        name
        currency {
          code
        }
      }
      currency {
        code
      }
      lineItems {
        id
      }
    `
  });

  // Single account approach - no currency validation needed
  // Orders from any region can be added to the business account

  // Use atomic transaction to ensure data consistency
  try {
    await sudoContext.prisma.$transaction(async (tx: any) => {
      const existing = await tx.accountLineItem.findUnique({
        where: { orderKey: order.id },
        select: { id: true, accountId: true },
      });
      if (existing && existing.accountId !== accountId) {
        throw new Error('Order is already posted to a different account');
      }

      if (!existing) {
        const amount = orderDetails.rawTotal || 0;
        // Lock the account before evaluating and consuming credit so concurrent
        // checkouts cannot both spend the same available balance.
        const accountRows = await tx.$queryRaw<Array<{
          id: string;
          status: string;
          totalAmount: number;
          paidAmount: number;
          creditLimit: number;
        }>>`SELECT id, status, "totalAmount", "paidAmount", "creditLimit" FROM "Account" WHERE id = ${accountId} FOR UPDATE`;
        const account = accountRows[0];
        if (!account || account.status !== 'active') {
          throw new Error('Business account is not active');
        }
        const availableCredit = account.creditLimit - ((account.totalAmount || 0) - (account.paidAmount || 0));
        if (amount > availableCredit) throw new Error('Insufficient account credit');
        await tx.account.update({
          where: { id: accountId },
          data: { totalAmount: { increment: amount } },
        });
        await tx.accountLineItem.create({
          data: {
            accountId,
            orderId: order.id,
            orderKey: order.id,
            regionId: orderDetails.region.id,
            description: `Order #${orderDetails.displayId} - ${orderDetails.lineItems?.length || 0} items`,
            amount,
            orderDisplayId: String(orderDetails.displayId),
            itemCount: orderDetails.lineItems?.length || 0,
            paymentStatus: 'unpaid',
          }
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: { accountId }
      });
    }, { isolationLevel: 'Serializable' });

    console.log(`Order #${orderDetails.displayId} added to account ${accountId} for ${orderDetails.rawTotal} ${orderDetails.currency.code}`);
    
  } catch (error) {
    console.error('Error adding order to account:', error);
    throw new Error(
      `Failed to add order to account: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Helper function to create payment record
async function createPaymentRecord(
  paymentResult: any,
  selectedSession: any,
  order: any,
  cart: any,
  sudoContext: any
) {
  const paymentWebhookEndpointIds = await subscribedWebhookEndpointIds(
    sudoContext,
    'payment.captured'
  );
  await sudoContext.prisma.$transaction(async (tx: any) => {
    const existing = await tx.payment.findFirst({
      where: { orderId: order.id, paymentCollectionId: cart.paymentCollection.id },
    });
    if (existing) return;
    const payment = await tx.payment.create({
      data: {
        status: 'captured',
        amount: cart.rawTotal,
        currencyCode: cart.region.currency.code,
        data: {
          ...selectedSession.data,
          ...paymentResult.data,
          paymentProviderId: selectedSession.paymentProvider.id,
          paymentIntentId: paymentResult.paymentIntentId,
        },
        metadata: { checkoutIdempotencyKey: checkoutKey(cart.id) },
        idempotencyKey: checkoutKey(cart.id),
        capturedAt: new Date(),
        paymentCollectionId: cart.paymentCollection.id,
        orderId: order.id,
        userId: cart.user?.id || cart.shippingAddress?.user?.id || null,
      },
    });
    await tx.capture.create({
      data: {
        amount: cart.rawTotal,
        paymentId: payment.id,
        metadata: {
          paymentProviderId: selectedSession.paymentProvider.id,
          paymentIntentId: paymentResult.paymentIntentId,
        },
        createdBy: 'checkout',
      },
    });
    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        type: 'PAYMENT_CAPTURED',
        data: {
          paymentId: payment.id,
          amount: cart.rawTotal,
          currencyCode: cart.region.currency.code,
          source: 'checkout',
        },
      },
    });
    await enqueueWebhookOutbox(
      tx,
      paymentWebhookEndpointIds,
      'payment.captured',
      'Payment',
      payment.id,
      { id: payment.id, orderId: order.id, amount: cart.rawTotal, currencyCode: cart.region.currency.code }
    );
  });
}

export default completeActiveCart; 