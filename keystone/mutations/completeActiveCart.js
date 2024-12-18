async function completeActiveCart(root, { cartId }, context) {
  const sudoContext = context.sudo();

  // Get cart with all needed data
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      email
      region {
        id
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
        quantity
        unitPrice
        productVariant {
          id
        }
      }
      discounts {
        id
        discountRule {
          type
          value
        }
      }
      billingAddress {
        id
      }
      shippingAddress {
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

  // Calculate order total
  const subtotal = cart.lineItems.reduce((sum, item) => 
    sum + (item.unitPrice * item.quantity), 0);

  let discountAmount = 0;
  if (cart.discounts?.length) {
    for (const discount of cart.discounts) {
      if (discount.discountRule.type === 'percentage') {
        discountAmount += subtotal * (discount.discountRule.value / 100);
      } else if (discount.discountRule.type === 'fixed') {
        discountAmount += discount.discountRule.value;
      }
    }
  }

  const shipping = cart.shippingMethods.reduce((sum, method) => 
    sum + (method.price || 0), 0);

  const total = subtotal - discountAmount + shipping;

  // Create order
  const order = await sudoContext.query.Order.createOne({
    data: {
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
    },
  });

  // Create payment record
  const payment = await sudoContext.query.Payment.createOne({
    data: {
      amount: total,
      currencyCode: cart.region.currency.code,
      paymentProvider: selectedSession.paymentProvider.code,
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
        amount: total,
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

  return {
    id: order.id,
    status: order.status,
    paymentStatus: order.paymentStatus,
    displayId: order.displayId,
    email: order.email,
    payment: {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      capturedAt: payment.capturedAt,
      captures: selectedSession.status === 'authorized' ? [{
        id: payment.id,
        amount: total,
        createdAt: new Date().toISOString(),
      }] : [],
    },
  };
}

export default completeActiveCart; 