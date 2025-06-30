"use client"

import { Button } from "@/components/ui/button"; 

import CartTotals from "@/features/storefront/modules/common/components/cart-totals"
import Divider from "@/features/storefront/modules/common/components/divider"
import DiscountCode from "@/features/storefront/modules/checkout/components/discount-code"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import LinkStatus from "@/features/storefront/modules/common/components/link-status"

// Define inline type based on GraphQL schema and usage
type PromotionInfo = {
  code: string;
};

type RegionInfoForSummary = {
  id: string;
  currencyCode: string;
};

type CartSummary = {
  id: string;
  checkoutStep?: string | null; // Correct field name from schema
  subtotal?: number | null; // Correct field name from schema
  discountTotal?: number | null; // Correct field name from schema
  shippingTotal?: number | null; // Correct field name from schema
  taxTotal?: number | null; // Correct field name from schema
  total?: number | null; // Correct field name from schema
  promotions?: PromotionInfo[] | null; // Correct field name and type from schema
  discounts?: any[];
  giftCards?: any[];
  region?: RegionInfoForSummary | null; // Correct field name from schema
  currencyCode?: string; // Correct field name from schema
  lineItems?: any[]; // Keep basic structure for now
} | null;

type SummaryProps = {
  cart: CartSummary;
};

const Summary = ({ cart }: SummaryProps) => {
  // Use cart.checkoutStep directly from GraphQL data

  return (
    <div className="flex flex-col gap-y-4">
      {/* Replace Heading with h2 and Tailwind classes */}
      <h2 className="text-3xl leading-tight font-medium">Summary</h2>
      {/* Add null check and type assertion for DiscountCode */}
      {cart && <DiscountCode cart={cart} />}
      <Divider />
      {/* Pass cart data via 'data' prop */}
      <CartTotals data={cart} />
      {/* Add null check for cart and default step */}
      <LocalizedClientLink
        href={`/checkout?step=${cart?.checkoutStep ?? 'address'}`} // Default to 'address' step if null/missing
        data-testid="checkout-button"
      >
        <Button className="w-full h-10">
          <LinkStatus />
          Go to checkout
        </Button>
      </LocalizedClientLink>
    </div>
  )
}

export default Summary
