'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

// Interface for order data (exported for potential use in other files)
export interface Order {
  id: string;
  displayId: string;
  status: string;
  email: string;
  [key: string]: unknown;
}

/**
 * Get list of orders
 */
export async function getOrders(
  where: Record<string, unknown> = {},
  take: number = 10,
  skip: number = 0,
  orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }],
  selectedFields: string = `
    id
    displayId
    status
    email
    taxRate
    canceledAt
    createdAt
    updatedAt
    user {
      id
      name
      email
    }
    shippingAddress {
      id
      company
      firstName
      lastName
      address1
      address2
      city
      province
      postalCode
      phone
    }
    billingAddress {
      id
      company
      firstName
      lastName
      address1
      address2
      city
      province
      postalCode
      phone
    }
    lineItems {
      id
      title
      quantity
      sku
      thumbnail
      formattedUnitPrice
      formattedTotal
      variantData
      productData
    }
    total
  `
) {
  const query = `
    query GetOrders($where: OrderWhereInput, $take: Int!, $skip: Int!, $orderBy: [OrderOrderByInput!]) {
      items: orders(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        ${selectedFields}
      }
      count: ordersCount(where: $where)
    }
  `;

  const response = await keystoneClient(query, { where, take, skip, orderBy });
  return response;
}

/**
 * Get a single order by ID with full details for order pages
 */
export async function getOrder(orderId: string) {
  const query = `
    query ($id: ID!) {
      order(where: { id: $id }) {
        id
        displayId
        status
        fulfillmentStatus
        fulfillmentDetails
        total
        subtotal
        shipping
        tax
        note
        currency {
          code
          symbol
          name
        }
        metadata
        email
        createdAt
        updatedAt
        canceledAt
        paymentDetails
        totalPaid
        formattedTotalPaid
        lineItems {
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
        unfulfilled
        user {
          id
          name
          email
          phone
          orders {
            id
          }
        }
        billingAddress {
          id
          firstName
          lastName
          company
          address1
          address2
          city
          province
          postalCode
          phone
          country {
            name
          }
        }
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
          phone
          country {
            name
          }
        }
        events {
          id
          type
          data
          time
          createdAt
          user {
            id
            name
            email
          }
        }
      }
    }
  `;

  const cacheOptions = {
    next: {
      tags: [`order-${orderId}`],
      revalidate: 3600, // Cache for 1 hour
    },
  };

  const response = await keystoneClient(query, { id: orderId }, cacheOptions);
  return response;
}

/**
 * Update order status
 */
export async function updateOrderStatus(id: string, status: string) {
  const query = `
    mutation UpdateOrderStatus($id: ID!, $data: OrderUpdateInput!) {
      updateOrder(where: { id: $id }, data: $data) {
        id
        status
      }
    }
  `;

  const response = await keystoneClient(query, {
    id,
    data: { status }
  });

  if (response.success) {
    revalidatePath(`/dashboard/platform/orders/${id}`);
  } else {
    console.error(`Failed to update order status for ${id}:`, response.error);
  }

  return response;
}

/**
 * Get filtered orders based on status and search parameters
 */
export async function getFilteredOrders(
  status: string | null = null,
  search: string | null = null,
  page: number = 1,
  pageSize: number = 10,
  sort: { field: string; direction: 'ASC' | 'DESC' } | null = null
) {
  const where: Record<string, unknown> = {};

  // Add status filter if provided and not 'all'
  if (status && status !== 'all') {
    where.status = { equals: status };
  }

  // Add search filter if provided
  if (search) {
    where.OR = [
      { displayId: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * pageSize;

  // Handle sorting
  const orderBy = sort
    ? [{ [sort.field]: sort.direction.toLowerCase() }]
    : [{ createdAt: 'desc' }];

  return getOrders(where, pageSize, skip, orderBy);
}

/**
 * Get order counts by status
 */
export async function getOrderStatusCounts() {
  const query = `
    query GetOrderStatusCounts {
      pending: ordersCount(where: { status: { equals: pending } })
      requires_action: ordersCount(where: { status: { equals: requires_action } })
      completed: ordersCount(where: { status: { equals: completed } })
      archived: ordersCount(where: { status: { equals: archived } })
      canceled: ordersCount(where: { status: { equals: canceled } })
      all: ordersCount
    }
  `;

  const response = await keystoneClient(query);
  return response;
}

/**
 * Get available payment providers for a region
 */
export async function getPaymentProviders(regionId: string) {
  const query = `
    query GetPaymentProviders($regionId: ID!) {
      region(where: { id: $regionId }) {
        id
        paymentProviders {
          id
          code
          name
          isInstalled
        }
      }
    }
  `;

  const response = await keystoneClient(query, { regionId });
  return response;
}

/**
 * Initiate payment session for a cart and provider
 */
export async function initiatePaymentSessionAdmin(cartId: string, providerId: string) {
  const query = `
    mutation InitiatePaymentSession($cartId: ID!, $paymentProviderId: String!) {
      initiatePaymentSession(cartId: $cartId, paymentProviderId: $paymentProviderId) {
        id
        data
        amount
        isSelected
        paymentProvider {
          id
          code
        }
      }
    }
  `;

  const response = await keystoneClient(query, { 
    cartId, 
    paymentProviderId: providerId 
  });
  return response;
}

/**
 * Complete cart and create order
 */
export async function completeCartToOrder(cartId: string) {
  const query = `
    mutation CompleteActiveCart($cartId: ID!) {
      completeActiveCart(cartId: $cartId)
    }
  `;

  const response = await keystoneClient(query, { cartId });
  
  if (response.success) {
    revalidatePath('/dashboard/platform/orders');
  }
  
  return response;
}

/**
 * Send payment link email to customer
 */
export async function sendPaymentLinkEmail(orderId: string, cartId: string) {
  // This would integrate with your email service
  // For now, we'll just return a success response
  try {
    // TODO: Implement email sending logic
    // const emailResult = await sendEmail({
    //   to: customer.email,
    //   template: 'payment-link',
    //   data: { orderId, cartId, paymentLink: `${baseUrl}/checkout/${cartId}` }
    // });
    
    console.log(`Would send payment link for order ${orderId} with cart ${cartId}`);

    return {
      success: true,
      data: { message: "Payment link email would be sent" }
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to send payment link email"
    };
  }
}

/**
 * Create a cart (first step of order creation)
 */
export async function createOrderCart(orderData: {
  customerId: string;
  shippingAddressId: string;
  billingAddressId: string;
  lineItems: Array<{
    variantId: string;
    quantity: number;
  }>;
}) {
  try {
    // First, get the region based on the shipping address country
    const addressQuery = `
      query GetAddressCountry($id: ID!) {
        address(where: { id: $id }) {
          id
          country {
            iso2
            name
          }
        }
      }
    `;

    const addressResponse = await keystoneClient(addressQuery, { id: orderData.shippingAddressId });
    if (!addressResponse.success || !addressResponse.data?.address) {
      return {
        success: false,
        error: "Failed to get shipping address"
      };
    }

    const shippingAddress = addressResponse.data.address;

    // Get region based on country
    const regionQuery = `
      query GetRegionByCountry($countryCode: String!) {
        regions(where: { countries: { some: { iso2: { equals: $countryCode } } } }) {
          id
          name
        }
      }
    `;

    const regionResponse = await keystoneClient(regionQuery, { 
      countryCode: shippingAddress.country.iso2 
    });

    if (!regionResponse.success || !regionResponse.data?.regions?.length) {
      return {
        success: false,
        error: `No region found for country: ${shippingAddress.country.iso2}`
      };
    }

    const region = regionResponse.data.regions[0];

    // Get customer email
    const customerQuery = `
      query GetCustomer($id: ID!) {
        user(where: { id: $id }) {
          id
          email
        }
      }
    `;

    const customerResponse = await keystoneClient(customerQuery, { id: orderData.customerId });
    if (!customerResponse.success || !customerResponse.data?.user) {
      return {
        success: false,
        error: "Failed to get customer data"
      };
    }

    const customer = customerResponse.data.user;

    // Create cart manually using Keystone context to bypass session user
    const createCartQuery = `
      mutation CreateCart($data: CartCreateInput!) {
        createCart(data: $data) {
          id
          user {
            id
            email
            firstName
            lastName
          }
        }
      }
    `;

    const cartResponse = await keystoneClient(createCartQuery, {
      data: {
        email: customer.email,
        user: { connect: { id: orderData.customerId } }, // Explicitly connect customer
        region: { connect: { id: region.id } },
        shippingAddress: { connect: { id: orderData.shippingAddressId } },
        billingAddress: { connect: { id: orderData.billingAddressId } },
        lineItems: {
          create: orderData.lineItems.map(item => ({
            productVariant: { connect: { id: item.variantId } },
            quantity: item.quantity
          }))
        }
      }
    });

    if (!cartResponse.success || !cartResponse.data?.createCart) {
      return {
        success: false,
        error: "Failed to create cart"
      };
    }

    const cartId = cartResponse.data.createCart.id;

    // Return cart data with region info for payment processing
    return {
      success: true,
      data: {
        cartId,
        regionId: region.id,
        customer,
        shippingAddress,
        lineItems: orderData.lineItems
      }
    };

  } catch (error) {
    console.error("Error creating cart:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create cart"
    };
  }
}

/**
 * Set payment session for cart (selects the payment method like storefront)
 */
export async function setCartPaymentSession(cartId: string, providerId: string) {
  const query = `
    mutation SetActiveCartPaymentSession($cartId: ID!, $providerId: ID!) {
      setActiveCartPaymentSession(cartId: $cartId, providerId: $providerId) {
        id
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
  `;

  const response = await keystoneClient(query, { cartId, providerId });
  return response;
}

/**
 * Select payment method (initiates payment session which auto-selects it)
 */
export async function selectPaymentMethod(cartId: string, providerCode: string) {
  try {
    // The initiatePaymentSession mutation already selects the session automatically
    // It expects a provider code (like "stripe", "paypal") not an ID
    const sessionResult = await initiatePaymentSessionAdmin(cartId, providerCode);
    
    if (!sessionResult.success) {
      return {
        success: false,
        error: sessionResult.error || "Failed to create and select payment session"
      };
    }

    return {
      success: true,
      data: {
        cartId,
        paymentSession: sessionResult.data,
        message: "Payment method selected successfully"
      }
    };

  } catch (error) {
    console.error("Error selecting payment method:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to select payment method"
    };
  }
}

/**
 * Complete order (like storefront's placeOrder function)
 */
export async function placeOrderAdmin(cartId: string, sendEmail: boolean = false) {
  try {
    // If sending email, don't complete the order yet
    if (sendEmail) {
      return {
        success: true,
        data: {
          cartId,
          emailSent: true,
          message: "Payment link ready to be sent via email"
        }
      };
    }

    // Complete the cart to create order (like storefront)
    const completeResult = await completeCartToOrder(cartId);
    
    if (!completeResult.success) {
      return {
        success: false,
        error: completeResult.error || "Failed to complete order"
      };
    }

    return {
      success: true,
      data: {
        order: completeResult.data
      }
    };

  } catch (error) {
    console.error("Error placing order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to place order"
    };
  }
}

/**
 * Create payment sessions for admin cart (server action version)
 */
export async function createAdminCartPaymentSessions(cartId: string) {
  const query = `
    mutation CreatePaymentSessions($cartId: ID!) {
      createActiveCartPaymentSessions(cartId: $cartId) {
        id
      }
    }
  `;

  const response = await keystoneClient(query, { cartId });
  return response;
}

/**
 * Initiate payment session for admin (server action version)
 */
export async function initiateAdminPaymentSession(cartId: string, paymentProviderId: string) {
  const query = `
    mutation InitiatePaymentSession($cartId: ID!, $paymentProviderId: String!) {
      initiatePaymentSession(cartId: $cartId, paymentProviderId: $paymentProviderId) {
        id
        data
        amount
      }
    }
  `;

  const response = await keystoneClient(query, { 
    cartId, 
    paymentProviderId 
  });
  return response;
}

/**
 * Complete cart to order for admin (server action version)
 */
export async function completeAdminCart(cartId: string) {
  const query = `
    mutation CompleteActiveCart($cartId: ID!) {
      completeActiveCart(cartId: $cartId)
    }
  `;

  const response = await keystoneClient(query, { cartId });
  
  if (response.success) {
    revalidatePath('/dashboard/platform/orders');
  }
  
  return response;
} 