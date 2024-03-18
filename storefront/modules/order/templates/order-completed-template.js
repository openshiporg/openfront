import { Heading } from "@medusajs/ui"
import { cookies } from "next/headers"

import CartTotals from "@storefront/modules/common/components/cart-totals"
import Help from "@storefront/modules/order/components/help"
import Items from "@storefront/modules/order/components/items"
import OnboardingCta from "@storefront/modules/order/components/onboarding-cta"
import OrderDetails from "@storefront/modules/order/components/order-details"
import ShippingDetails from "@storefront/modules/order/components/shipping-details"
import PaymentDetails from "@storefront/modules/order/components/payment-details"

export default function OrderCompletedTemplate({
  order
}) {
  const isOnboarding = cookies().get("_openfront_onboarding")?.value === "true"

  return (
    <div className="py-6 min-h-[calc(100vh-64px)]">
      <div
        className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        {isOnboarding && <OnboardingCta orderId={order.id} />}
        <div className="flex flex-col gap-4 max-w-4xl h-full bg-white w-full py-10">
          <Heading
            level="h1"
            className="flex flex-col gap-y-3 text-ui-fg-base text-3xl mb-4">
            <span>Thank you!</span>
            <span>Your order was placed successfully.</span>
          </Heading>
          <OrderDetails order={order} />
          <Heading level="h2" className="flex flex-row text-3xl-regular">
            Summary
          </Heading>
          <Items items={order.items} region={order.region} />
          <CartTotals data={order} />
          <ShippingDetails order={order} />
          <PaymentDetails order={order} />
          <Help />
        </div>
      </div>
    </div>
  );
}
