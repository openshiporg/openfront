async function completeActiveCart(root, { cartId }, context) {
  const sudoContext = context.sudo();

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

  // Get user from cart or shipping address
  const userId = cart.user?.id || cart.shippingAddress?.user?.id;
  const hasAccount = cart.user?.hasAccount || cart.shippingAddress?.user?.hasAccount || false;

  // Generate a secretKey for guest orders
  const secretKey = !hasAccount ? 
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
      cart: { connect: { id: cartId } },
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
            cartId,
            isGuestOrder: !hasAccount
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
      user: userId ? { connect: { id: userId } } : undefined,
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