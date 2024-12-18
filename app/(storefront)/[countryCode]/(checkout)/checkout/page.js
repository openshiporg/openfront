import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import Wrapper from "@storefront/modules/checkout/components/payment-wrapper";
import CheckoutForm from "@storefront/modules/checkout/templates/checkout-form";
import CheckoutSummary from "@storefront/modules/checkout/templates/checkout-summary";
import { retrieveCart } from "@storefront/lib/data/cart";
import { getUser } from "@storefront/lib/data/user";
import { Card } from "@keystone/themes/Tailwind/atlas/primitives/default/ui/card";

export const metadata = {
  title: "Checkout",
};

const fetchCart = async () => {
  const cartId = cookies().get("_openfront_cart_id")?.value;

  if (!cartId) {
    return notFound();
  }

  const cart = await retrieveCart(cartId);

  if (!cart) {
    return notFound();
  }

  return cart;
};

export default async function Checkout() {
  const cart = await fetchCart();
  const customer = await getUser();

  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
      <Wrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} />
      </Wrapper>
      <CheckoutSummary cart={cart} />
    </div>
  );
}
