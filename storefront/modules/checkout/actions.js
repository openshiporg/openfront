"use server";
import { cookies } from "next/headers"

import {
  addShippingMethod,
  completeCart,
  deleteDiscount,
  setPaymentSession,
  updateCart,
} from "@storefront/lib/data"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"

export async function cartUpdate(data) {
  const cartId = cookies().get("_openfront_cart_id")?.value

  if (!cartId) return "No cartId cookie found"

  try {
    await updateCart(cartId, data)
    revalidateTag("cart")
  } catch (error) {
    return error.toString();
  }
}

export async function applyDiscount(code) {
  const cartId = cookies().get("_openfront_cart_id")?.value

  if (!cartId) return "No cartId cookie found"

  try {
    await updateCart(cartId, { discounts: [{ code }] }).then(() => {
      revalidateTag("cart")
    })
  } catch (error) {
    throw error
  }
}

export async function applyGiftCard(code) {
  const cartId = cookies().get("_openfront_cart_id")?.value

  if (!cartId) return "No cartId cookie found"

  try {
    await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
      revalidateTag("cart")
    })
  } catch (error) {
    throw error
  }
}

export async function removeDiscount(code) {
  const cartId = cookies().get("_openfront_cart_id")?.value

  if (!cartId) return "No cartId cookie found"

  try {
    await deleteDiscount(cartId, code)
    revalidateTag("cart")
  } catch (error) {
    throw error
  }
}

export async function removeGiftCard(
  codeToRemove,
  giftCards
) {
  const cartId = cookies().get("_openfront_cart_id")?.value

  if (!cartId) return "No cartId cookie found"

  try {
    await updateCart(cartId, {
      gift_cards: [...giftCards]
        .filter((gc) => gc.code !== codeToRemove)
        .map((gc) => ({ code: gc.code })),
    }).then(() => {
      revalidateTag("cart")
    })
  } catch (error) {
    throw error
  }
}

export async function submitDiscountForm(
  currentState,
  formData
) {
  const code = formData.get("code")

  try {
    await applyDiscount(code).catch(async (err) => {
      await applyGiftCard(code)
    })
    return null
  } catch (error) {
    return error.toString();
  }
}

export async function setAddresses(currentState, formData) {
  if (!formData) return "No form data received"

  const cartId = cookies().get("_openfront_cart_id")?.value

  if (!cartId) return { message: "No cartId cookie found" }

  const data = {
    shipping_address: {
      first_name: formData.get("shipping_address.first_name"),
      last_name: formData.get("shipping_address.last_name"),
      address_1: formData.get("shipping_address.address_1"),
      address_2: "",
      company: formData.get("shipping_address.company"),
      postal_code: formData.get("shipping_address.postal_code"),
      city: formData.get("shipping_address.city"),
      country_code: formData.get("shipping_address.country_code"),
      province: formData.get("shipping_address.province"),
      phone: formData.get("shipping_address.phone"),
    },

    email: formData.get("email")
  }

  const sameAsBilling = formData.get("same_as_billing")

  if (sameAsBilling === "on") data.billing_address = data.shipping_address

  if (sameAsBilling !== "on")
    data.billing_address = {
      first_name: formData.get("billing_address.first_name"),
      last_name: formData.get("billing_address.last_name"),
      address_1: formData.get("billing_address.address_1"),
      address_2: "",
      company: formData.get("billing_address.company"),
      postal_code: formData.get("billing_address.postal_code"),
      city: formData.get("billing_address.city"),
      country_code: formData.get("billing_address.country_code"),
      province: formData.get("billing_address.province"),
      phone: formData.get("billing_address.phone")
    }

  try {
    await updateCart(cartId, data)
    revalidateTag("cart")
  } catch (error) {
    return error.toString();
  }

  redirect(`/${formData.get("shipping_address.country_code")}/checkout?step=delivery`)
}

export async function setShippingMethod(shippingMethodId) {
  const cartId = cookies().get("_openfront_cart_id")?.value

  if (!cartId) throw new Error("No cartId cookie found")

  try {
    await addShippingMethod({ cartId, shippingMethodId })
    revalidateTag("cart")
  } catch (error) {
    throw error
  }
}

export async function setPaymentMethod(providerId) {
  const cartId = cookies().get("_openfront_cart_id")?.value

  if (!cartId) throw new Error("No cartId cookie found")

  try {
    const cart = await setPaymentSession({ cartId, providerId })
    revalidateTag("cart")
    return cart
  } catch (error) {
    throw error
  }
}

export async function placeOrder() {
  const cartId = cookies().get("_openfront_cart_id")?.value

  if (!cartId) throw new Error("No cartId cookie found")

  let cart

  try {
    cart = await completeCart(cartId)
    revalidateTag("cart")
  } catch (error) {
    throw error
  }

  if (cart?.type === "order") {
    const countryCode = cart.data.shipping_address?.country_code?.toLowerCase()
    cookies().set("_openfront_cart_id", "", { maxAge: -1 })
    redirect(`/${countryCode}/order/confirmed/${cart?.data.id}`)
  }

  return cart
}
