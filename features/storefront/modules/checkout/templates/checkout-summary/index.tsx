// Removed Medusa UI import

import ItemsPreviewTemplate from "@/features/storefront/modules/cart/templates/preview"
import DiscountCode from "@/features/storefront/modules/checkout/components/discount-code"
import CartTotals from "@/features/storefront/modules/common/components/cart-totals"
import Divider from "@/features/storefront/modules/common/components/divider"

const CheckoutSummary = ({ cart }: { cart: any }) => {
  return (
    <div className="sticky top-0 flex flex-col-reverse sm:flex-col gap-y-8 py-8 sm:py-0 ">
      <div className="w-full bg-background flex flex-col">
        <Divider className="my-6 sm:hidden" />
        <h2 className="flex flex-row text-3xl font-medium items-baseline">
          In your Cart
        </h2>
        <Divider className="my-6" />
        <CartTotals data={cart} />
        <ItemsPreviewTemplate region={cart?.region} items={cart?.lineItems} />
        <div className="my-6">
          <DiscountCode cart={cart} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
