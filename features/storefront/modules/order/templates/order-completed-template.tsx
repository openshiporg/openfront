// Removed Heading import
import { cookies as nextCookies } from "next/headers"

import CartTotals from "@/features/storefront/modules/common/components/cart-totals"
import Help from "@/features/storefront/modules/order/components/help"
import Items from "@/features/storefront/modules/order/components/items"
import OnboardingCta from "@/features/storefront/modules/order/components/onboarding-cta"
import OrderDetails from "@/features/storefront/modules/order/components/order-details"
import ShippingDetails from "@/features/storefront/modules/order/components/shipping-details"
import PaymentDetails from "@/features/storefront/modules/order/components/payment-details"
import { StoreOrder } from "@/features/storefront/types/storefront"

type OrderCompletedTemplateProps = {
  order: StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  return (
    <div className="py-6 min-h-[calc(100vh-64px)]">
      <div className="mx-auto px-6 flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        {isOnboarding && <OnboardingCta orderId={order.id} />}
        <div
          className="flex flex-col gap-4 max-w-4xl h-full bg-background w-full py-10"
          data-testid="order-complete-container"
        >
          {/* Replace Heading with h1 */}
          <h1 className="flex flex-col gap-y-3 text-foreground text-3xl mb-4">
            <span>Thank you!</span>
            <span>Your order was placed successfully.</span>
          </h1>
          <OrderDetails order={order} />
          {/* Replace Heading with h2 */}
          <h2 className="flex flex-row text-3xl font-medium">Summary</h2>
          {/* Pass region prop */}
          <Items items={order.lineItems} region={order.region} />
          <CartTotals data={order} />
          <ShippingDetails order={order} />
          <PaymentDetails order={order} />
          <Help />
        </div>
      </div>
    </div>
  )
}
