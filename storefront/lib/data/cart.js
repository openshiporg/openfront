"use server";

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { gql } from "graphql-request";
import { openfrontClient } from "../config";
import { getAuthHeaders, getCartId, setCartId, removeCartId } from "./cookies";
import { redirect } from "next/navigation";
import { getUser } from "./user";

const CART_QUERY = gql`
  query GetCart($cartId: ID!) {
    activeCart(cartId: $cartId)
  }
`;

export async function retrieveCart() {
  const cartId = getCartId();
  if (!cartId) return null;

  const { activeCart } = await openfrontClient.request(
    CART_QUERY,
    { cartId },
    {
      next: {
        tags: ["cart"],
        revalidate: 0,
      },
    }
  );

  return activeCart;
}

export async function getCart(cartId) {
  const GET_CART_QUERY = gql`
    query GetCart($cartId: ID!) {
      activeCart(cartId: $cartId)
    }
  `;

  const headers = getAuthHeaders();
  const { activeCart } = await openfrontClient.request(
    GET_CART_QUERY,
    { cartId },
    headers
  );

  return activeCart;
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
  console.log("createCart", headers);
  return openfrontClient.request(CREATE_CART_MUTATION, { data }, headers);
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
  return openfrontClient.request(
    ADD_ITEM_MUTATION,
    {
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
    },
    headers
  );
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
  return openfrontClient.request(
    UPDATE_ITEM_MUTATION,
    {
      cartId,
      data: {
        lineItems: {
          update: [{ where: { id: lineId }, data: { quantity } }],
        },
      },
    },
    headers
  );
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
  return openfrontClient.request(
    REMOVE_ITEM_MUTATION,
    {
      cartId,
      data: { lineItems: { delete: [{ id: lineId }] } },
    },
    headers
  );
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
  return openfrontClient.request(
    UPDATE_CART_ITEMS_MUTATION,
    {
      id: cartId,
      data: { lineItems },
    },
    headers
  );
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
  return openfrontClient.request(
    DELETE_DISCOUNT_MUTATION,
    { cartId, code },
    headers
  );
}

export async function createPaymentSessions(cartId) {
  if (!cartId) return null;

  return openfrontClient.request(
    gql`
      mutation CreatePaymentSessions($cartId: ID!) {
        createActiveCartPaymentSessions(cartId: $cartId) {
          id
          paymentSessions {
            id
            paymentProvider {
              id
              code
            }
          }
        }
      }
    `,
    { cartId }
  );
}

export async function setPaymentSession({ cartId, providerId }) {
  const SET_PAYMENT_SESSION_MUTATION = gql`
    mutation SetPaymentSession($cartId: ID!, $providerId: ID!) {
      setCartPaymentSession(where: { id: $cartId }, providerId: $providerId) {
        id
        paymentSessions {
          id
        }
      }
    }
  `;

  const headers = getAuthHeaders();
  return openfrontClient.request(
    SET_PAYMENT_SESSION_MUTATION,
    {
      cartId,
      providerId,
    },
    headers
  );
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
  return openfrontClient.request(
    ADD_SHIPPING_METHOD_MUTATION,
    {
      cartId,
      shippingMethodId,
    },
    headers
  );
}

export async function addDiscountToCart(cartId, code) {
  if (!cartId) return null;

  const ADD_DISCOUNT_MUTATION = gql`
    mutation AddDiscountToActiveCart($cartId: ID!, $code: String!) {
      addDiscountToActiveCart(cartId: $cartId, code: $code) {
        id
        discounts {
          id
          code
          discountRule {
            type
            value
          }
        }
      }
    }
  `;

  const headers = getAuthHeaders();
  return openfrontClient.request(
    ADD_DISCOUNT_MUTATION,
    { cartId, code },
    headers
  );
}

export async function removeDiscountFromCart(cartId, code) {
  if (!cartId) return null;

  const REMOVE_DISCOUNT_MUTATION = gql`
    mutation RemoveDiscountFromActiveCart($cartId: ID!, $code: String!) {
      removeDiscountFromActiveCart(cartId: $cartId, code: $code) {
        id
        discounts {
          id
          code
        }
      }
    }
  `;

  const headers = getAuthHeaders();
  return openfrontClient.request(
    REMOVE_DISCOUNT_MUTATION,
    { cartId, code },
    headers
  );
}

export async function getOrSetCart(countryCode) {
  let cartId = getCartId();
  let cart = null;
  const headers = getAuthHeaders();

  // Try to get cart if we have an ID
  if (cartId) {
    try {
      const result = await openfrontClient.request(CART_QUERY, { cartId }, headers);
      cart = result?.activeCart;

      // If cart doesn't exist in DB, remove the cookie
      if (!cart) {
        removeCartId();
        cartId = null;
      }
    } catch (error) {
      // If there's an error (like invalid ID), remove the cookie
      removeCartId();
      cartId = null;
    }
  }

  // Get region ID for country code
  const { regions } = await openfrontClient.request(
    gql`
      query GetRegion($code: String!) {
        regions(where: { countries: { some: { iso2: { equals: $code } } } }) {
          id
        }
      }
    `,
    { code: countryCode },
    headers
  );

  const regionId = regions[0]?.id;
  if (!regionId) {
    throw new Error(`No region found for country: ${countryCode}`);
  }

  // If no cart exists or was invalid, create one
  if (!cart) {
    const { createCart: newCart } = await openfrontClient.request(
      gql`
        mutation CreateCart($data: CartCreateInput!) {
          createCart(data: $data) {
            id
            region {
              id
            }
          }
        }
      `,
      { 
        data: { 
          region: { connect: { id: regionId } }
        }
      },
      headers
    );

    cart = newCart;
    setCartId(cart.id);
    revalidateTag("cart");
  }
  // If cart exists but region changed, update it
  else if (cart.region?.id !== regionId) {
    const { updateActiveCart } = await openfrontClient.request(
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
          region: { connect: { id: regionId } }
        }
      },
      headers
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
  if (!cartId) return "No cartId cookie found";

  try {
    await openfrontClient.request(
      gql`
        mutation UpdateLineItem($cartId: ID!, $lineId: ID!, $quantity: Int!) {
          updateActiveCartLineItem(
            cartId: $cartId
            lineId: $lineId
            quantity: $quantity
          ) {
            id
            lineItems {
              id
              quantity
              title
              unitPrice
              originalPrice
              total
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
      {
        cartId,
        lineId,
        quantity,
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

  // Always revalidate regions and products, and redirect - even without a cart
  revalidateTag("regions");
  revalidateTag("products");

  // Only update cart if it exists
  if (cartId) {
    try {
      const { regions } = await openfrontClient.request(
        gql`
          query GetRegion($code: String!) {
            regions(
              where: { countries: { some: { iso2: { equals: $code } } } }
            ) {
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
            region: { connect: { id: regionId } },
          },
        }
      );

      revalidateTag("cart");
    } catch (error) {
      console.error("Error updating region:", error);
      throw error;
    }
  }

  redirect(`/${countryCode}${currentPath}`);
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

export async function cartUpdate(data) {
  const cartId = cookies().get("_openfront_cart_id")?.value;

  if (!cartId) return "No cartId cookie found";

  try {
    await updateCart(data);
    revalidateTag("cart");
  } catch (error) {
    return error.toString();
  }
}

export async function applyDiscount(code) {
  const cartId = cookies().get("_openfront_cart_id")?.value;

  if (!cartId) return "No cartId cookie found";

  try {
    await updateCart(cartId, { discounts: [{ code }] }).then(() => {
      revalidateTag("cart");
    });
  } catch (error) {
    throw error;
  }
}

export async function applyGiftCard(code) {
  const cartId = cookies().get("_openfront_cart_id")?.value;

  if (!cartId) return "No cartId cookie found";

  try {
    await updateCart(cartId, { giftCards: [{ code }] }).then(() => {
      revalidateTag("cart");
    });
  } catch (error) {
    throw error;
  }
}

export async function removeDiscount(code) {
  const cartId = cookies().get("_openfront_cart_id")?.value;

  if (!cartId) return "No cartId cookie found";

  try {
    await removeDiscountFromCart(cartId, code);
    revalidateTag("cart");
  } catch (error) {
    throw error;
  }
}

export async function removeGiftCard(code) {
  const cartId = cookies().get("_openfront_cart_id")?.value;

  if (!cartId) return "No cartId cookie found";

  try {
    await updateCart(cartId, {
      giftCards: [...giftCards]
        .filter((gc) => gc.code !== code)
        .map((gc) => ({ code: gc.code })),
    }).then(() => {
      revalidateTag("cart");
    });
  } catch (error) {
    throw error;
  }
}

export async function submitDiscountForm(prevState, formData) {
  const cartId = cookies().get("_openfront_cart_id")?.value;
  const code = formData.get("code");

  if (!code) {
    return "Code is required";
  }

  if (!cartId) {
    return "No cart found";
  }

  try {
    await addDiscountToCart(cartId, code);
    revalidateTag("cart");
    return null;
  } catch (error) {
    return error.message;
  }
}

export async function submitGiftCard(code) {
  const cartId = getCartId();
  if (!cartId) return "No cartId cookie found";

  try {
    await openfrontClient.request(
      gql`
        mutation UpdateActiveCart($cartId: ID!, $data: CartUpdateInput!) {
          updateActiveCart(cartId: $cartId, data: $data) {
            id
            giftCards {
              id
              code
              balance
            }
          }
        }
      `,
      {
        cartId,
        data: {
          giftCards: {
            connect: [{ code }],
          },
        },
      }
    );

    revalidateTag("cart");
  } catch (error) {
    return error.toString();
  }
}

const UPDATE_CART_MUTATION = gql`
  mutation UpdateActiveCart($cartId: ID!, $data: CartUpdateInput!) {
    updateActiveCart(cartId: $cartId, data: $data) {
      id
      shippingAddress {
        id
        firstName
        lastName
        address1
        city
        country {
          id
          iso2
          displayName
        }
      }
      billingAddress {
        id
        firstName
        lastName
        address1
        city
        country {
          id
          iso2
          displayName
        }
      }
    }
  }
`;

export async function setAddresses(currentState, formData) {
  if (!formData) return "No form data received";

  const cartId = cookies().get("_openfront_cart_id")?.value;
  if (!cartId) return { message: "No cartId cookie found" };

  const selectedAddressId = formData.get("selectedAddressId");
  const hasModifiedFields = formData.get("hasModifiedFields") === "true";
  const sameAsBilling = formData.get("same_as_billing") === "on";
  const email = formData.get("email");

  const data = { email };

  // Check if user is authenticated
  const user = await getUser();

  // If we selected an address and haven't modified it, just connect it
  if (selectedAddressId && !hasModifiedFields) {
    data.shippingAddress = {
      connect: { id: selectedAddressId },
    };

    if (sameAsBilling) {
      data.billingAddress = {
        connect: { id: selectedAddressId },
      };
    }
  } else {
    // Either no address was selected or fields were modified - create new address
    const shippingAddress = {
      firstName: formData.get("shippingAddress.firstName"),
      lastName: formData.get("shippingAddress.lastName"),
      address1: formData.get("shippingAddress.address1"),
      address2: "",
      company: formData.get("shippingAddress.company"),
      postalCode: formData.get("shippingAddress.postalCode"),
      city: formData.get("shippingAddress.city"),
      province: formData.get("shippingAddress.province"),
      phone: formData.get("shippingAddress.phone"),
      country: {
        connect: {
          iso2: formData.get("shippingAddress.countryCode")
        }
      }
    };

    // If user is authenticated, create address with user connection
    if (user) {
      shippingAddress.user = { connect: { id: user.id } };
    } else {
      // For guest users, create a new user inline with the address
      shippingAddress.user = { 
        create: {
          email,
          hasAccount: false,
          name: `${formData.get("shippingAddress.firstName")} ${formData.get("shippingAddress.lastName")}`,
        }
      };
    }

    // Create shipping address first
    try {
      const { createAddress: newShippingAddress } =
        await openfrontClient.request(
          gql`
            mutation CreateAddress($data: AddressCreateInput!) {
              createAddress(data: $data) {
                id
                user {
                  id
                }
                country {
                  id
                  iso2
                  displayName
                }
              }
            }
          `,
          {
            data: shippingAddress,
          },
          user ? getAuthHeaders() : undefined
        );

      data.shippingAddress = {
        connect: { id: newShippingAddress.id },
      };

      // Connect the guest user to the cart if one was created
      if (!user && newShippingAddress.user?.id) {
        data.user = { connect: { id: newShippingAddress.user.id } };
      }

      if (sameAsBilling) {
        data.billingAddress = {
          connect: { id: newShippingAddress.id },
        };
      } else {
        const billingAddress = {
          firstName: formData.get("billingAddress.firstName"),
          lastName: formData.get("billingAddress.lastName"),
          address1: formData.get("billingAddress.address1"),
          address2: "",
          company: formData.get("billingAddress.company"),
          postalCode: formData.get("billingAddress.postalCode"),
          city: formData.get("billingAddress.city"),
          province: formData.get("billingAddress.province"),
          phone: formData.get("billingAddress.phone"),
          country: {
            connect: {
              iso2: formData.get("billingAddress.countryCode")
            }
          }
        };

        // Add user connection to billing address
        if (user) {
          billingAddress.user = { connect: { id: user.id } };
        } else if (data.user) {
          // If we have a guest user from shipping address, connect to it
          billingAddress.user = data.user;
        }

        const { createAddress: newBillingAddress } =
          await openfrontClient.request(
            gql`
              mutation CreateAddress($data: AddressCreateInput!) {
                createAddress(data: $data) {
                  id
                  user {
                    id
                  }
                  country {
                    id
                    iso2
                    displayName
                  }
                }
              }
            `,
            {
              data: billingAddress,
            },
            user ? getAuthHeaders() : undefined
          );

        data.billingAddress = {
          connect: { id: newBillingAddress.id },
        };
      }
    } catch (error) {
      console.error("Error creating address:", error);
      return error.toString();
    }
  }

  try {
    await openfrontClient.request(
      UPDATE_CART_MUTATION,
      {
        cartId,
        data,
      },
      user ? getAuthHeaders() : undefined
    );

    revalidateTag("cart");
  } catch (error) {
    console.error("Error updating cart:", error);
    return error.toString();
  }

  redirect(
    `/${formData.get("shippingAddress.countryCode")}/checkout?step=delivery`
  );
}

export async function setShippingMethod(shippingOptionId) {
  const cartId = cookies().get("_openfront_cart_id")?.value;

  if (!cartId) throw new Error("No cartId cookie found");

  try {
    // Use the singular version which handles cleanup internally
    await openfrontClient.request(
      gql`
        mutation AddShippingMethod($cartId: ID!, $shippingMethodId: ID!) {
          addActiveCartShippingMethod(
            cartId: $cartId
            shippingMethodId: $shippingMethodId
          ) {
            id
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
      `,
      {
        cartId,
        shippingMethodId: shippingOptionId,
      },
      getAuthHeaders()
    );

    revalidateTag("cart");
  } catch (error) {
    throw error;
  }
}

export async function setPaymentMethod(providerId) {
  const cartId = cookies().get("_openfront_cart_id")?.value;

  if (!cartId) throw new Error("No cartId cookie found");

  try {
    const cart = await setPaymentSession({ cartId, providerId });
    revalidateTag("cart");
    return cart;
  } catch (error) {
    throw error;
  }
}

export async function placeOrder() {
  const cartId = cookies().get("_openfront_cart_id")?.value;
  if (!cartId) throw new Error("No cartId cookie found");

  try {
    const { completeActiveCart } = await openfrontClient.request(
      gql`
        mutation CompleteActiveCart($cartId: ID!) {
          completeActiveCart(cartId: $cartId)
        }
      `,
      {
        cartId,
      }
    );
    
    if (completeActiveCart?.id) {
      // Remove cart cookie after successful order
      removeCartId();
      revalidateTag("cart");

      // Redirect to order confirmation page with lowercase countryCode
      const countryCode = completeActiveCart.shippingAddress?.country?.iso2?.toLowerCase();
      if (!countryCode) {
        throw new Error("No country code found in completed order");
      }

      // Add secretKey to URL if it exists (for non-logged-in users)
      const secretKeyParam = completeActiveCart.secretKey ? 
        `?secretKey=${completeActiveCart.secretKey}` : '';

      redirect(`/${countryCode}/order/confirmed/${completeActiveCart.id}${secretKeyParam}`);
    }

    return completeActiveCart;
  } catch (error) {
    // Check if this is a Next.js redirect error
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      // This is an expected redirect, let it propagate
      throw error;
    }
    
    // Log and rethrow other errors
    console.error("Error placing order:", error);
    throw error;
  }
}
