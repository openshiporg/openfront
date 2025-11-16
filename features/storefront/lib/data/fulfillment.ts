"use server"
import { gql } from "graphql-request"
import { openfrontClient } from "../config"
import { cache } from "react"

export const listCartShippingMethods = cache(async function (cartId: string) {
  const LIST_CART_SHIPPING_METHODS = gql`
    query ListCartShippingMethods($cartId: ID!) {
      cart(where: { id: $cartId }) {
        id
        region {
          id
          shippingOptions {
            id
            name
            amount
            priceType
            data
            isReturn
            adminOnly
            shippingProfile {
              id
              type
            }
            shippingOptionRequirements {
              id
              type
              amount
            }
          }
        }
      }
    }
  `;

  const { cart } = await openfrontClient.request(LIST_CART_SHIPPING_METHODS, { cartId });

  // Filter shipping options
  const shippingOptions = cart.region.shippingOptions.filter((option: any) => {
    // Skip admin-only and return shipping options
    if (option.adminOnly || option.isReturn) return false;

    // Skip gift card shipping options
    if (option.shippingProfile?.type === "gift_card") return false;

    return true;
  });

  return shippingOptions;
});
