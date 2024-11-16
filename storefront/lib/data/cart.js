"use server"
import { gql } from "graphql-request"
import { openfrontClient } from "../config"
import { getAuthHeaders } from "./cookies"

export async function getCart(cartId) {
  const GET_CART_QUERY = gql`
    query GetCart($cartId: ID!) {
      activeCart(cartId: $cartId) {
        cart {
          id
          email
          type
          user {
            id
          }
          region {
            id
            currency {
              code
              noDivisionCurrency
            }
            taxRate
          }
          subtotal
          total
          discount
          giftCardTotal
          tax
          shipping
          addresses {
            id
            firstName
            lastName
            address1
            address2
            company
            city
            province
            postalCode
            countryCode
            phone
          }
          paymentSessions {
            id
            status
            data
            idempotencyKey
            paymentProvider {
              id
              code
              isInstalled
            }
          }
          shippingMethods {
            id
            price
            shippingOption {
              id
              name
            }
          }
        }
        lineItems {
          id
          quantity
          title
          thumbnail
          description
          unitPrice
          originalPrice
          total
          percentageOff
          productVariant {
            id
            title
            product {
              id
              title
              thumbnail
              handle
            }
          }
        }
        giftCards {
          id
          code
          balance
        }
        discounts {
          id
          code
          isDynamic
          isDisabled
          discountRule {
            type
            value
            allocation
          }
        }
      }
    }
  `;

  const headers = getAuthHeaders();
  const { activeCart } = await openfrontClient.request(GET_CART_QUERY, { cartId }, headers);
  
  return activeCart?.cart && {
    ...activeCart.cart,
    ...(activeCart.lineItems && { lineItems: activeCart.lineItems }),
    ...(activeCart.giftCards && { giftCards: activeCart.giftCards }),
    ...(activeCart.discounts && { discounts: activeCart.discounts })
  };
}

export async function createCart(data = {}) {
  const CREATE_CART_MUTATION = gql`
    mutation CreateCart($data: CartCreateInput!) {
      createCart(data: $data) {
        id
        email
        type
        lineItems {
          id
          quantity
          productVariant {
            id
            title
            product {
              thumbnail
              title
            }
            prices {
              amount
              currency {
                code
              }
              calculatedPrice {
                calculatedAmount
                originalAmount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  const headers = getAuthHeaders();
  return openfrontClient.request(CREATE_CART_MUTATION, { data }, headers);
}

export async function updateCart(cartId, data) {
  const UPDATE_CART_MUTATION = gql`
    mutation UpdateActiveCart($cartId: ID!, $data: CartUpdateInput!) {
      updateActiveCart(cartId: $cartId, data: $data) {
        id
        email
        type
        user { id }
        region { 
          id 
          currency { code }
        }
        lineItems {
          id
          quantity
          productVariant {
            id
            title
            product {
              id
              title
              thumbnail
              handle
            }
            prices {
              id
              amount
              currency {
                code
              }
              calculatedPrice {
                calculatedAmount
                originalAmount
                currencyCode
              }
            }
          }
        }
        addresses {
          id
          firstName
          lastName
          address1
          address2
          company
          city
          province
          postalCode
          countryCode
          phone
        }
        paymentSessions {
          id
          status
          data
          idempotencyKey
          paymentProvider {
            id
            code
            isInstalled
          }
        }
        shippingMethods {
          id
          price
          shippingOption {
            id
            name
          }
        }
      }
    }
  `;

  const headers = getAuthHeaders();
  return openfrontClient.request(UPDATE_CART_MUTATION, { cartId, data }, headers);
}

export async function addItem({ cartId, variantId, quantity }) {
  const ADD_ITEM_MUTATION = gql`
    mutation AddItem($cartId: ID!, $data: CartUpdateInput!) {
      updateCart(
        where: { id: $cartId }
        data: {
          lineItems: {
            create: [
              {
                productVariant: { connect: { id: $variantId } }
                quantity: $quantity
              }
            ]
          }
        }
      ) {
        id
        lineItems {
          id
          quantity
          productVariant {
            id
            title
            prices {
              amount
              currency {
                code
              }
            }
          }
        }
      }
    }
  `;

  const headers = getAuthHeaders();
  return openfrontClient.request(ADD_ITEM_MUTATION, {
    cartId,
    data: {
      lineItems: {
        create: [
          {
            productVariant: { connect: { id: variantId } },
            quantity,
          },
        ],
      },
    },
  }, headers);
}

export async function updateItem({ cartId, lineId, quantity }) {
  const UPDATE_ITEM_MUTATION = gql`
    mutation UpdateItem($cartId: ID!, $data: CartUpdateInput!) {
      updateCart(
        where: { id: $cartId }
        data: {
          lineItems: {
            update: [{ where: { id: $lineId }, data: { quantity: $quantity } }]
          }
        }
      ) {
        id
        lineItems {
          id
          quantity
          productVariant {
            id
            title
            prices {
              amount
              currency {
                code
              }
            }
          }
        }
      }
    }
  `;

  const headers = getAuthHeaders();
  return openfrontClient.request(UPDATE_ITEM_MUTATION, {
    cartId,
    data: {
      lineItems: {
        update: [{ where: { id: lineId }, data: { quantity } }],
      },
    },
  }, headers);
}

export async function removeItem({ cartId, lineId }) {
  const REMOVE_ITEM_MUTATION = gql`
    mutation RemoveItem($cartId: ID!, $data: CartUpdateInput!) {
      updateCart(
        where: { id: $cartId }
        data: { lineItems: { delete: [{ id: $lineId }] } }
      ) {
        id
        lineItems {
          id
          quantity
          productVariant {
            id
            title
            prices {
              amount
              currency {
                code
              }
            }
          }
        }
      }
    }
  `;

  const headers = getAuthHeaders();
  return openfrontClient.request(REMOVE_ITEM_MUTATION, {
    cartId,
    data: { lineItems: { delete: [{ id: lineId }] } },
  }, headers);
}

export async function updateCartItems(cartId, lineItems) {
  const UPDATE_CART_ITEMS_MUTATION = gql`
    mutation UpdateCartItems($id: ID!, $data: CartUpdateInput!) {
      updateCart(where: { id: $id }, data: { lineItems: $data }) {
        id
        lineItems {
          id
          quantity
          productVariant {
            id
            title
            prices {
              amount
              currency {
                code
              }
            }
          }
        }
      }
    }
  `;

  const headers = getAuthHeaders();
  return openfrontClient.request(UPDATE_CART_ITEMS_MUTATION, {
    id: cartId,
    data: { lineItems },
  }, headers);
}

export async function deleteDiscount(cartId, code) {
  const DELETE_DISCOUNT_MUTATION = gql`
    mutation DeleteDiscount($cartId: ID!, $code: String!) {
      removeCartDiscount(where: { id: $cartId, code: $code }) {
        id
        discounts {
          id
          code
        }
      }
    }
  `;

  const headers = getAuthHeaders();
  return openfrontClient.request(DELETE_DISCOUNT_MUTATION, { cartId, code }, headers);
}

export async function createPaymentSessions(cartId) {
  const CREATE_PAYMENT_SESSIONS_MUTATION = gql`
    mutation CreatePaymentSessions($cartId: ID!) {
      createCartPaymentSessions(where: { id: $cartId }) {
        id
        paymentSessions {
          id
          status
        }
      }
    }
  `;

  const headers = getAuthHeaders();
  return openfrontClient.request(CREATE_PAYMENT_SESSIONS_MUTATION, { cartId }, headers);
}

export async function setPaymentSession({ cartId, providerId }) {
  const SET_PAYMENT_SESSION_MUTATION = gql`
    mutation SetPaymentSession($cartId: ID!, $providerId: ID!) {
      setCartPaymentSession(where: { id: $cartId }, providerId: $providerId) {
        id
        paymentSessions {
          id
          status
        }
      }
    }
  `;

  const headers = getAuthHeaders();
  return openfrontClient.request(SET_PAYMENT_SESSION_MUTATION, {
    cartId,
    providerId,
  }, headers);
}

export async function completeCart(cartId) {
  const COMPLETE_CART_MUTATION = gql`
    mutation CompleteCart($cartId: ID!) {
      completeCart(where: { id: $cartId }) {
        id
        status
      }
    }
  `;

  const headers = getAuthHeaders();
  return openfrontClient.request(COMPLETE_CART_MUTATION, { cartId }, headers);
}

export async function addShippingMethod({ cartId, shippingMethodId }) {
  const ADD_SHIPPING_METHOD_MUTATION = gql`
    mutation AddShippingMethod($cartId: ID!, $shippingMethodId: ID!) {
      addCartShippingMethod(
        where: { id: $cartId }
        shippingMethodId: $shippingMethodId
      ) {
        id
        shippingMethods {
          id
          name
        }
      }
    }
  `;

  const headers = getAuthHeaders();
  return openfrontClient.request(ADD_SHIPPING_METHOD_MUTATION, {
    cartId,
    shippingMethodId,
  }, headers);
}

// Add other cart functions... 