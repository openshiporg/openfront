import { startOfDay, endOfDay, subDays, subMonths, format, eachDayOfInterval, eachMonthOfInterval } from 'date-fns';

export interface Order {
  id: string;
  displayId: number;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  status: string;
  createdAt: string;
  currency: { code: string };
  lineItems: LineItem[];
  user?: { id: string; email: string };
}

export interface LineItem {
  id: string;
  quantity: number;
  unitPrice: number;
  total: number;
  productVariant: {
    id: string;
    product: {
      id: string;
      title: string;
      productCategories?: { id: string; title: string }[];
    };
  };
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
  orders: Order[];
}

export interface Cart {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  subtotal: number;
  order?: { id: string; status: string };
  lineItems: LineItem[];
}

export interface Fulfillment {
  id: string;
  shippedAt?: string;
  canceledAt?: string;
  createdAt: string;
  order: {
    id: string;
    createdAt: string;
    status: string;
  };
}

export interface ShippingLabel {
  id: string;
  status: string;
  createdAt: string;
  trackingNumber: string;
}

export interface Return {
  id: string;
  status: string;
  createdAt: string;
}

// Date range utilities
export const getDateRange = (period: string) => {
  const endDate = endOfDay(new Date());
  let startDate: Date;

  switch (period) {
    case '7d':
      startDate = startOfDay(subDays(new Date(), 6));
      break;
    case '30d':
      startDate = startOfDay(subDays(new Date(), 29));
      break;
    case '90d':
      startDate = startOfDay(subDays(new Date(), 89));
      break;
    case '12m':
      startDate = startOfDay(subMonths(new Date(), 12));
      break;
    default:
      startDate = startOfDay(subDays(new Date(), 29));
  }

  return { 
    startDate: startDate.toISOString(), 
    endDate: endDate.toISOString() 
  };
};

// Get previous period date range for comparison
export const getPreviousPeriodRange = (period: string, customStartDate?: string, customEndDate?: string) => {
  if (customStartDate && customEndDate) {
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    const previousEndDate = endOfDay(subDays(start, 1));
    const previousStartDate = startOfDay(subDays(start, diffDays));
    
    return {
      startDate: previousStartDate.toISOString(),
      endDate: previousEndDate.toISOString()
    };
  }

  const currentRange = getDateRange(period);
  const currentStart = new Date(currentRange.startDate);
  
  let previousStartDate: Date;
  let previousEndDate: Date;

  switch (period) {
    case '7d':
      previousEndDate = endOfDay(subDays(currentStart, 1));
      previousStartDate = startOfDay(subDays(currentStart, 7));
      break;
    case '30d':
      previousEndDate = endOfDay(subDays(currentStart, 1));
      previousStartDate = startOfDay(subDays(currentStart, 30));
      break;
    case '90d':
      previousEndDate = endOfDay(subDays(currentStart, 1));
      previousStartDate = startOfDay(subDays(currentStart, 90));
      break;
    case '12m':
      previousEndDate = endOfDay(subDays(currentStart, 1));
      previousStartDate = startOfDay(subMonths(currentStart, 12));
      break;
    default:
      previousEndDate = endOfDay(subDays(currentStart, 1));
      previousStartDate = startOfDay(subDays(currentStart, 30));
  }

  return {
    startDate: previousStartDate.toISOString(),
    endDate: previousEndDate.toISOString()
  };
};

// Calculate percentage change between two values
export const calculatePercentageChange = (current: number, previous: number): { value: number; isPositive: boolean } => {
  if (previous === 0) {
    return { value: current > 0 ? 100 : 0, isPositive: current >= 0 };
  }
  
  const change = ((current - previous) / previous) * 100;
  return { 
    value: Math.abs(change), 
    isPositive: change >= 0 
  };
};

// Sales metrics calculations
export const calculateSalesMetrics = (orders: any[], previousOrders?: any[]) => {
  const totalOrders = orders.length;
  // rawTotal is a virtual field and might not be included in the query
  // We need to calculate it from line items if not available
  const totalRevenue = orders.reduce((sum, order) => {
    if (order.rawTotal) {
      return sum + order.rawTotal;
    }
    // Fallback: calculate from line items
    let orderTotal = 0;
    (order.lineItems || []).forEach((item: any) => {
      const unitPrice = parseFloat(item.formattedUnitPrice?.replace(/[^0-9.-]/g, '') || '0') * 100;
      orderTotal += unitPrice * item.quantity;
    });
    return sum + orderTotal;
  }, 0);
  
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalQuantitySold = orders.reduce((sum, order) => 
    sum + (order.lineItems || []).reduce((itemSum: number, item: any) => itemSum + item.quantity, 0), 0
  );

  // Calculate previous period metrics if provided
  let previousRevenue = 0;
  let previousOrdersCount = 0;
  let previousAOV = 0;

  if (previousOrders && previousOrders.length > 0) {
    previousOrdersCount = previousOrders.length;
    previousRevenue = previousOrders.reduce((sum, order) => {
      if (order.rawTotal) {
        return sum + order.rawTotal;
      }
      // Fallback: calculate from line items
      let orderTotal = 0;
      (order.lineItems || []).forEach((item: any) => {
        const unitPrice = parseFloat(item.formattedUnitPrice?.replace(/[^0-9.-]/g, '') || '0') * 100;
        orderTotal += unitPrice * item.quantity;
      });
      return sum + orderTotal;
    }, 0);
    previousAOV = previousOrdersCount > 0 ? previousRevenue / previousOrdersCount : 0;
  }

  // Group by day for trend analysis
  const dailyRevenue = orders.reduce((acc, order) => {
    const date = format(new Date(order.createdAt), 'yyyy-MM-dd');
    const orderTotal = order.rawTotal || 0;
    acc[date] = (acc[date] || 0) + orderTotal;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalOrders,
    totalRevenue,
    averageOrderValue,
    totalQuantitySold,
    dailyRevenue,
    previousRevenue,
    previousOrders: previousOrdersCount,
    previousAOV,
  };
};

// Customer analytics calculations
export const calculateCustomerMetrics = (users: any[], orders: any[]) => {
  const totalCustomers = users.length;
  
  // Calculate new vs returning customers
  const customerFirstOrders = new Map();
  orders.forEach(order => {
    if (order.user?.id) {
      const existing = customerFirstOrders.get(order.user.id);
      if (!existing || new Date(order.createdAt) < new Date(existing.createdAt)) {
        customerFirstOrders.set(order.user.id, order);
      }
    }
  });

  const newCustomers = Array.from(customerFirstOrders.values()).length;
  const returningCustomers = totalCustomers - newCustomers;

  // Calculate customer lifetime value
  const customerValues = users.map(user => ({
    id: user.id,
    email: user.email,
    totalSpent: (user.orders || []).reduce((sum: number, order: any) => 
      sum + (parseFloat(order.total?.replace(/[^0-9.-]/g, '') || '0') * 100), 0),
    orderCount: (user.orders || []).length,
    firstOrderDate: (user.orders || []).length > 0 ? 
      new Date(Math.min(...user.orders.map((o: any) => new Date(o.createdAt).getTime()))) : null,
    lastOrderDate: (user.orders || []).length > 0 ? 
      new Date(Math.max(...user.orders.map((o: any) => new Date(o.createdAt).getTime()))) : null,
  }));

  const averageCustomerLifetimeValue = customerValues.length > 0 ? 
    customerValues.reduce((sum, customer) => sum + customer.totalSpent, 0) / customerValues.length : 0;

  // Calculate retention rate (customers who made more than one order)
  const retainedCustomers = customerValues.filter(c => c.orderCount > 1).length;
  const retentionRate = totalCustomers > 0 ? (retainedCustomers / totalCustomers) * 100 : 0;

  return {
    totalCustomers,
    newCustomers,
    returningCustomers,
    averageCustomerLifetimeValue,
    retentionRate,
    customerValues: customerValues.sort((a, b) => b.totalSpent - a.totalSpent),
  };
};

// Product performance calculations
export const calculateProductMetrics = (orderLineItems: any[]) => {
  // Safety check
  if (!orderLineItems || !Array.isArray(orderLineItems)) {
    console.warn('calculateProductMetrics: orderLineItems is not an array:', orderLineItems);
    return [];
  }
  
  // Group by product
  const productMap = new Map();
  
  orderLineItems.forEach(item => {
    const productId = item.productVariant?.product?.id;
    if (!productId) return;
    
    if (!productMap.has(productId)) {
      productMap.set(productId, {
        id: productId,
        title: item.productVariant.product.title,
        status: item.productVariant.product.status,
        totalQuantitySold: 0,
        totalRevenue: 0,
        orderCount: 0,
        categories: item.productVariant.product.productCategories || []
      });
    }
    
    const product = productMap.get(productId);
    product.totalQuantitySold += item.quantity;
    product.totalRevenue += parseFloat(item.formattedTotal?.replace(/[^0-9.-]/g, '') || '0') * 100;
    product.orderCount += 1;
  });

  const productPerformance = Array.from(productMap.values());
  return productPerformance.sort((a, b) => b.totalRevenue - a.totalRevenue);
};

// Cart abandonment calculations
export const calculateCartMetrics = (
  carts: any[], 
  completedOrders: number = 0, 
  previousCarts?: any[], 
  previousCompletedOrders?: number
) => {
  const totalCarts = carts.length;
  const completedCarts = completedOrders;
  const abandonedCarts = totalCarts - completedCarts;
  const abandonmentRate = totalCarts > 0 ? (abandonedCarts / totalCarts) * 100 : 0;
  const conversionRate = totalCarts > 0 ? (completedCarts / totalCarts) * 100 : 0;

  const averageCartValue = carts.length > 0 ? 
    carts.reduce((sum, cart) => {
      // Use rawTotal if available and not null, which is already in smallest currency unit
      // Filter out carts with null rawTotal (carts without regions)
      const cartTotal = cart.rawTotal != null ? cart.rawTotal : 0;
      return sum + cartTotal;
    }, 0) / carts.length : 0;

  // Calculate previous period metrics
  let previousConversionRate = 0;
  if (previousCarts && previousCompletedOrders !== undefined) {
    const previousTotalCarts = previousCarts.length;
    previousConversionRate = previousTotalCarts > 0 ? (previousCompletedOrders / previousTotalCarts) * 100 : 0;
  }

  return {
    totalCarts,
    completedCarts,
    abandonedCarts,
    abandonmentRate,
    conversionRate,
    averageCartValue,
    previousConversionRate,
  };
};

// Category performance calculations
export const calculateCategoryMetrics = (orderLineItems: any[]) => {
  // Safety check
  if (!orderLineItems || !Array.isArray(orderLineItems)) {
    console.warn('calculateCategoryMetrics: orderLineItems is not an array:', orderLineItems);
    return [];
  }
  
  // Group by category
  const categoryMap = new Map();
  
  orderLineItems.forEach(item => {
    const categories = item.productVariant?.product?.productCategories || [];
    categories.forEach((category: any) => {
      if (!categoryMap.has(category.id)) {
        categoryMap.set(category.id, {
          id: category.id,
          name: category.title,
          totalRevenue: 0,
          totalQuantitySold: 0,
          productCount: new Set()
        });
      }
      
      const cat = categoryMap.get(category.id);
      cat.totalRevenue += parseFloat(item.formattedTotal?.replace(/[^0-9.-]/g, '') || '0') * 100;
      cat.totalQuantitySold += item.quantity;
      cat.productCount.add(item.productVariant.product.id);
    });
  });

  const categoryPerformance = Array.from(categoryMap.values()).map(category => ({
    ...category,
    productCount: category.productCount.size
  }));

  return categoryPerformance.sort((a, b) => b.totalRevenue - a.totalRevenue);
};

// Utility functions
export const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount / 100); // Assuming amounts are in cents
};



export const formatPercentage = (value: number, decimals: number = 1) => {
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number, decimals: number = 0) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

// Regional and Currency Utilities

export interface Region {
  id: string;
  code: string;
  name: string;
  currency: {
    code: string;
    symbol: string;
    name: string;
  };
}

export interface RegionalMetrics {
  region: Region;
  metrics: {
    totalRevenue: number; // in region's native currency (cents)
    totalOrders: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  revenueInBaseCurrency: number; // converted to store default (USD, cents)
}

// Simple currency conversion rates (in real app, this would come from an API)
const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  usd: { usd: 1, eur: 0.85, gbp: 0.73 },
  eur: { usd: 1.18, eur: 1, gbp: 0.86 },
  gbp: { usd: 1.37, eur: 1.16, gbp: 1 }
};

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;
  
  const fromRates = EXCHANGE_RATES[fromCurrency.toLowerCase()];
  if (!fromRates) return amount; // If we don't have rates, return original
  
  const rate = fromRates[toCurrency.toLowerCase()];
  if (!rate) return amount; // If we don't have the target rate, return original
  
  return Math.round(amount * rate);
};

export const formatRegionalCurrency = (
  amount: number, 
  currencyCode: string, 
  symbol: string
) => {
  const value = amount / 100; // Convert from cents
  return `${symbol}${value.toLocaleString('en-US', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })}`;
};

export const getRegionFlag = (regionCode: string): string => {
  const flags: Record<string, string> = {
    'na': '🇺🇸',
    'eu': '🇪🇺', 
    'uk': '🇬🇧',
  };
  return flags[regionCode] || '🌍';
};

// Calculate regional metrics from order data
export const calculateRegionalMetrics = (
  orders: any[],
  regions: Region[]
): RegionalMetrics[] => {
  const regionalData: RegionalMetrics[] = [];

  regions.forEach(region => {
    const regionOrders = orders.filter(order => 
      order.region?.code === region.code && 
      order.status !== 'canceled'
    );

    const totalRevenue = regionOrders.reduce((sum, order) => sum + (order.rawTotal || 0), 0);
    const totalOrders = regionOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Convert to base currency (USD) for comparison
    const revenueInBaseCurrency = convertCurrency(
      totalRevenue,
      region.currency.code,
      'usd'
    );

    regionalData.push({
      region,
      metrics: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        conversionRate: 0, // Will be calculated separately if needed
      },
      revenueInBaseCurrency,
    });
  });

  return regionalData.sort((a, b) => b.revenueInBaseCurrency - a.revenueInBaseCurrency);
};

// Time series data for charts
export const generateTimeSeriesData = (
  orders: any[], 
  startDate: string | Date, 
  endDate: string | Date, 
  interval: 'day' | 'month' = 'day'
) => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const dates = interval === 'day' 
    ? eachDayOfInterval({ start, end })
    : eachMonthOfInterval({ start, end });

  const dataMap = orders.reduce((acc, order) => {
    const key = format(new Date(order.createdAt), interval === 'day' ? 'yyyy-MM-dd' : 'yyyy-MM');
    if (!acc[key]) {
      acc[key] = { revenue: 0, orders: 0, customers: new Set() };
    }
    
    // Calculate order total
    let orderTotal = 0;
    if (order.rawTotal) {
      orderTotal = order.rawTotal;
    } else if (order.total) {
      // If total is a formatted string, parse it
      orderTotal = parseFloat(order.total.replace(/[^0-9.-]/g, '') || '0') * 100;
    } else {
      // Fallback: calculate from line items
      (order.lineItems || []).forEach((item: any) => {
        const unitPrice = parseFloat(item.formattedUnitPrice?.replace(/[^0-9.-]/g, '') || '0') * 100;
        orderTotal += unitPrice * item.quantity;
      });
    }
    
    acc[key].revenue += orderTotal;
    acc[key].orders += 1;
    if (order.user?.id) {
      acc[key].customers.add(order.user.id);
    }
    return acc;
  }, {} as Record<string, { revenue: number; orders: number; customers: Set<string> }>);

  return dates.map(date => {
    const key = format(date, interval === 'day' ? 'yyyy-MM-dd' : 'yyyy-MM');
    const data = dataMap[key] || { revenue: 0, orders: 0, customers: new Set() };
    
    return {
      date: key,
      revenue: data.revenue,
      orders: data.orders,
      customers: data.customers.size,
    };
  });
};

/**
 * Calculate fulfillment metrics from fulfillment data
 */
export const calculateFulfillmentMetrics = (
  fulfillments: Fulfillment[],
  shippedCount: number,
  canceledCount: number,
  activeShippingLabels: number,
  returns: Return[],
  totalOrders: number
) => {
  if (!fulfillments.length) {
    return {
      totalFulfillments: 0,
      shippedFulfillments: 0,
      pendingFulfillments: 0,
      canceledFulfillments: 0,
      averageFulfillmentTime: 0,
      onTimeDeliveryRate: 0,
      returnsRate: 0,
      activeShippingLabels: 0,
    };
  }

  // Calculate average fulfillment time (from order creation to shipment)
  const fulfilledOrders = fulfillments.filter(f => f.shippedAt && !f.canceledAt);
  let totalFulfillmentTime = 0;
  
  if (fulfilledOrders.length > 0) {
    totalFulfillmentTime = fulfilledOrders.reduce((total, fulfillment) => {
      const orderDate = new Date(fulfillment.order.createdAt);
      const shippedDate = new Date(fulfillment.shippedAt!);
      const timeDiff = shippedDate.getTime() - orderDate.getTime();
      return total + (timeDiff / (1000 * 60 * 60)); // Convert to hours
    }, 0);
  }

  const averageFulfillmentTime = fulfilledOrders.length > 0 
    ? totalFulfillmentTime / fulfilledOrders.length 
    : 0;

  // Calculate on-time delivery rate (assuming 24 hours is "on time")
  const onTimeDeliveries = fulfilledOrders.filter(fulfillment => {
    const orderDate = new Date(fulfillment.order.createdAt);
    const shippedDate = new Date(fulfillment.shippedAt!);
    const timeDiff = shippedDate.getTime() - orderDate.getTime();
    const hoursToShip = timeDiff / (1000 * 60 * 60);
    return hoursToShip <= 24; // On time if shipped within 24 hours
  }).length;

  const onTimeDeliveryRate = fulfilledOrders.length > 0 
    ? (onTimeDeliveries / fulfilledOrders.length) * 100 
    : 0;

  // Calculate returns rate
  const returnsRate = totalOrders > 0 ? (returns.length / totalOrders) * 100 : 0;

  // Calculate pending fulfillments
  const pendingFulfillments = fulfillments.length - shippedCount - canceledCount;

  return {
    totalFulfillments: fulfillments.length,
    shippedFulfillments: shippedCount,
    pendingFulfillments: Math.max(0, pendingFulfillments),
    canceledFulfillments: canceledCount,
    averageFulfillmentTime,
    onTimeDeliveryRate,
    returnsRate,
    activeShippingLabels,
  };
}; 