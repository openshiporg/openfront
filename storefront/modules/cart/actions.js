"use server";

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { gql } from "graphql-request";
import { openfrontClient } from "@storefront/lib/config";
import { getCartId, setCartId } from "@lib/cookies";

export async function retrieveCart() {
  const cartId = getCartId();
  if (!cartId) return null;

  const {
    activeCart: { cart, lineItems },
  } = await openfrontClient.request(
    gql`
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
        }
      }
    `,
    { cartId },
    {
      next: {
        tags: ["cart"],
        revalidate: 0,
      },
    }
  );

  return { ...cart, lineItems };
}

export async function getOrSetCart(countryCode) {
  let cart = await retrieveCart();

  // Get region ID for country code
  const { regions } = await openfrontClient.request(
    gql`
      query GetRegion($code: String!) {
        regions(where: { countries: { some: { iso2: { equals: $code } } } }) {
          id
        }
      }
    `,
    { code: countryCode }
  );

  const regionId = regions[0]?.id;
  if (!regionId) {
    throw new Error(`No region found for country: ${countryCode}`);
  }

  // If no cart exists, create one
  if (!cart) {
    const { createCart: newCart } = await openfrontClient.request(
      gql`
        mutation CreateCart($regionId: ID!) {
          createCart(data: { region: { connect: { id: $regionId } } }) {
            id
          }
        }
      `,
      { regionId }
    );

    cart = newCart;
    setCartId(cart.id);
    revalidateTag("cart");
  }

  // If cart exists but region changed, update it
  if (cart && cart.region?.id !== regionId) {
    await openfrontClient.request(
      gql`
        mutation UpdateActiveCart($cartId: ID!, $data: CartUpdateInput!) {
          updateActiveCart(cartId: $cartId, data: $data) {
            id
          }
        }
      `,
      {
        cartId: cart.id,
        data: {
          region: { connect: { id: regionId } },
        },
      }
    );
    revalidateTag("cart");
  }

  return cart;
}

export async function addToCart({ variantId, quantity, countryCode }) {
  if (!variantId) {
    throw new Error("Missing variant ID when adding to cart");
  }

  const cart = await getOrSetCart(countryCode);
  if (!cart) {
    throw new Error("Error retrieving or creating cart");
  }

  try {
    await openfrontClient.request(
      gql`
        mutation UpdateActiveCart($cartId: ID!, $data: CartUpdateInput!) {
          updateActiveCart(cartId: $cartId, data: $data) {
            id
            lineItems {
              id
              quantity
            }
          }
        }
      `,
      {
        cartId: cart.id,
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
      }
    );
    revalidateTag("cart");
  } catch (error) {
    return error.toString();
  }
}

export async function updateLineItem({ lineId, quantity }) {
  const cartId = cookies().get("_openfront_cart_id")?.value;
  if (!cartId) return "No cart ID found";

  try {
    await openfrontClient.request(
      gql`
        mutation UpdateActiveCart($cartId: ID!, $data: CartUpdateInput!) {
          updateActiveCart(cartId: $cartId, data: $data) {
            id
            lineItems {
              id
              quantity
            }
          }
        }
      `,
      {
        cartId,
        data: {
          lineItems: {
            update: [
              {
                where: { id: lineId },
                data: { quantity },
              },
            ],
          },
        },
      }
    );

    revalidateTag("cart");
  } catch (error) {
    return error.toString();
  }
}

export async function deleteLineItem(lineId) {
  const cartId = cookies().get("_openfront_cart_id")?.value;
  if (!cartId) return "No cart ID found";

  try {
    await openfrontClient.request(
      gql`
        mutation UpdateActiveCart($cartId: ID!, $data: CartUpdateInput!) {
          updateActiveCart(cartId: $cartId, data: $data) {
            id
            lineItems {
              id
            }
          }
        }
      `,
      {
        cartId,
        data: {
          lineItems: {
            disconnect: [{ id: lineId }],
          },
        },
      }
    );

    revalidateTag("cart");
  } catch (error) {
    return error.toString();
  }
}

export async function updateRegion(countryCode, currentPath) {
  const cartId = cookies().get("_openfront_cart_id")?.value;
  if (!cartId) return;

  try {
    // Get region ID for country code
    const { regions } = await openfrontClient.request(
      gql`
        query GetRegion($code: String!) {
          regions(where: { countries: { some: { iso2: { equals: $code } } } }) {
            id
          }
        }
      `,
      { code: countryCode }
    );

    const regionId = regions[0]?.id;
    if (!regionId) {
      throw new Error(`No region found for country: ${countryCode}`);
    }

    // Update cart with new region
    await openfrontClient.request(
      gql`
        mutation UpdateActiveCart($cartId: ID!, $data: CartUpdateInput!) {
          updateActiveCart(cartId: $cartId, data: $data) {
            id
          }
        }
      `,
      {
        cartId,
        data: {
          region: { connect: { id: regionId } }
        }
      }
    );

    // Revalidate cart data
    revalidateTag("cart");

  } catch (error) {
    console.error("Error updating region:", error);
    throw error;
  }
}

export async function updateCart(data) {
  const cartId = getCartId();
  if (!cartId) return "No cart ID found";

  try {
    await openfrontClient.request(
      gql`
        mutation UpdateActiveCart($cartId: ID!, $data: CartUpdateInput!) {
          updateActiveCart(cartId: $cartId, data: $data) {
            id
          }
        }
      `,
      {
        cartId,
        data,
      }
    );

    revalidateTag("cart");
  } catch (error) {
    console.error("Error updating cart:", error);
    throw error;
  }
}
