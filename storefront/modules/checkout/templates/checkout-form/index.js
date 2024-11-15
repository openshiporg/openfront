import Addresses from "@storefront/modules/checkout/components/addresses"
import Shipping from "@storefront/modules/checkout/components/shipping"
import Payment from "@storefront/modules/checkout/components/payment"
import Review from "@storefront/modules/checkout/components/review"
import {
  createPaymentSessions,
  getUser,
  listShippingMethods,
} from "@storefront/lib/data"
import { cookies } from "next/headers"
import { getCheckoutStep } from "@storefront/lib/util/get-checkout-step"

export default async function CheckoutForm() {
  const cartId = cookies().get("_openfront_cart_id")?.value

  if (!cartId) {
    return null
  }

  // create payment sessions and get cart
  const cart = (await createPaymentSessions(cartId).then((cart) => cart))

  if (!cart) {
    return null
  }

  cart.checkout_step = cart && getCheckoutStep(cart)

  // get available shipping methods
  const availableShippingMethods = await listShippingMethods(cart.region_id).then((methods) => methods?.filter((m) => !m.is_return))

  if (!availableShippingMethods) {
    return null
  }

  // get customer if logged in
  const customer = await getUser()

  return (
    <div>
      <div className="w-full grid grid-cols-1 gap-y-8">
        <div>
          <Addresses cart={cart} customer={customer} />
        </div>

        <div>
          <Shipping cart={cart} availableShippingMethods={availableShippingMethods} />
        </div>

        <div>
          <Payment cart={cart} />
        </div>

        <div>
          <Review cart={cart} />
        </div>
      </div>
    </div>
  );
}
