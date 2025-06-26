async function getAnalytics(root, { timeframe = '7d' }, context) {
  // Calculate date range based on timeframe
  const endDate = new Date();
  const startDate = new Date();
  switch (timeframe) {
    case '24h':
      startDate.setDate(startDate.getDate() - 1);
      break;
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }

  const sudoContext = context.sudo();

  // Get orders within date range with correct field names and relationships
  const orders = await sudoContext.query.Order.findMany({
    where: { createdAt: { gte: startDate.toISOString(), lte: endDate.toISOString() } },
    query: `
      id
      status
      fulfillmentStatus
      paymentStatus
      createdAt
      user {
        id
      }
      total
      subtotal
      shipping
      tax
      discount
      lineItems {
        id
        quantity
        title
        variantData
        productData
        moneyAmount {
          amount
        }
      }
      payments {
        id
        amount
        status
      }
      returns {
        id
        status
        refundAmount
      }
      shippingMethods {
        id
        price
        shippingOption {
          name
          fulfillmentProvider {
            id
          }
        }
      }
    `,
  });

  // Calculate sales metrics
  const salesMetrics = orders.reduce((acc, order) => {
    const total = parseFloat(order.total || '0');
    const subtotal = parseFloat(order.subtotal || '0');
    const shipping = parseFloat(order.shipping || '0');
    const tax = parseFloat(order.tax || '0');
    const discount = parseFloat(order.discount || '0');
    const refunds = order.returns?.reduce((sum, ret) => sum + (ret.refundAmount || 0), 0) || 0;

    acc.total += total;
    acc.subtotal += subtotal;
    acc.shipping += shipping;
    acc.tax += tax;
    acc.discount += discount;
    acc.refunds += refunds;
    acc.count += 1;
    return acc;
  }, { total: 0, subtotal: 0, shipping: 0, tax: 0, discount: 0, refunds: 0, count: 0 });

  salesMetrics.averageOrderValue = salesMetrics.count > 0 
    ? salesMetrics.total / salesMetrics.count 
    : 0;

  // Calculate order timeline
  const ordersByDay = orders.reduce((acc, order) => {
    const date = new Date(order.createdAt).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        total: 0,
        subtotal: 0,
        shipping: 0,
        tax: 0,
        discount: 0,
        refunds: 0,
        count: 0,
      };
    }
    const total = parseFloat(order.total || '0');
    const subtotal = parseFloat(order.subtotal || '0');
    const shipping = parseFloat(order.shipping || '0');
    const tax = parseFloat(order.tax || '0');
    const discount = parseFloat(order.discount || '0');
    const refunds = order.returns?.reduce((sum, ret) => sum + (ret.refundAmount || 0), 0) || 0;

    acc[date].total += total;
    acc[date].subtotal += subtotal;
    acc[date].shipping += shipping;
    acc[date].tax += tax;
    acc[date].discount += discount;
    acc[date].refunds += refunds;
    acc[date].count += 1;
    return acc;
  }, {});

  const orderTimeline = Object.entries(ordersByDay).map(([date, metrics]) => ({
    date,
    ...metrics
  })).sort((a, b) => a.date.localeCompare(b.date));

  // Get product inventory metrics
  const products = await sudoContext.query.Product.findMany({
    query: `
      id
      title
      status
      productVariants {
        id
        title
        inventoryQuantity
        prices {
          amount
          currency {
            code
          }
        }
      }
    `,
  });

  const inventoryMetrics = products.reduce((acc, product) => {
    const variants = product.productVariants || [];
    const isOutOfStock = variants.every(v => v.inventoryQuantity === 0);
    const isLowStock = variants.some(v => v.inventoryQuantity > 0 && v.inventoryQuantity < 10);
    const totalValue = variants.reduce((sum, v) => {
      const price = v.prices?.[0]?.amount || 0;
      return sum + (v.inventoryQuantity * price);
    }, 0);

    if (isOutOfStock) acc.outOfStock += 1;
    if (isLowStock) acc.lowStock += 1;
    acc.total += 1;
    acc.totalValue += totalValue;
    acc.totalStock += variants.reduce((sum, v) => sum + (v.inventoryQuantity || 0), 0);

    return acc;
  }, { total: 0, outOfStock: 0, lowStock: 0, totalValue: 0, totalStock: 0 });

  // Calculate top products by sales and revenue
  const productMetrics = {};
  orders.forEach(order => {
    order.lineItems?.forEach(item => {
      const productId = item.productData?.id;
      const productTitle = item.productData?.title;
      if (!productId) return;

      if (!productMetrics[productId]) {
        productMetrics[productId] = {
          id: productId,
          title: productTitle,
          status: item.productData?.status,
          quantity: 0,
          revenue: 0,
          orders: new Set(),
        };
      }

      productMetrics[productId].quantity += item.quantity;
      productMetrics[productId].revenue += item.quantity * (item.moneyAmount?.amount || 0);
      productMetrics[productId].orders.add(order.id);
    });
  });

  const topProducts = Object.values(productMetrics)
    .map(p => ({
      ...p,
      orderCount: p.orders.size,
      averageOrderValue: p.revenue / p.orders.size,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Get customer metrics
  const users = await sudoContext.query.User.findMany({
    where: { createdAt: { gte: startDate.toISOString(), lte: endDate.toISOString() } },
    query: `
      id
      createdAt
      orders {
        id
        total
        createdAt
      }
    `,
  });

  const totalUsers = await sudoContext.query.User.count();
  const newUsers = users.length;

  // Calculate customer metrics
  const customerMetrics = users.reduce((acc, user) => {
    const userOrders = user.orders || [];
    if (userOrders.length > 0) {
      acc.activeUsers += 1;
      acc.totalRevenue += userOrders.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0);
    }
    return acc;
  }, { activeUsers: 0, totalRevenue: 0 });

  // Calculate shipping metrics
  const shippingMetrics = orders.reduce((acc, order) => {
    order.shippingMethods?.forEach(method => {
      const provider = method.shippingOption?.fulfillmentProvider?.id;
      const name = method.shippingOption?.name;
      if (provider && name) {
        const key = `${provider}-${name}`;
        if (!acc.methods[key]) {
          acc.methods[key] = {
            provider,
            name,
            count: 0,
            total: 0,
          };
        }
        acc.methods[key].count += 1;
        acc.methods[key].total += parseFloat(method.price || '0');
      }
    });
    return acc;
  }, { methods: {} });

  return {
    sales: {
      total: salesMetrics.total,
      subtotal: salesMetrics.subtotal,
      shipping: salesMetrics.shipping,
      tax: salesMetrics.tax,
      discount: salesMetrics.discount,
      refunds: salesMetrics.refunds,
      count: salesMetrics.count,
      averageOrderValue: salesMetrics.averageOrderValue,
      timeline: orderTimeline,
    },
    inventory: {
      total: inventoryMetrics.total,
      outOfStock: inventoryMetrics.outOfStock,
      lowStock: inventoryMetrics.lowStock,
      totalValue: inventoryMetrics.totalValue,
      totalStock: inventoryMetrics.totalStock,
      topProducts,
    },
    customers: {
      total: totalUsers,
      new: newUsers,
      active: customerMetrics.activeUsers,
      averageLifetimeValue: totalUsers > 0 ? customerMetrics.totalRevenue / totalUsers : 0,
      timeline: orderTimeline.map(day => ({
        date: day.date,
        newUsers: users.filter(u => u.createdAt.split('T')[0] === day.date).length,
      })),
    },
    orders: {
      total: salesMetrics.count,
      byStatus: orders.reduce((acc, order) => {
        const status = order.status?.toLowerCase();
        if (status) acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
      byFulfillmentStatus: orders.reduce((acc, order) => {
        const status = order.fulfillmentStatus?.toLowerCase();
        if (status) acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
      byPaymentStatus: orders.reduce((acc, order) => {
        const status = order.paymentStatus?.toLowerCase();
        if (status) acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
      timeline: orderTimeline,
    },
    shipping: {
      total: salesMetrics.shipping,
      methods: Object.values(shippingMetrics.methods)
        .sort((a, b) => b.count - a.count),
    },
  };
}

export default getAnalytics; 