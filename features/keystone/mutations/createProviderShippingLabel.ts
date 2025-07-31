"use server";

import { createLabel } from "../utils/shippingProviderAdapter";
import { permissions } from "../access";

async function createProviderShippingLabel(root, { orderId, providerId, rateId, dimensions, lineItems }, context) {
  // Check access permissions first
  const hasAccess = permissions.canManageFulfillments({ session: context.session });
  if (!hasAccess) {
    throw new Error("Access denied: You do not have permission to create shipping labels");
  }

  // Validate order exists and has unfulfilled items
  const order = await context.query.Order.findOne({
    where: { id: orderId },
    query: `
      id
      lineItems {
        id
        quantity
      }
      fulfillments {
        canceledAt
        fulfillmentItems {
          quantity
          lineItem {
            id
          }
        }
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
          iso2
        }
        phone
      }
    `
  });

  if (!order?.lineItems) {
    throw new Error('Order not found or has no line items');
  }

  // Validate line items
  if (!lineItems?.length) {
    throw new Error('No items to fulfill');
  }

  // Calculate unfulfilled quantities
  const unfulfilledQuantities = {};
  order.lineItems.forEach(item => {
    unfulfilledQuantities[item.id] = item.quantity;
  });

  // Subtract quantities from active fulfillments only (not cancelled ones)
  order.fulfillments?.forEach(fulfillment => {
    // Skip cancelled fulfillments - their quantities should be available
    if (fulfillment.canceledAt) {
      return;
    }
    fulfillment.fulfillmentItems?.forEach(item => {
      unfulfilledQuantities[item.lineItem.id] -= item.quantity;
    });
  });

  // Check each item's quantity
  for (const item of lineItems) {
    const availableQuantity = unfulfilledQuantities[item.lineItemId] || 0;
    if (availableQuantity <= 0) {
      throw new Error(`Line item ${item.lineItemId} has no unfulfilled quantity`);
    }
    if (item.quantity > availableQuantity) {
      throw new Error(`Cannot fulfill more than ${availableQuantity} items for line item ${item.lineItemId}`);
    }
  }

  // try {
    // Get the provider with all required fields
    const provider = await context.query.ShippingProvider.findOne({
      where: { id: providerId },
      query: `
        id 
        name 
        createLabelFunction
        accessToken
        isActive
        fromAddress {
          firstName
          lastName
          company
          address1
          address2
          city
          province
          postalCode
          country {
            iso2
          }
          phone
        }
      `
    });

    if (!provider) {
      throw new Error(`Shipping provider not found: ${providerId}`);
    }

    if (!provider.isActive) {
      throw new Error(`Shipping provider ${provider.id} is not active`);
    }

    if (!provider.accessToken) {
      throw new Error(`Shipping provider ${provider.id} has no access token configured`);
    }

    // Create label using provider adapter
    const labelData = await createLabel({
      provider,
      order,
      rateId,
      dimensions,
      lineItems,
    });
    // Create fulfillment and shipping label
    const fulfillment = await context.query.Fulfillment.createOne({
      data: {
        order: { connect: { id: orderId } },
        fulfillmentItems: {
          create: lineItems.map(item => ({
            lineItem: { connect: { id: item.lineItemId } },
            quantity: item.quantity,
          })),
        },
        shippingLabels: {
          create: [{
            status: "purchased",
            provider: { connect: { id: providerId } },
            labelUrl: labelData.labelUrl,
            carrier: labelData.carrier,
            service: labelData.service,
            trackingNumber: labelData.trackingNumber,
            trackingUrl: labelData.trackingUrl,
            rate: labelData.rate,
            data: labelData.data,
          }],
        },
        metadata: {
          source: "admin",
          createdBy: "admin",
        },
      },
      query: `
        id
        shippingLabels {
          id
          status
          trackingNumber
          trackingUrl
          labelUrl
          carrier
          service
          data
        }
      `
    });

    return fulfillment.shippingLabels[0];
  // } catch (error) {
  //   // Create a failed shipping label record
  //   const failedLabel = await context.db.ShippingLabel.createOne({
  //     data: {
  //       status: "failed",
  //       provider: { connect: { id: providerId } },
  //       data: { error: error.message },
  //     },
  //   });

  //   throw new Error(`Shipping provider ${provider.id} has no access token configured`);

  // }
}

export default createProviderShippingLabel; 