import { cookies } from "next/headers"
import CartTemplate from "@storefront/modules/cart/templates"
import { getCart, getUser } from "@storefront/lib/data"

export const metadata = {
  title: "Cart",
  description: "View your cart",
}

const fetchCart = async () => {
  const cartId = cookies().get("_openfront_cart_id")?.value

  if (!cartId) {
    return null
  }

  const cart = await getCart(cartId)

  if (!cart) {
    return null
  }

  return cart
}

export default async function Cart() {
  const cart = await fetchCart()
  const { authenticatedItem: user } = await getUser()

  return <CartTemplate cart={cart} user={user} />
}
