async function completeActiveCart(root, { cartId, paymentSessionId }, context) {
  const sudoContext = context.sudo();
  const user = context.session?.itemId;

  // Get cart with all necessary data
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      email
      rawTotal
      user {
        id
        hasAccount
      }
      shippingAddress {
        id
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
      }
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
          product {
            id
            title
            thumbnail
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
          }
        }
      }
    `,
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  // Handle different payment flows
  if (!paymentSessionId) {
    // No payment session = customer token/account flow (Openship)
    return await handleAccountOrder(cart, user, sudoContext);
  } else {
    // Payment session provided = regular storefront order
    return await handlePaidOrder(cart, paymentSessionId, sudoContext);
  }
}

// Handle orders that go to accounts (Openship customer token flow)
async function handleAccountOrder(cart, user, sudoContext) {
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
  
  // CREDIT LIMIT ENFORCEMENT - Convert order to account currency
  const convertCurrency = (await import('../utils/currencyConversion')).default;
  
  // Convert cart total from cart currency to account currency for credit check
  const orderInAccountCurrency = await convertCurrency(
    cart.rawTotal,
    cartCurrency,
    activeAccount.currency.code
  );
  
  // Get current balance in account currency using virtual field
  const accountWithBalance = await sudoContext.query.Account.findOne({
    where: { id: activeAccount.id },
    query: 'availableCreditInAccountCurrency'
  });
  
  const availableCredit = accountWithBalance.availableCreditInAccountCurrency || 0;
  
  if (orderInAccountCurrency > availableCredit) {
    const { formatCurrencyAmount } = await import('../utils/currencyConversion');
    
    const availableCreditFormatted = formatCurrencyAmount(availableCredit, activeAccount.currency.code);
    const requiredCreditFormatted = formatCurrencyAmount(orderInAccountCurrency, activeAccount.currency.code);
    
    throw new Error(
      `Insufficient credit. Available: ${availableCreditFormatted}, Required: ${requiredCreditFormatted}. ` +
      `Please contact billing to increase your credit limit or make a payment.`
    );
  }
  
  // Create order without payment processing
  const order = await createOrderFromCartData(cart, sudoContext);
  
  // Add order to account with transaction safety
  await addOrderToAccount(activeAccount.id, order, sudoContext);
  
  return order;
}

// Handle orders with payment processing (regular storefront)
async function handlePaidOrder(cart, paymentSessionId, sudoContext) {
  // Find the specific payment session by ID
  const selectedSession = cart.paymentCollection?.paymentSessions?.find(
    session => session.id === paymentSessionId
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
  
  // Process payment based on provider
  let paymentResult;
  switch (selectedSession.paymentProvider.code) {
    case 'pp_stripe_stripe':
      paymentResult = await captureStripePayment(selectedSession);
      break;
    case 'pp_paypal_paypal':
      paymentResult = await capturePayPalPayment(selectedSession);
      break;
    case 'pp_system_default':
      // Cash on Delivery - order is placed but payment collected on delivery
      paymentResult = { status: 'manual_pending', paymentIntentId: null };
      break;
    default:
      throw new Error(`Unsupported payment provider: ${selectedSession.paymentProvider.code}`);
  }
  
  if (paymentResult.status !== 'succeeded' && paymentResult.status !== 'manual_pending') {
    throw new Error(`Payment failed: ${paymentResult.error}`);
  }
  
  // Create order and payment record
  const order = await createOrderFromCartData(cart, sudoContext);
  await createPaymentRecord(paymentResult, order, cart, sudoContext);
  
  return order;
}

// Payment processing functions
async function captureStripePayment(session) {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  if (!stripe) {
    throw new Error('Stripe not configured');
  }
  
  try {
    // Get the payment intent from the session data
    const paymentIntentId = session.data.clientSecret?.split('_secret_')[0];
    
    console.log('=== captureStripePayment Debug ===');
    console.log('session.data:', session.data);
    console.log('paymentIntentId:', paymentIntentId);
    
    if (!paymentIntentId) {
      throw new Error('Invalid Stripe payment intent');
    }
    
    // Retrieve the payment intent to check its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log('PaymentIntent status:', paymentIntent.status);
    console.log('PaymentIntent amount:', paymentIntent.amount);
    
    if (paymentIntent.status === 'succeeded') {
      return {
        status: 'succeeded',
        paymentIntentId: paymentIntent.id,
        error: null
      };
    } else if (paymentIntent.status === 'requires_capture') {
      // Capture the payment
      const captured = await stripe.paymentIntents.capture(paymentIntentId);
      return {
        status: captured.status === 'succeeded' ? 'succeeded' : 'failed',
        paymentIntentId: captured.id,
        error: captured.status !== 'succeeded' ? 'Payment capture failed' : null
      };
    } else {
      return {
        status: 'failed',
        paymentIntentId: paymentIntent.id,
        error: `Payment status: ${paymentIntent.status}`
      };
    }
  } catch (error) {
    return {
      status: 'failed',
      paymentIntentId: null,
      error: error.message
    };
  }
}

async function capturePayPalPayment(session) {
  if (!session.data.orderId) {
    return {
      status: 'failed',
      paymentIntentId: null,
      error: 'PayPal order ID not found'
    };
  }

  try {
    // Get PayPal access token
    const authResponse = await fetch(`${process.env.PAYPAL_API_URL || 'https://api.paypal.com'}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!authResponse.ok) {
      throw new Error('PayPal authentication failed');
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Verify the order status with PayPal
    const orderResponse = await fetch(`${process.env.PAYPAL_API_URL || 'https://api.paypal.com'}/v2/checkout/orders/${session.data.orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!orderResponse.ok) {
      throw new Error(`PayPal order verification failed: ${orderResponse.status}`);
    }

    const orderData = await orderResponse.json();
    
    console.log('=== capturePayPalPayment Debug ===');
    console.log('PayPal Order ID:', session.data.orderId);
    console.log('PayPal Order Status:', orderData.status);
    console.log('PayPal Order Amount:', orderData.purchase_units?.[0]?.amount);

    // Verify the order is completed/approved
    if (orderData.status === 'COMPLETED' || orderData.status === 'APPROVED') {
      return {
        status: 'succeeded',
        paymentIntentId: session.data.orderId,
        error: null
      };
    } else {
      return {
        status: 'failed',
        paymentIntentId: session.data.orderId,
        error: `PayPal order status: ${orderData.status}`
      };
    }
  } catch (error) {
    console.error('PayPal verification error:', error);
    return {
      status: 'failed',
      paymentIntentId: session.data.orderId,
      error: error.message
    };
  }
}

// Helper function to add order to account
async function addOrderToAccount(accountId, order, sudoContext) {
  // Get account and order details for validation
  const account = await sudoContext.query.Account.findOne({
    where: { id: accountId },
    query: `
      id
      totalAmount
      currency {
        code
      }
    `
  });

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
    await sudoContext.prisma.$transaction(async (tx) => {
      // Create account line item with region tracking
      await sudoContext.query.AccountLineItem.createOne({
        data: {
          account: { connect: { id: accountId } },
          order: { connect: { id: order.id } },
          region: { connect: { id: orderDetails.region.id } },
          description: `Order #${orderDetails.displayId} - ${orderDetails.lineItems?.length || 0} items`,
          amount: orderDetails.rawTotal || 0,
          orderDisplayId: String(orderDetails.displayId),
          itemCount: orderDetails.lineItems?.length || 0,
          paymentStatus: 'unpaid',
        }
      });
      
      // Update account total atomically
      await sudoContext.query.Account.updateOne({
        where: { id: accountId },
        data: {
          totalAmount: (account.totalAmount || 0) + (orderDetails.rawTotal || 0)
        }
      });
      
      // Connect order to account
      await sudoContext.query.Order.updateOne({
        where: { id: order.id },
        data: {
          account: { connect: { id: accountId } }
        }
      });
    });

    console.log(`Order #${orderDetails.displayId} added to account ${accountId} for ${orderDetails.rawTotal} ${orderDetails.currency.code}`);
    
  } catch (error) {
    console.error('Error adding order to account:', error);
    throw new Error(`Failed to add order to account: ${error.message}`);
  }
}

// Helper function to create payment record
async function createPaymentRecord(paymentResult, order, cart, sudoContext) {
  const selectedSession = cart.paymentCollection?.paymentSessions?.[0];
  
  await sudoContext.query.Payment.createOne({
    data: {
      status: paymentResult.status === 'succeeded' ? 'captured' : 'pending',
      amount: cart.rawTotal,
      currencyCode: cart.region.currency.code,
      data: {
        ...selectedSession.data,
        paymentIntentId: paymentResult.paymentIntentId
      },
      capturedAt: paymentResult.status === 'succeeded' ? new Date().toISOString() : null,
      paymentCollection: { connect: { id: cart.paymentCollection.id } },
      order: { connect: { id: order.id } },
      user: order.user?.id ? { connect: { id: order.user.id } } : undefined,
    },
  });
}

// Extract order creation logic to reuse
async function createOrderFromCartData(cart, sudoContext) {

  // Get user from cart or shipping address
  const userId = cart.user?.id || cart.shippingAddress?.user?.id;
  const hasAccount = cart.user?.hasAccount || cart.shippingAddress?.user?.hasAccount || false;

  // Generate a secretKey only for guest orders (no authenticated user)
  const secretKey = !userId ? 
    require('crypto').randomBytes(32).toString('hex') : 
    undefined;

  const formatCurrency = (amount, currencyCode) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(amount / 100);
  };

  // Create OrderLineItems and OrderMoneyAmounts first
  const orderLineItems = [];
  for (const lineItem of cart.lineItems) {
    // Create OrderMoneyAmount first
    const prices = await sudoContext.query.MoneyAmount.findMany({
      where: {
        productVariant: { id: { equals: lineItem.productVariant.id } },
        region: { id: { equals: cart.region.id } },
        currency: { code: { equals: cart.region.currency.code } },
      },
      query: `
        id
        calculatedPrice {
          calculatedAmount
          originalAmount
          currencyCode
        }
      `,
    });

    const price = prices[0]?.calculatedPrice;
    if (!price) {
      throw new Error(`No valid price found for variant ${lineItem.productVariant.id} in region ${cart.region.id}`);
    }

    const orderMoneyAmount = await sudoContext.query.OrderMoneyAmount.createOne({
      data: {
        amount: price.calculatedAmount,
        originalAmount: price.originalAmount,
        currency: { connect: { id: cart.region.currency.id } },
        region: { connect: { id: cart.region.id } },
        priceData: {
          prices: lineItem.productVariant.prices,
          currencyCode: cart.region.currency.code,
          regionId: cart.region.id,
          taxRate: cart.region.taxRate,
        },
        metadata: lineItem.metadata,
      },
    });

    // Create OrderLineItem with snapshot data
    const orderLineItem = await sudoContext.query.OrderLineItem.createOne({
      data: {
        quantity: lineItem.quantity,
        title: lineItem.productVariant.product.title,
        sku: lineItem.productVariant.sku,
        metadata: lineItem.metadata,
        productData: {
          id: lineItem.productVariant.product.id,
          title: lineItem.productVariant.product.title,
          thumbnail: lineItem.productVariant.product.thumbnail,
          description: lineItem.productVariant.product.description,
          metadata: lineItem.productVariant.product.metadata,
        },
        variantData: {
          id: lineItem.productVariant.id,
          sku: lineItem.productVariant.sku,
          title: lineItem.productVariant.title,
          measurements: lineItem.productVariant.measurements || []
        },
        variantTitle: lineItem.productVariant.title,
        formattedUnitPrice: lineItem.unitPrice,
        formattedTotal: lineItem.total,
        productVariant: { connect: { id: lineItem.productVariant.id } },
        originalLineItem: { connect: { id: lineItem.id } },
        moneyAmount: { connect: { id: orderMoneyAmount.id } },
      },
    });

    orderLineItems.push(orderLineItem);
  }

  // Create order with the new OrderLineItems
  const order = await sudoContext.query.Order.createOne({
    data: {
      cart: { connect: { id: cart.id } },
      email: cart.email,
      user: userId ? { connect: { id: userId } } : undefined,
      region: { connect: { id: cart.region.id } },
      currency: { connect: { code: cart.region.currency.code } },
      billingAddress: { connect: { id: cart.billingAddress.id } },
      shippingAddress: { connect: { id: cart.shippingAddress.id } },
      discounts: { connect: cart.discounts.map(d => ({ id: d.id })) },
      shippingMethods: { connect: cart.shippingMethods.map(sm => ({ id: sm.id })) },
      lineItems: { connect: orderLineItems.map(li => ({ id: li.id })) },
      status: "pending",
      displayId: Math.floor(Date.now() / 1000),
      taxRate: cart.region.taxRate || 0,
      secretKey,
      events: {
        create: {
          type: "ORDER_PLACED",
          data: {
            cartId: cart.id,
            isGuestOrder: !hasAccount
          },
        },
      },
    },
  });

  // Payment creation is now handled separately in createPaymentRecord()

  // Update cart with order reference
  await sudoContext.query.Cart.updateOne({
    where: { id: cart.id },
    data: {
      order: { connect: { id: order.id } },
    },
  });

  // Get the created order with all necessary fields
  const createdOrder = await sudoContext.query.Order.findOne({
    where: { id: order.id },
    query: `
      id
      status
      displayId
      secretKey
      subtotal
      total
      shipping
      discount
      tax
      paymentDetails
      shippingAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        country {
          id
          iso2
        }
        phone
      }
    `
  });

  return createdOrder;
}

export default completeActiveCart; 