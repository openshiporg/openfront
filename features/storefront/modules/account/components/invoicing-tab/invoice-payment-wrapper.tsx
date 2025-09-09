"use client"

import { loadStripe } from "@stripe/stripe-js"
import React from "react"
import InvoiceStripeWrapper from "./invoice-stripe-wrapper"
import { PayPalScriptProvider } from "@paypal/react-paypal-js"
import { isStripe, isPaypal } from "@/features/storefront/lib/constants"

interface InvoicePaymentWrapperProps {
  invoice: {
    paymentCollection?: {
      paymentSessions?: {
        isSelected: boolean;
        paymentProvider?: {
          code: string;
        };
        data?: {
          clientSecret?: string;
        }
      }[];
    };
    region?: {
      currency?: {
        code?: string;
      };
    };
  };
  children: React.ReactNode
}

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

const InvoicePaymentWrapper: React.FC<InvoicePaymentWrapperProps> = ({ invoice, children }) => {
  const paymentSession = invoice.paymentCollection?.paymentSessions?.find(
    (s) => s.isSelected
  )

  if (
    isStripe(paymentSession?.paymentProvider?.code) &&
    paymentSession &&
    stripePromise
  ) {
    return (
      <InvoiceStripeWrapper
        paymentSession={paymentSession}
        stripeKey={stripeKey}
        stripePromise={stripePromise}
      >
        {children}
      </InvoiceStripeWrapper>
    )
  }

  if (
    isPaypal(paymentSession?.paymentProvider?.code) &&
    paypalClientId !== undefined &&
    invoice
  ) {
    return (
      <PayPalScriptProvider
        options={{
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
          currency: invoice?.region?.currency?.code?.toUpperCase(),
          intent: "authorize",
          components: "buttons",
        }}
      >
        {children}
      </PayPalScriptProvider>
    )
  }

  return <div>{children}</div>
}

export default InvoicePaymentWrapper