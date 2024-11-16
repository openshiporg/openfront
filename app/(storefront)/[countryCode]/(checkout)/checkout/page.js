import { cookies } from "next/headers"
import { notFound } from "next/navigation"

import Wrapper from "@storefront/modules/checkout/components/payment-wrapper"
import CheckoutForm from "@storefront/modules/checkout/templates/checkout-form"
import CheckoutSummary from "@storefront/modules/checkout/templates/checkout-summary"
import { getCart } from "@storefront/lib/data/cart"

export const metadata = {
  title: "Checkout",
}

const fetchCart = async () => {
  const cartId = cookies().get("_openfront_cart_id")?.value

  if (!cartId) {
    return notFound();
  }

  const cart = await getCart(cartId).then((cart) => cart)

  return cart
}

export default async function Checkout() {
  const cart = await fetchCart()

  if (!cart) {
    return notFound();
  }

  return (
    <div
      className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
      <Wrapper cart={cart}>
        <CheckoutForm />
      </Wrapper>
      <CheckoutSummary />
    </div>
  );
}
