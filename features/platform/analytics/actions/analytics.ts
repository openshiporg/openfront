'use server';

import { keystoneClient } from "@/features/dashboard/lib/keystoneClient";

/**
 * Get all available regions and currencies
 */
export async function getRegionsAndCurrencies() {
  const query = `
    query GetRegionsAndCurrencies {
      regions {
        id
        code
        name
        currency {
          id
          code
          symbol
          name
        }
        ordersCount
      }
      currencies {
        id
        code
        symbol
        name
      }
    }
  `;

  return await keystoneClient(query);
}

/**
 * Get sales overview data for analytics with comparison period and optional regional filtering
 */
export async function getSalesOverview(
  startDate: string, 
  endDate: string, 
  previousStartDate?: string, 
  previousEndDate?: string,
  regionCode?: string
) {
  const regionFilter = regionCode ? `region: { code: { equals: "${regionCode}" } }` : '';
  
  const query = `
    query GetSalesOverview($startDate: DateTime!, $endDate: DateTime!, $previousStartDate: DateTime, $previousEndDate: DateTime) {
      orders(
        where: {
          createdAt: { gte: $startDate, lte: $endDate }
          status: { notIn: [canceled] }
          ${regionFilter}
        }
      ) {
        id
        displayId
        total
        subtotal
        tax
        shipping
        status
        createdAt
        rawTotal
        region {
          id
          code
          name
          currency {
            code
            symbol
            name
          }
        }
        currency {
          code
          symbol
        }
        lineItems {
          id
          quantity
          formattedUnitPrice
          formattedTotal
          productVariant {
            id
            product {
              id
              title
              productCategories {
                id
                title
              }
            }
          }
        }
        user {
          id
          email
        }
      }
      ordersCount(
        where: {
          createdAt: { gte: $startDate, lte: $endDate }
          status: { notIn: [canceled] }
          ${regionFilter}
        }
      )
      previousOrders: orders(
        where: {
          createdAt: { gte: $previousStartDate, lte: $previousEndDate }
          status: { notIn: [canceled] }
          ${regionFilter}
        }
      ) {
        id
        total
        rawTotal
        lineItems {
          id
          quantity
          formattedUnitPrice
          formattedTotal
        }
      }
      previousOrdersCount: ordersCount(
        where: {
          createdAt: { gte: $previousStartDate, lte: $previousEndDate }
          status: { notIn: [canceled] }
          ${regionFilter}
        }
      )
    }
  `;

  return await keystoneClient(query, { 
    startDate, 
    endDate, 
    previousStartDate: previousStartDate || startDate,
    previousEndDate: previousEndDate || endDate
  });
}

/**
 * Get customer analytics data
 */
export async function getCustomerAnalytics(startDate: string, endDate: string, regionCode?: string) {
  const regionFilter = regionCode ? `orders: { some: { region: { code: { equals: "${regionCode}" } } } }` : '';
  
  const query = `
    query GetCustomerAnalytics($startDate: DateTime!, $endDate: DateTime!) {
      users(
        where: {
          createdAt: { gte: $startDate, lte: $endDate }
          ${regionFilter}
        }
      ) {
        id
        email
        createdAt
        orders {
          id
          total
          createdAt
          status
        }
      }
      usersCount(
        where: {
          createdAt: { gte: $startDate, lte: $endDate }
          ${regionFilter}
        }
      )
      allUsersCount: usersCount
    }
  `;

  return await keystoneClient(query, { startDate, endDate });
}

/**
 * Get product performance data
 */
export async function getProductPerformance(startDate: string, endDate: string, regionCode?: string) {
  const regionFilter = regionCode ? `region: { code: { equals: "${regionCode}" } }` : '';
  
  const query = `
    query GetProductPerformance($startDate: DateTime!, $endDate: DateTime!) {
      orderLineItems(
        where: {
          order: {
            createdAt: { gte: $startDate, lte: $endDate }
            status: { notIn: [canceled] }
            ${regionFilter}
          }
        }
      ) {
        id
        quantity
        formattedUnitPrice
        formattedTotal
        productVariant {
          id
          product {
            id
            title
            status
            productCategories {
              id
              title
            }
          }
        }
        order {
          id
          createdAt
        }
      }
    }
  `;

  return await keystoneClient(query, { startDate, endDate });
}

/**
 * Get cart analytics data with comparison period
 */
export async function getCartAnalytics(startDate: string, endDate: string, previousStartDate?: string, previousEndDate?: string, regionCode?: string) {
  const regionFilter = regionCode ? `region: { code: { equals: "${regionCode}" } }` : '';
  
  const query = `
    query GetCartAnalytics($startDate: DateTime!, $endDate: DateTime!, $previousStartDate: DateTime, $previousEndDate: DateTime) {
      carts(
        where: {
          createdAt: { gte: $startDate, lte: $endDate }
          ${regionFilter}
        }
      ) {
        id
        createdAt
        status
        lineItems {
          id
          quantity
        }
      }
      cartsCount(
        where: {
          createdAt: { gte: $startDate, lte: $endDate }
          ${regionFilter}
        }
      )
      completedOrders: ordersCount(
        where: {
          createdAt: { gte: $startDate, lte: $endDate }
          status: { notIn: [canceled] }
          ${regionFilter}
        }
      )
      previousCarts: carts(
        where: {
          createdAt: { gte: $previousStartDate, lte: $previousEndDate }
          ${regionFilter}
        }
      ) {
        id
        lineItems {
          id
          quantity
        }
      }
      previousCartsCount: cartsCount(
        where: {
          createdAt: { gte: $previousStartDate, lte: $previousEndDate }
          ${regionFilter}
        }
      )
      previousCompletedOrders: ordersCount(
        where: {
          createdAt: { gte: $previousStartDate, lte: $previousEndDate }
          status: { notIn: [canceled] }
          ${regionFilter}
        }
      )
    }
  `;

  return await keystoneClient(query, { 
    startDate, 
    endDate, 
    previousStartDate: previousStartDate || startDate,
    previousEndDate: previousEndDate || endDate
  });
}

/**
 * Get revenue trends over time
 */
export async function getRevenueTrends(startDate: string, endDate: string, regionCode?: string) {
  const regionFilter = regionCode ? `region: { code: { equals: "${regionCode}" } }` : '';
  
  const query = `
    query GetRevenueTrends($startDate: DateTime!, $endDate: DateTime!) {
      orders(
        where: {
          createdAt: { gte: $startDate, lte: $endDate }
          status: { notIn: [canceled] }
          ${regionFilter}
        }
        orderBy: { createdAt: asc }
      ) {
        id
        total
        rawTotal
        createdAt
        status
        lineItems {
          id
          quantity
          formattedUnitPrice
          formattedTotal
        }
      }
    }
  `;

  return await keystoneClient(query, { startDate, endDate });
}

/**
 * Get category performance data
 */
export async function getCategoryPerformance(startDate: string, endDate: string, regionCode?: string) {
  const regionFilter = regionCode ? `region: { code: { equals: "${regionCode}" } }` : '';
  
  const query = `
    query GetCategoryPerformance($startDate: DateTime!, $endDate: DateTime!) {
      orderLineItems(
        where: {
          order: {
            createdAt: { gte: $startDate, lte: $endDate }
            status: { notIn: [canceled] }
            ${regionFilter}
          }
        }
      ) {
        id
        quantity
        formattedTotal
        productVariant {
          id
          product {
            id
            title
            productCategories {
              id
              title
            }
          }
        }
      }
    }
  `;

  return await keystoneClient(query, { startDate, endDate });
}

/**
 * Get fulfillment analytics data
 */
export async function getFulfillmentAnalytics(startDate: string, endDate: string, regionCode?: string) {
  const regionFilter = regionCode ? `order: { region: { code: { equals: "${regionCode}" } } }` : '';
  
  const query = `
    query GetFulfillmentAnalytics($startDate: DateTime!, $endDate: DateTime!) {
      fulfillments(
        where: {
          createdAt: { gte: $startDate, lte: $endDate }
          ${regionFilter}
        }
      ) {
        id
        shippedAt
        canceledAt
        createdAt
        order {
          id
          createdAt
          status
        }
      }
      fulfillmentsCount(
        where: {
          createdAt: { gte: $startDate, lte: $endDate }
        }
      )
      shippedFulfillments: fulfillmentsCount(
        where: {
          createdAt: { gte: $startDate, lte: $endDate }
          shippedAt: { not: null }
        }
      )
      canceledFulfillments: fulfillmentsCount(
        where: {
          createdAt: { gte: $startDate, lte: $endDate }
          canceledAt: { not: null }
        }
      )
      shippingLabels(
        where: {
          createdAt: { gte: $startDate, lte: $endDate }
        }
      ) {
        id
        status
        createdAt
        trackingNumber
      }
      activeShippingLabels: shippingLabelsCount(
        where: {
          createdAt: { gte: $startDate, lte: $endDate }
          status: { in: [created, purchased] }
        }
      )
      returns(
        where: {
          createdAt: { gte: $startDate, lte: $endDate }
        }
      ) {
        id
        status
        createdAt
      }
      totalOrders: ordersCount(
        where: {
          createdAt: { gte: $startDate, lte: $endDate }
          status: { notIn: [canceled] }
        }
      )
    }
  `;

  return await keystoneClient(query, { startDate, endDate });
}

/**
 * Get regional analytics breakdown
 */
export async function getRegionalAnalytics(startDate: string, endDate: string) {
  const query = `
    query GetRegionalAnalytics($startDate: DateTime!, $endDate: DateTime!) {
      regions {
        id
        code
        name
        currency {
          id
          code
          symbol
          name
        }
        orders(
          where: {
            createdAt: { gte: $startDate, lte: $endDate }
            status: { notIn: [canceled] }
          }
        ) {
          id
          rawTotal
          status
          createdAt
          currency {
            code
            symbol
          }
        }
      }
    }
  `;

  return await keystoneClient(query, { startDate, endDate });
} 