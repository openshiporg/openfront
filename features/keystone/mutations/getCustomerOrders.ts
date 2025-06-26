async function getCustomerOrders(root, { limit = 10, offset = 0 }, context) {
  if (!context.session?.itemId) {
    throw new Error('Not authenticated');
  }

  const sudoContext = context.sudo();
  
  const orders = await sudoContext.query.Order.findMany({
    where: { 
      user: { id: { equals: context.session.itemId } }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    query: `
      id
      displayId
      status
      fulfillmentStatus
      total
      createdAt
      shippingAddress {
        country {
          id
          iso2
        }
      }
      lineItems {
        id
        title
        quantity
        thumbnail
      }
      region {
        id
        currency {
          code
        }
      }
    `
  });

  return orders;
}

export default getCustomerOrders; 