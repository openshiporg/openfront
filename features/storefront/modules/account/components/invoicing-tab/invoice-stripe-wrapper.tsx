"use client";
import { Stripe, StripeElementsOptions } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { createContext } from "react"

export const InvoiceStripeContext = createContext(false)

interface InvoiceStripeWrapperProps {
  paymentSession: {
    data?: {
      clientSecret?: string;
    };
  };
  stripeKey: string | null | undefined;
  stripePromise: any;
  children: React.ReactNode;
}

const InvoiceStripeWrapper = ({
  paymentSession,
  stripeKey,
  stripePromise,
  children,
}: InvoiceStripeWrapperProps) => {
  const options = {
    clientSecret: paymentSession?.data?.clientSecret,
  }

  if (!stripeKey) {
    throw new Error(
      "Stripe key is missing. Set NEXT_PUBLIC_STRIPE_KEY environment variable."
    )
  }

  if (!stripePromise) {
    throw new Error(
      "Stripe promise is missing. Make sure you have provided a valid Stripe key."
    )
  }

  return (
    <InvoiceStripeContext.Provider value={true}>
      <Elements options={options} stripe={stripePromise}>
        {children}
      </Elements>
    </InvoiceStripeContext.Provider>
  )
}

export default InvoiceStripeWrapper