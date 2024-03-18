"use server";
import { omit } from "lodash"
import { revalidateTag } from "next/cache"
import { cookies } from "next/headers"

import {
  addItem,
  createCart,
  getCart,
  getProductsById,
  getRegion,
  removeItem,
  updateCart,
  updateItem,
} from "@storefront/lib/data"

/**
 * Retrieves the cart based on the cartId cookie
 *
 * @returns {Promise<Cart>} The cart
 * @example
 * const cart = await getOrSetCart()
 */
export async function getOrSetCart(countryCode) {
  const cartId = cookies().get("_openfront_cart_id")?.value
  let cart

  if (cartId) {
    cart = await getCart(cartId).then((cart) => cart)
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const region_id = region.id

  if (!cart) {
    cart = await createCart({ region_id }).then((res) => res)
    cart && cookies().set("_openfront_cart_id", cart.id)
    revalidateTag("cart")
  }

  if (cart && cart?.region_id !== region_id) {
    await updateCart(cart.id, { region_id })
    revalidateTag("cart")
  }

  return cart
}

export async function retrieveCart() {
  const cartId = cookies().get("_openfront_cart_id")?.value

  if (!cartId) {
    return null
  }

  try {
    const cart = await getCart(cartId).then((cart) => cart)
    return cart
  } catch (e) {
    console.log(e)
    return null
  }
}

export async function addToCart({
  variantId,
  quantity,
  countryCode
}) {
  const cart = await getOrSetCart(countryCode).then((cart) => cart)

  if (!cart) {
    return "Missing cart ID"
  }

  if (!variantId) {
    return "Missing product variant ID"
  }

  try {
    await addItem({ cartId: cart.id, variantId, quantity })
    revalidateTag("cart")
  } catch (e) {
    return "Error adding item to cart"
  }
}

export async function updateLineItem({
  lineId,
  quantity
}) {
  const cartId = cookies().get("_openfront_cart_id")?.value

  if (!cartId) {
    return "Missing cart ID"
  }

  if (!lineId) {
    return "Missing lineItem ID"
  }

  if (!cartId) {
    return "Missing cart ID"
  }

  try {
    await updateItem({ cartId, lineId, quantity })
    revalidateTag("cart")
  } catch (e) {
    return e.toString();
  }
}

export async function deleteLineItem(lineId) {
  const cartId = cookies().get("_openfront_cart_id")?.value

  if (!cartId) {
    return "Missing cart ID"
  }

  if (!lineId) {
    return "Missing lineItem ID"
  }

  if (!cartId) {
    return "Missing cart ID"
  }

  try {
    await removeItem({ cartId, lineId })
    revalidateTag("cart")
  } catch (e) {
    return "Error deleting line item"
  }
}

export async function enrichLineItems(lineItems, regionId) {
  // Prepare query parameters
  const queryParams = {
    ids: lineItems.map((lineItem) => lineItem.variant.product_id),
    regionId: regionId,
  }

  // Fetch products by their IDs
  const products = await getProductsById(queryParams)

  // If there are no line items or products, return an empty array
  if (!lineItems?.length || !products) {
    return []
  }

  // Enrich line items with product and variant information

  const enrichedItems = lineItems.map((item) => {
    const product = products.find((p) => p.id === item.variant.product_id)
    const variant = product?.variants.find((v) => v.id === item.variant_id)

    // If product or variant is not found, return the original item
    if (!product || !variant) {
      return item
    }

    // If product and variant are found, enrich the item
    return {
      ...item,
      variant: {
        ...variant,
        product: omit(product, "variants"),
      },
    };
  })

  return enrichedItems
}
