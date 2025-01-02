async function completeActiveCart(root, { cartId }, context) {
  const sudoContext = context.sudo();

  // Get cart with all needed data and total
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      email
      rawTotal
      region {
        id
        taxRate
        currency {
          code
        }
      }
      paymentCollection {
        id
        status
        amount
        paymentSessions {
          id
          status
          isSelected
          paymentProvider {
            id
            code
          }
          data
        }
      }
      shippingMethods {
        id
        price
      }
      lineItems {
        id
        title
        quantity
        unitPrice
        productVariant {
          id
        }
      }
      discounts {
        id
      }
      billingAddress {
        id
        countryCode
      }
      shippingAddress {
        id
        countryCode
      }
      user {
        id
      }
    `
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  // Validate cart has required data
  if (!cart.email) throw new Error("Email is required");
  if (!cart.region) throw new Error("Region is required");
  if (!cart.shippingMethods?.length) throw new Error("Shipping method is required");
  if (!cart.lineItems?.length) throw new Error("Cart is empty");
  if (!cart.billingAddress) throw new Error("Billing address is required");
  if (!cart.shippingAddress) throw new Error("Shipping address is required");
  
  // Check payment collection and session status
  if (!cart.paymentCollection) {
    throw new Error("Payment collection is required");
  }

  const selectedSession = cart.paymentCollection.paymentSessions?.find(s => s.isSelected);
  if (!selectedSession) {
    throw new Error("Payment method is required");
  }

  if (selectedSession.status === 'error') {
    throw new Error("Payment session has error status");
  }

  // Create order with all necessary data
  const orderData = {
    cart: { connect: { id: cartId } },
    email: cart.email,
    region: { connect: { id: cart.region.id } },
    currency: { connect: { code: cart.region.currency.code } },
    billingAddress: { connect: { id: cart.billingAddress.id } },
    shippingAddress: { connect: { id: cart.shippingAddress.id } },
    discounts: { connect: cart.discounts.map(d => ({ id: d.id })) },
    shippingMethods: { connect: cart.shippingMethods.map(sm => ({ id: sm.id })) },
    lineItems: { connect: cart.lineItems.map(li => ({ id: li.id })) },
    status: "pending",
    paymentStatus: selectedSession.status === 'authorized' ? 'captured' : 'awaiting',
    fulfillmentStatus: "not_fulfilled",
    displayId: Math.floor(Date.now() / 1000), // Unix timestamp as display ID
    taxRate: cart.region.taxRate || 0,
  };

  // Connect user if available
  if (cart.user?.id) {
    orderData.user = { connect: { id: cart.user.id } };
  }

  const order = await sudoContext.query.Order.createOne({
    data: orderData
  });

  // Create payment record
  const payment = await sudoContext.query.Payment.createOne({
    data: {
      amount: cart.rawTotal,
      currencyCode: cart.region.currency.code,
      order: { connect: { id: order.id } },
      paymentCollection: { connect: { id: cart.paymentCollection.id } },
      data: selectedSession.data,
      status: selectedSession.status === 'authorized' ? 'captured' : 'pending',
      capturedAt: selectedSession.status === 'authorized' ? new Date().toISOString() : null,
    },
  });

  // If payment is authorized, create a capture record
  if (selectedSession.status === 'authorized') {
    await sudoContext.query.Capture.createOne({
      data: {
        amount: cart.rawTotal,
        payment: { connect: { id: payment.id } },
        metadata: {
          provider: selectedSession.paymentProvider.code,
          sessionId: selectedSession.id,
        },
        createdBy: 'system',
      },
    });
  }

  // Update cart status
  await sudoContext.query.Cart.updateOne({
    where: { id: cartId },
    data: { 
      order: { connect: { id: order.id } }
    }
  });

  // Get the created order with all necessary fields
  const createdOrder = await sudoContext.query.Order.findOne({
    where: { id: order.id },
    query: `
      id
      status
      paymentStatus
      displayId
      secretKey
      subtotal
      total
      shipping
      discount
      tax
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
        countryCode
        phone
      }
    `
  });

  return createdOrder;
}

export default completeActiveCart; 