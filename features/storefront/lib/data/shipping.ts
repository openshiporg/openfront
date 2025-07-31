"use server"
import { gql } from "graphql-request"
import { openfrontClient } from "../config"
import { cache } from "react"

export const getCartShippingOptions = cache(async function (cartId: string) {
  const GET_SHIPPING_OPTIONS = gql`
    query GetShippingOptions($cartId: ID!) {
      activeCartShippingOptions(cartId: $cartId) {
        id
        name
        amount
        calculatedAmount
        isTaxInclusive
        priceType
        data
      }
    }
  `;

  const { activeCartShippingOptions } = await openfrontClient.request(GET_SHIPPING_OPTIONS, { cartId });
  return activeCartShippingOptions;
}); 
