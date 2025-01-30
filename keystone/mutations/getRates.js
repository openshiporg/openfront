import { graphql } from "@keystone-6/core";
import { permissions } from "../access";
import { getRates } from "../utils/shippingProviderAdapter";

const graphql = String.raw;

export default graphql.field({
  type: graphql.list(graphql.nonNull(
    graphql.object()({
      name: 'ShippingRate',
      fields: {
        id: graphql.field({ type: graphql.nonNull(graphql.ID) }),
        provider: graphql.field({ type: graphql.nonNull(graphql.String) }),
        service: graphql.field({ type: graphql.nonNull(graphql.String) }),
        price: graphql.field({ type: graphql.nonNull(graphql.String) }),
        estimatedDays: graphql.field({ type: graphql.nonNull(graphql.String) }),
      },
    })
  )),
  args: {
    orderId: graphql.arg({ type: graphql.nonNull(graphql.ID) }),
    providerId: graphql.arg({ type: graphql.nonNull(graphql.ID) }),
  },
  async resolve(source, { orderId, providerId }, context) {
    if (!context.session?.data?.isAdmin) {
      throw new Error('Must be an admin to get shipping rates');
    }

    const order = await context.db.Order.findOne({
      where: { id: orderId },
      query: `
        id
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
          country {
            name
            code
          }
          phone
        }
        lineItems {
          id
          quantity
          productVariant {
            id
            weight
            weightUnit
            width
            height
            length
            dimensionUnit
          }
        }
      `
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const provider = await context.db.ShippingProvider.findOne({
      where: { id: providerId },
      query: 'id name type apiKey apiSecret testMode'
    });

    if (!provider) {
      throw new Error('Shipping provider not found');
    }

    // Return mock data for now
    return [
      {
        id: 'rate_1',
        provider: provider.name,
        service: 'Ground',
        price: '$9.99',
        estimatedDays: '3-5'
      },
      {
        id: 'rate_2', 
        provider: provider.name,
        service: 'Express',
        price: '$19.99',
        estimatedDays: '1-2'
      }
    ];
  },
}); 