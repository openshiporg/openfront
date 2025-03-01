"use server";

import { getRates } from "../utils/shippingProviderAdapter";
import { permissions } from "../access";

async function getRatesForOrder(root, { orderId, providerId, dimensions }, context) {
  // Check access permissions first
  const hasAccess =
    permissions.canReadOrders({ session: context.session }) ||
    permissions.canManageOrders({ session: context.session });

  if (!hasAccess) {
    throw new Error(
      "Access denied: You do not have permission to get shipping rates"
    );
  }

  const sudoContext = context.sudo();

  try {
    // Get order and provider details
    const [order, provider] = await Promise.all([
      sudoContext.query.Order.findOne({
        where: { id: orderId },
        query: `
          id
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
          lineItems {
            id
            quantity
            variantData
          }
        `,
      }),
      sudoContext.query.ShippingProvider.findOne({
        where: { id: providerId },
        query: `
          id
          name
          accessToken
          getRatesFunction
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
        `,
      }),
    ]);

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    if (!provider) {
      throw new Error(`Shipping provider not found: ${providerId}`);
    }

    if (!provider.isActive) {
      throw new Error(`Shipping provider ${provider.id} is not active`);
    }

    if (!provider.accessToken) {
      throw new Error(`Shipping provider ${provider.id} has no access token configured`);
    }

    // If dimensions aren't provided, try to get them from line items
    let packageDimensions = dimensions;
    if (!packageDimensions) {
      // Calculate from line items
      let maxLength = 0;
      let maxWidth = 0;
      let maxHeight = 0;
      let totalWeight = 0;
      let hasDimensions = false;
      let weightUnit = null;
      let dimensionUnit = null;

      order.lineItems.forEach(item => {
        const variant = item.variantData;
        if (variant?.measurements?.length) {
          hasDimensions = true;
          variant.measurements.forEach(measurement => {
            const { type, value, unit } = measurement;
            switch (type) {
              case 'weight':
                totalWeight += value * item.quantity;
                weightUnit = unit;
                break;
              case 'length':
                maxLength = Math.max(maxLength, value);
                dimensionUnit = unit;
                break;
              case 'width':
                maxWidth = Math.max(maxWidth, value);
                dimensionUnit = unit;
                break;
              case 'height':
                maxHeight = Math.max(maxHeight, value);
                dimensionUnit = unit;
                break;
            }
          });
        }
      });

      if (!hasDimensions) {
        throw new Error("No dimensions found for line items. Dimensions must be provided to get shipping rates.");
      }

      packageDimensions = {
        length: maxLength,
        width: maxWidth,
        height: maxHeight,
        weight: totalWeight,
        unit: dimensionUnit || "cm", // Default unit
        weightUnit: weightUnit || "kg" // Default weight unit
      };
    }

    // Use the adapter to get rates
    const rates = await getRates({ 
      provider: {
        ...provider,
        accessToken: provider.accessToken
      }, 
      order,
      dimensions: packageDimensions
    });

    // Return rates without dimensions
    return rates.map(rate => ({
      id: rate.id,
      provider: provider.name,
      service: rate.service,
      carrier: rate.carrier,
      price: rate.price,
      estimatedDays: rate.estimatedDays,
    }));
  } catch (error) {
    console.error("Getting shipping rates failed:", error);
    throw error;
  }
}

export default getRatesForOrder;
