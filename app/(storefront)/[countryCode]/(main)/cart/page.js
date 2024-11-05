import { cookies } from "next/headers"

import CartTemplate from "@storefront/modules/cart/templates"

import { getCheckoutStep } from "@storefront/lib/util/get-checkout-step"
import { getCart, getCustomer } from "@storefront/lib/data"

export const metadata = {
  title: "Cart",
  description: "View your cart",
}

const fetchCart = async () => {
  const cartId = cookies().get("_openfront_cart_id")?.value

  if (!cartId) {
    return null
  }

  const cart = await getCart(cartId).then((cart) => cart)

  if (!cart) {
    return null
  }


  // cart.checkoutStep = cart && getCheckoutStep(cart)

  return cart
}

export default async function Cart() {
  const cart = await fetchCart()
  const customer = await getCustomer()

  return <CartTemplate cart={cart} customer={customer} />;
}
