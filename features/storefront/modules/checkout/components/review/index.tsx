"use client"

import { cn } from "@/lib/utils"

import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"

const Review = ({ cart }: { cart: any }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard =
    cart?.giftCard && cart?.giftCard?.length > 0 && cart?.total === 0

  const previousStepsCompleted =
    cart?.shippingAddress && // Check shippingAddress
    cart?.shippingMethods?.length > 0 && // Check shippingMethods
    (cart?.paymentCollection || paidByGiftcard) // Check paymentCollection

  return (
    <div className="bg-background">
      <div className="flex flex-row items-center justify-between mb-6">
        <h2 // Use h2
          className={cn(
            "flex flex-row text-3xl font-medium gap-x-2 items-baseline", // Use Tailwind class
            {
              // Disable if not open OR previous steps not completed
              "opacity-50 pointer-events-none select-none": !isOpen || !previousStepsCompleted,
            }
          )}
        >
          Review
        </h2>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          <div className="flex items-start gap-x-1 w-full mb-6">
            <div className="w-full">
              <p className="text-sm text-foreground mb-1">
                By clicking the Place Order button, you confirm that you have
                read, understand and accept our Terms of Use, Terms of Sale and
                Returns Policy and acknowledge that you have read Openfront
                Store&apos;s Privacy Policy.
              </p>
            </div>
          </div>
          <PaymentButton cart={cart} data-testid="submit-order-button" />
        </>
      )}
    </div>
  )
}

export default Review
