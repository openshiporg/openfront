async function getCustomerOrder(root, { orderId, secretKey }, context) {
  const sudoContext = context.sudo();
  
  const order = await sudoContext.query.Order.findOne({
    where: { id: orderId },
    query: `
      id
      secretKey
      displayId
      status
      paymentStatus
      fulfillmentStatus
      total
      subtotal
      shipping
      discount
      tax
      createdAt
      email
      user {
        id
      }
      shippingAddress {
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
      billingAddress {
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
      shippingMethods {
        id
        price
        shippingOption {
          name
        }
      }
      payments {
        id
        amount
        status
        data
        createdAt
        paymentCollection {
          paymentSessions {
            id
            isSelected
            paymentProvider {
              id
              code
            }
          }
        }
      }
      lineItems {
        id
        title
        quantity
        unitPrice
        total
        productVariant {
          id
          title
          sku
          product {
            thumbnail
            title
            handle
          }
        }
      }
      region {
        id
        name
      }
    `
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // If secretKey is provided, verify it matches
  if (secretKey) {
    if (order.secretKey !== secretKey) {
      throw new Error('Invalid secret key');
    }
    return order;
  }

  // If no secretKey, check user authentication
  if (!context.session?.itemId) {
    throw new Error('Not authenticated');
  }

  // Verify the order belongs to the user
  if (order.user?.id !== context.session.itemId) {
    throw new Error('Order not found');
  }

  return order;
}

export default getCustomerOrder; 