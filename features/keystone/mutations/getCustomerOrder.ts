async function getCustomerOrder(root, { orderId, secretKey }, context) {
  const sudoContext = context.sudo();
  
  const order = await sudoContext.query.Order.findOne({
    where: { id: orderId },
    query: `
      id
      secretKey
      displayId
      status
      fulfillmentStatus
      fulfillmentDetails
      paymentDetails
      total
      formattedTotalPaid
      subtotal
      shipping
      discount
      tax
      createdAt
      email
      unfulfilled
      fulfillments {
        id
        createdAt
        canceledAt
        fulfillmentItems {
          id
          quantity
          lineItem {
            id
            quantity
            title
            sku
            thumbnail
            metadata
            variantTitle
            formattedUnitPrice
            formattedTotal
            productData
            variantData
          }
        }
        shippingLabels {
          id
          labelUrl
          trackingNumber
          trackingUrl
          carrier
        }
      }
      user {
        id
        name
        email
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
        country {
          id
          iso2
          name
        }
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
        country {
          id
          iso2
          name
        }
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
        thumbnail
        variantTitle
        formattedUnitPrice
        formattedTotal
        variantData
        productData
      }
      region {
        id
        name
        currency {
          code
        }
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