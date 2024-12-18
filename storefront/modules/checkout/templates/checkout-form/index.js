import Addresses from "@storefront/modules/checkout/components/addresses";
import Shipping from "@storefront/modules/checkout/components/shipping";
import Payment from "@storefront/modules/checkout/components/payment";
import Review from "@storefront/modules/checkout/components/review";
import { listCartPaymentMethods } from "@storefront/lib/data/payment";
import { getCartShippingOptions } from "@storefront/lib/data/shipping";

export default async function CheckoutForm({ cart, customer }) {
  if (!cart) {
    return null;
  }

  // get available shipping methods and payment methods
  const availableShippingMethods = await getCartShippingOptions(cart.id);
  const availablePaymentMethods = await listCartPaymentMethods(cart.region.id);

  if (!availableShippingMethods || !availablePaymentMethods) {
    return null;
  }

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
          <Payment cart={cart} availablePaymentMethods={availablePaymentMethods} />
        </div>

        <div>
          <Review cart={cart} />
        </div>
      </div>
    </div>
  );
}
