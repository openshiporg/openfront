import { Heading } from "@medusajs/ui"
import { getCart } from "@storefront/lib/data/cart"

import ItemsPreviewTemplate from "@storefront/modules/cart/templates/preview"
import DiscountCode from "@storefront/modules/checkout/components/discount-code"
import CartTotals from "@storefront/modules/common/components/cart-totals"
import Divider from "@storefront/modules/common/components/divider"
import { cookies } from "next/headers"

const CheckoutSummary = async () => {
  const cartId = cookies().get("_openfront_cart_id")?.value

  if (!cartId) {
    return null
  }

  const cart = await getCart(cartId).then((cart) => cart)

  if (!cart) {
    return null
  }

  return (
    <div
      className="sticky top-0 flex flex-col-reverse small:flex-col gap-y-8 py-8 small:py-0 ">
      <div className="w-full bg-white flex flex-col">
        <Divider className="my-6 small:hidden" />
        <Heading level="h2" className="flex flex-row text-3xl-regular items-baseline">
          In your Cart
        </Heading>
        <Divider className="my-6" />
        <CartTotals data={cart} />
        <ItemsPreviewTemplate region={cart?.region} items={cart?.items} />
        <div className="my-6">
          <DiscountCode cart={cart} />
        </div>
      </div>
    </div>
  );
}

export default CheckoutSummary
