"use client";
import { Button, Heading } from "@medusajs/ui"

import CartTotals from "@storefront/modules/common/components/cart-totals"
import Divider from "@storefront/modules/common/components/divider"
import DiscountCode from "@storefront/modules/checkout/components/discount-code"
import LocalizedClientLink from "@storefront/modules/common/components/localized-client-link"

const Summary = ({ cart }) => {
  // If no shipping methods selected, use cheapestShipping for preview
  const cartData = {
    ...cart,
    shipping: cart.shipping ?? cart.cheapestShipping
  };

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        Summary
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals data={cartData} />
      <LocalizedClientLink href={"/checkout?step=" + cart.checkoutStep}>
        <Button className="w-full h-10">Go to checkout</Button>
      </LocalizedClientLink>
    </div>
  );
}

export default Summary
