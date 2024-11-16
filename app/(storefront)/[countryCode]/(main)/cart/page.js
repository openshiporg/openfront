import CartTemplate from "@storefront/modules/cart/templates"
import { retrieveCart } from "@storefront/modules/cart/actions"
import { getUser } from "@storefront/lib/data/user"

export const metadata = {
  title: "Cart",
  description: "View your cart",
}

export default async function Cart() {
  const cart = await retrieveCart()
  const { authenticatedItem: user } = await getUser()

  return <CartTemplate cart={cart} user={user} />
}
