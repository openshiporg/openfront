"use client"

import { updateCart } from "@/features/storefront/lib/data/cart"
import { AlertCircle } from "lucide-react" // Use lucide icon
// Removed Medusa types import
import { Button } from "@/components/ui/button"; 
import { useState } from "react"

// Define inline types based on GraphQL schema
type CartForBanner = {
  id: string;
  customerId?: string | null; // Correct field name
};

type CustomerForBanner = {
  id: string;
};

type CartMismatchBannerProps = {
  customer: CustomerForBanner;
  cart: CartForBanner;
};

function CartMismatchBanner(props: CartMismatchBannerProps) {
  const { customer, cart } = props
  const [isPending, setIsPending] = useState(false)
  const [actionText, setActionText] = useState("Run transfer again")

  if (!customer || !!cart.customerId) { // Corrected field name
    return
  }

  const handleSubmit = async () => {
    try {
      setIsPending(true)
      setActionText("Transferring..")

      await updateCart({ customer_id: customer.id })
    } catch {
      setActionText("Run transfer again")
      setIsPending(false)
    }
  }

  return (
    <div className="flex items-center justify-center sm:p-4 p-2 text-center bg-orange-300 sm:gap-2 gap-1 text-sm mt-2 text-orange-800">
      <div className="flex flex-col sm:flex-row sm:gap-2 gap-1 items-center">
        <span className="flex items-center gap-1">
          <AlertCircle className="inline h-4 w-4" />
          Something went wrong when we tried to transfer your cart
        </span>

        <span>·</span>

        <Button
          variant="link" // Use Shadcn link variant for transparent look
          className="disabled:text-orange-500 text-orange-950 p-0 h-auto" // Adjusted classes for link variant
          size="sm" // Use Shadcn size 'sm'
          disabled={isPending}
          onClick={handleSubmit}
        >
          {actionText}
        </Button>
      </div>
    </div>
  )
}

export default CartMismatchBanner