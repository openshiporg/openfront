"use server"
import { gql } from "graphql-request"
import { openfrontClient } from "../config"
import { cache } from "react"

export const listShippingMethods = cache(async function (regionId, productIds) {
  const LIST_SHIPPING_METHODS_QUERY = gql`
    query ListShippingMethods($regionId: ID!, $productIds: [ID!]) {
      shippingOptions(
        where: {
          region: { id: { equals: $regionId } }
          products: { some: { id: { in: $productIds } } }
        }
      ) {
        id
        name
        price
      }
    }
  `;

  return openfrontClient.request(LIST_SHIPPING_METHODS_QUERY, {
    regionId,
    productIds,
  });
}); 