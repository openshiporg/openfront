"use server";

import { createLabel } from "../utils/shippingProviderAdapter";
import { permissions } from "../access";
import createOrderFulfillment from "./createOrderFulfillment";
import {
  enqueueWebhookOutbox,
  subscribedWebhookEndpointIds,
} from "../../webhooks/outbox";
import { deliverWebhookEventsById } from "../../webhooks/webhook-plugin";
import { reconcileOrderFulfillmentStatus } from "../orders/order-lifecycle";

async function createProviderShippingLabel(
  root: any,
  { orderId, providerId, rateId, dimensions, lineItems, idempotencyKey }: any,
  context: any
) {
  // Check access permissions first
  const hasAccess = permissions.canManageFulfillments({ session: context.session });
  if (!hasAccess) {
    throw new Error("Access denied: You do not have permission to create shipping labels");
  }

  const sudo = context.sudo();
  // Validate order exists and has unfulfilled items
  const order = await sudo.query.Order.findOne({
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
  const unfulfilledQuantities: Record<string, number> = {};
  order.lineItems.forEach((item: any) => {
    unfulfilledQuantities[item.id] = item.quantity;
  });

  // Subtract quantities from active fulfillments only (not cancelled ones)
  order.fulfillments?.forEach((fulfillment: any) => {
    // Skip cancelled fulfillments - their quantities should be available
    if (fulfillment.canceledAt) {
      return;
    }
    fulfillment.fulfillmentItems?.forEach((item: any) => {
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
    const provider = await sudo.query.ShippingProvider.findOne({
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

    const fulfillmentWebhookEndpointIds = await subscribedWebhookEndpointIds(
      sudo,
      "fulfillment.created"
    );

    // Reserve fulfillment quantities transactionally before the external label
    // call so concurrent operators cannot over-fulfill the order.
    const fulfillment = await createOrderFulfillment(
      null,
      {
        orderId,
        lineItems,
        noNotification: true,
        idempotencyKey,
        deferWebhookDelivery: true,
        suppressWebhookEnqueue: true,
        deferLifecycleProjection: true,
      },
      context
    );
    const existingLabel = fulfillment.shippingLabels?.[0];
    if (existingLabel) return existingLabel;

    // Create label using provider adapter. An unknown provider outcome keeps the
    // fulfillment reservation in place for operator reconciliation.
    let labelData;
    try {
      labelData = await createLabel({
        provider,
        order,
        rateId,
        dimensions,
        lineItems,
        idempotencyKey,
      });
    } catch (error) {
      await sudo.prisma.fulfillment.update({
        where: { id: fulfillment.id },
        data: {
          metadata: {
            source: "provider-command",
            labelStatus: "unknown",
            providerId,
            rateId,
            error: error instanceof Error ? error.message : String(error),
          },
        },
      });
      throw new Error(
        `Label outcome is unknown; fulfillment ${fulfillment.id} remains reserved for reconciliation`
      );
    }
    const finalized = await sudo.prisma.$transaction(async (tx: any) => {
      const label = await tx.shippingLabel.create({
        data: {
          status: "purchased",
          providerId,
          fulfillmentId: fulfillment.id,
          orderId,
          labelUrl: labelData.labelUrl,
          carrier: labelData.carrier,
          service: labelData.service,
          trackingNumber: labelData.trackingNumber,
          trackingUrl: labelData.trackingUrl,
          rate: labelData.rate,
          data: labelData.data,
          metadata: { rateId, source: "provider-command" },
        },
      });
      await tx.fulfillment.update({
        where: { id: fulfillment.id },
        data: {
          metadata: {
            source: "provider-command",
            labelStatus: "purchased",
            providerId,
            rateId,
          },
        },
      });
      await reconcileOrderFulfillmentStatus(tx, orderId, {
        reason: "provider_shipping_label_purchased",
        actorId: context.session.itemId,
      });
      const webhookEventIds = await enqueueWebhookOutbox(
        tx,
        fulfillmentWebhookEndpointIds,
        "fulfillment.created",
        "Fulfillment",
        fulfillment.id,
        {
          id: fulfillment.id,
          orderId,
          order: { id: orderId },
          lineItems: lineItems.map((item: any) => [item.lineItemId, item.quantity]),
          trackingNumber: labelData.trackingNumber || null,
          trackingCompany: labelData.carrier || null,
        }
      );
      return { label, webhookEventIds };
    });
    if (finalized.webhookEventIds.length) {
      await deliverWebhookEventsById(sudo, finalized.webhookEventIds);
    }
    return finalized.label;
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