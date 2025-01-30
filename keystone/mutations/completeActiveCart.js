async function completeActiveCart(root, { cartId }, context) {
  const sudoContext = context.sudo();

  // Get cart with payment session and collection
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
      }
      paymentCollection {
        id
        amount
        paymentSessions(where: { isSelected: { equals: true }}) {
          id
          amount
          data
          paymentProvider {
            id
          }
        }
      }
    `,
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  const selectedSession = cart.paymentCollection?.paymentSessions?.[0];
  if (!selectedSession) {
    throw new Error("No payment session selected");
  }

  // Create order (payment status will be set by Payment hooks)
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
      displayId: Math.floor(Date.now() / 1000),
      taxRate: cart.region.taxRate || 0,
      events: {
        create: {
          type: "ORDER_PLACED",
          data: {
            cartId,
          },
        },
      },
    },
  });

  // Create payment record (which will trigger hooks to update order status)
  await sudoContext.query.Payment.createOne({
    data: {
      status: "captured",
      amount: cart.rawTotal,
      currencyCode: cart.region.currency.code,
      data: selectedSession.data,
      capturedAt: new Date().toISOString(),
      paymentCollection: { connect: { id: cart.paymentCollection.id } },
      order: { connect: { id: order.id } },
    },
  });

  // Update cart with order reference
  await sudoContext.query.Cart.updateOne({
    where: { id: cartId },
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