"use server";
import { cookies } from "next/headers";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { gql } from "graphql-request";
import { openfrontClient } from "@storefront/lib/config";
import { getCartId } from "@storefront/lib/data/cookies";
import {
  addShippingMethod,
  completeCart,
  deleteDiscount,
  setPaymentSession,
  updateCart,
} from "@storefront/lib/data/cart";

export async function cartUpdate(data) {
  const cartId = cookies().get("_openfront_cart_id")?.value;

  if (!cartId) return "No cartId cookie found";

  try {
    await updateCart(cartId, data);
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
    await deleteDiscount(cartId, code);
    revalidateTag("cart");
  } catch (error) {
    throw error;
  }
}

export async function removeGiftCard(codeToRemove, giftCards) {
  const cartId = cookies().get("_openfront_cart_id")?.value;

  if (!cartId) return "No cartId cookie found";

  try {
    await updateCart(cartId, {
      giftCards: [...giftCards]
        .filter((gc) => gc.code !== codeToRemove)
        .map((gc) => ({ code: gc.code })),
    }).then(() => {
      revalidateTag("cart");
    });
  } catch (error) {
    throw error;
  }
}

export async function submitDiscountForm(prevState, formData) {
  const cartId = getCartId();
  if (!cartId) return "No cartId cookie found";

  const code = formData.get("code");
  if (!code) {
    return "Code is required";
  }

  try {
    await openfrontClient.request(
      gql`
        mutation UpdateActiveCart($cartId: ID!, $code: String!) {
          updateActiveCart(cartId: $cartId, code: $code) {
            id
            discounts {
              id
              code
              discountRule {
                type
                value
              }
            }
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
        code,
      }
    );

    revalidateTag("cart");
  } catch (error) {
    return error.toString();
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

export async function setAddresses(currentState, formData) {
  if (!formData) return "No form data received";

  const cartId = cookies().get("_openfront_cart_id")?.value;

  if (!cartId) return { message: "No cartId cookie found" };

  const data = {
    shippingAddress: {
      firstName: formData.get("shippingAddress.firstName"),
      lastName: formData.get("shippingAddress.lastName"),
      address1: formData.get("shippingAddress.address1"),
      address2: "",
      company: formData.get("shippingAddress.company"),
      postalCode: formData.get("shippingAddress.postalCode"),
      city: formData.get("shippingAddress.city"),
      countryCode: formData.get("shippingAddress.countryCode"),
      province: formData.get("shippingAddress.province"),
      phone: formData.get("shippingAddress.phone"),
    },
    email: formData.get("email"),
  };

  const sameAsBilling = formData.get("same_as_billing");

  if (sameAsBilling === "on") data.billingAddress = data.shippingAddress;

  if (sameAsBilling !== "on")
    data.billingAddress = {
      firstName: formData.get("billingAddress.firstName"),
      lastName: formData.get("billingAddress.lastName"),
      address1: formData.get("billingAddress.address1"),
      address2: "",
      company: formData.get("billingAddress.company"),
      postalCode: formData.get("billingAddress.postalCode"),
      city: formData.get("billingAddress.city"),
      countryCode: formData.get("billingAddress.countryCode"),
      province: formData.get("billingAddress.province"),
      phone: formData.get("billingAddress.phone"),
    };

  try {
    await updateCart(cartId, data);
    revalidateTag("cart");
  } catch (error) {
    return error.toString();
  }

  redirect(
    `/${formData.get("shippingAddress.countryCode")}/checkout?step=delivery`
  );
}

export async function setShippingMethod(shippingMethodId) {
  const cartId = cookies().get("_openfront_cart_id")?.value;

  if (!cartId) throw new Error("No cartId cookie found");

  try {
    await addShippingMethod({ cartId, shippingMethodId });
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

  let cart;

  try {
    cart = await completeCart(cartId);
    revalidateTag("cart");
  } catch (error) {
    throw error;
  }

  if (cart?.type === "order") {
    const countryCode = cart.data.shippingAddress?.countryCode?.toLowerCase();
    cookies().set("_openfront_cart_id", "", { maxAge: -1 });
    redirect(`/${countryCode}/order/confirmed/${cart?.data.id}`);
  }

  return cart;
}
