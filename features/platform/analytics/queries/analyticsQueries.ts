import { gql } from '@apollo/client';

// Sales Analytics Queries
export const GET_SALES_OVERVIEW = gql`
  query GetSalesOverview($startDate: DateTime!, $endDate: DateTime!) {
    orders(
      where: {
        createdAt: { gte: $startDate, lte: $endDate }
        status: { notIn: [canceled] }
      }
    ) {
      id
      displayId
      subtotal
      tax
      shipping
      total
      status
      createdAt
      currency {
        code
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
  }
`;

export const GET_CUSTOMER_ANALYTICS = gql`
  query GetCustomerAnalytics($startDate: DateTime!, $endDate: DateTime!) {
    users(
      where: {
        orders: {
          some: {
            createdAt: { gte: $startDate, lte: $endDate }
          }
        }
      }
    ) {
      id
      email
      createdAt
      orders(where: { status: { notIn: [canceled] } }) {
        id
        total
        createdAt
        status
      }
    }
  }
`;

export const GET_PRODUCT_PERFORMANCE = gql`
  query GetProductPerformance($startDate: DateTime!, $endDate: DateTime!) {
    orderLineItems(
      where: {
        order: {
          createdAt: { gte: $startDate, lte: $endDate }
          status: { notIn: [canceled] }
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

export const GET_CART_ANALYTICS = gql`
  query GetCartAnalytics($startDate: DateTime!, $endDate: DateTime!) {
    carts(
      where: {
        createdAt: { gte: $startDate, lte: $endDate }
      }
    ) {
      id
      createdAt
      updatedAt
      lineItems {
        id
        quantity
        unitPrice
        total
        productVariant {
          id
          product {
            id
            title
          }
        }
      }
      user {
        id
        email
      }
    }
  }
`;

export const GET_REVENUE_TRENDS = gql`
  query GetRevenueTrends($startDate: DateTime!, $endDate: DateTime!) {
    orders(
      where: {
        createdAt: { gte: $startDate, lte: $endDate }
        status: { notIn: [canceled] }
      }
      orderBy: { createdAt: asc }
    ) {
      id
      total
      subtotal
      tax
      shipping
      createdAt
      status
      currency {
        code
      }
    }
  }
`;

export const GET_TOP_PRODUCTS = gql`
  query GetTopProducts($startDate: DateTime!, $endDate: DateTime!, $limit: Int = 10) {
    orderLineItems(
      where: {
        order: {
          createdAt: { gte: $startDate, lte: $endDate }
          status: { notIn: [canceled] }
        }
      }
      take: $limit
    ) {
      id
      quantity
      formattedUnitPrice
      formattedTotal
      productVariant {
        id
        title
        product {
          id
          title
          thumbnail
        }
      }
      order {
        id
        createdAt
      }
    }
  }
`;

export const GET_CATEGORY_PERFORMANCE = gql`
  query GetCategoryPerformance($startDate: DateTime!, $endDate: DateTime!) {
    orderLineItems(
      where: {
        order: {
          createdAt: { gte: $startDate, lte: $endDate }
          status: { notIn: [canceled] }
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

export const GET_CUSTOMER_SEGMENTS = gql`
  query GetCustomerSegments($startDate: DateTime!, $endDate: DateTime!) {
    users {
      id
      email
      createdAt
      orders(where: { status: { notIn: [canceled] } }) {
        id
        total
        createdAt
        status
      }
    }
  }
`;

export const GET_REFUNDS_RETURNS = gql`
  query GetRefundsReturns($startDate: DateTime!, $endDate: DateTime!) {
    returns(
      where: {
        createdAt: { gte: $startDate, lte: $endDate }
      }
    ) {
      id
      status
      refundAmount
      createdAt
      order {
        id
        total
        displayId
      }
      returnItems {
        id
        quantity
        reason
        receivedQuantity
        lineItem {
          id
          unitPrice
          productVariant {
            id
            product {
              id
              title
            }
          }
        }
      }
    }
  }
`; 