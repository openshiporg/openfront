import { RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import React, { useContext, useMemo, type JSX } from "react"

import Radio from "@/features/storefront/modules/common/components/radio"

import { isManual } from "@/features/storefront/lib/constants"
import SkeletonCardDetails from "@/features/storefront/modules/skeletons/components/skeleton-card-details"
import { CardElement } from "@stripe/react-stripe-js"
import { StripeCardElementOptions } from "@stripe/stripe-js"
import PaymentTest from "../payment-test"
import { StripeContext } from "../payment-wrapper/stripe-wrapper"

type PaymentContainerProps = {
  paymentProviderId: string
  selectedPaymentOptionId: string | null
  disabled?: boolean
  paymentInfoMap: Record<string, { title: string; icon: JSX.Element }>
  children?: React.ReactNode
}

const PaymentContainer: React.FC<PaymentContainerProps> = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  children,
}) => {
  const isDevelopment = process.env.NODE_ENV === "development"

  return (
    <div
      className={cn(
        "flex flex-col gap-y-2 text-xs font-normal cursor-pointer py-4 border rounded-md px-8 mb-2", // Use Tailwind class, rounded-md, remove hover shadow
        {
          "border-primary": // Use Tailwind color
            selectedPaymentOptionId === paymentProviderId,
        }
      )}
    >
      <RadioGroupItem
        key={paymentProviderId}
        value={paymentProviderId}
        disabled={disabled}
        id={paymentProviderId}
      />
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-x-4">
          <Radio checked={selectedPaymentOptionId === paymentProviderId} />
          <p className="text-sm font-normal">
            {paymentInfoMap[paymentProviderId]?.title || paymentProviderId}
          </p>
          {isManual(paymentProviderId) && isDevelopment && (
            <PaymentTest className="hidden sm:block" />
          )}
        </div>
        <span className="justify-self-end text-foreground">
          {paymentInfoMap[paymentProviderId]?.icon}
        </span>
      </div>
      {isManual(paymentProviderId) && isDevelopment && (
        <PaymentTest className="sm:hidden text-[10px]" />
      )}
      {children}
    </div>
  )
}

export default PaymentContainer

export const StripeCardContainer = ({
  paymentProviderId,
  selectedPaymentOptionId,
  paymentInfoMap,
  disabled = false,
  setCardBrand,
  setError,
  setCardComplete,
}: Omit<PaymentContainerProps, "children"> & {
  setCardBrand: (brand: string) => void
  setError: (error: string | null) => void
  setCardComplete: (complete: boolean) => void
}) => {
  const stripeReady = useContext(StripeContext)

  const useOptions: StripeCardElementOptions = useMemo(() => {
    return {
      style: {
        base: {
          fontFamily: "Inter, sans-serif",
          color: "#424270",
          "::placeholder": {
            color: "rgb(107 114 128)",
          },
        },
      },
      classes: {
        base: "pt-3 pb-1 block w-full h-11 px-4 mt-0 bg-background border rounded-md appearance-none focus:outline-none focus:ring-0 border-border hover:bg-accent transition-all duration-300 ease-in-out", // Use Tailwind classes, remove focus shadow
      },
      // Hide postal code since we already collect it in the billing address form
      hidePostalCode: true,
    }
  }, [])

  return (
    <PaymentContainer
      paymentProviderId={paymentProviderId}
      selectedPaymentOptionId={selectedPaymentOptionId}
      paymentInfoMap={paymentInfoMap}
      disabled={disabled}
    >
      {selectedPaymentOptionId === paymentProviderId &&
        (stripeReady ? (
          <div className="my-4 transition-all duration-150 ease-in-out">
            <p className="text-sm font-medium text-foreground mb-1">
              Enter your card details:
            </p>
            <CardElement
              options={useOptions as StripeCardElementOptions}
              onChange={(e) => {
                setCardBrand(
                  e.brand && e.brand.charAt(0).toUpperCase() + e.brand.slice(1)
                )
                setError(e.error?.message || null)
                setCardComplete(e.complete)
              }}
            />
          </div>
        ) : (
          /* TODO: [Refactor Alignment] SkeletonCardDetails component usage commented out as it's not present in the old storefront. Re-evaluate integration later. */
          null
        ))}
    </PaymentContainer>
  )
}
