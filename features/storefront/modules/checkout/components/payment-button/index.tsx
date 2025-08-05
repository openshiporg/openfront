"use client"

import { isManual, isStripe, isPaypal } from "@/features/storefront/lib/constants"
import { placeOrder } from "@/features/storefront/lib/data/cart"
import { Button } from "@/components/ui/button"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js"
import React, { useState } from "react"
import ErrorMessage from "../error-message"
import { RiLoader2Fill } from "@remixicon/react"
import { useRouter } from "next/navigation"

interface PaymentButtonProps {
  cart: {
    shippingAddress: any;
    billingAddress: any;
    email: string;
    shippingMethods: any[];
    paymentCollection?: {
      paymentSessions?: {
        isSelected: boolean;
        paymentProvider?: {
          code: string;
        };
        data?: {
          clientSecret?: string;
          orderId?: string;
        };
      }[];
    };
  };
  "data-testid": string;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shippingAddress ||
    !cart.billingAddress ||
    !cart.email ||
    (cart.shippingMethods?.length ?? 0) < 1

  const paymentSession = cart.paymentCollection?.paymentSessions?.find(
    (s) => s.isSelected
  )

  switch (true) {
    case isStripe(paymentSession?.paymentProvider?.code):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isPaypal(paymentSession?.paymentProvider?.code):
      return (
        <PayPalPaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.paymentProvider?.code):
      return (
        <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    default:
      return <Button disabled size="lg">Select a payment method</Button>
  }
}

interface StripePaymentButtonProps {
  cart: PaymentButtonProps["cart"];
  notReady: boolean;
  "data-testid"?: string;
}

const StripePaymentButton: React.FC<StripePaymentButtonProps> = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const onPaymentCompleted = async () => {
    try {
      const result = await placeOrder()
      if (result && typeof result === 'object' && 'success' in result && result.success && 'redirectTo' in result) {
        router.push(result.redirectTo as string)
      }
    } catch (err: any) {
      setErrorMessage(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.paymentCollection?.paymentSessions?.find(
    (s) => s.isSelected && s.paymentProvider?.code === 'pp_stripe_stripe'
  )

  const disabled = !stripe || !elements || !card ? true : false

  const handlePayment = async () => {
    setSubmitting(true)

    if (!stripe || !elements || !card || !cart || !session?.data?.clientSecret) {
      setSubmitting(false)
      setErrorMessage("Stripe not initialized or card element not found.")
      return
    }

    await stripe
      .confirmCardPayment(session.data.clientSecret, {
        payment_method: {
          card: card,
          billing_details: {
            name: `${cart.billingAddress?.firstName || ''} ${cart.billingAddress?.lastName || ''}`.trim(),
            address: {
              city: cart.billingAddress?.city ?? undefined,
              country: cart.billingAddress?.countryCode ?? undefined,
              line1: cart.billingAddress?.address1 ?? undefined,
              line2: cart.billingAddress?.address2 ?? undefined,
              postal_code: cart.billingAddress?.postalCode ?? undefined,
              state: cart.billingAddress?.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billingAddress?.phone ?? undefined,
          },
        },
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent
          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            return onPaymentCompleted()
          }
          setErrorMessage(error.message || null)
          return
        }

        if (!paymentIntent) {
          setErrorMessage("Payment intent not found.")
          return
        }

        if (paymentIntent.status === "succeeded" || paymentIntent.status === "requires_capture") {
          onPaymentCompleted()
        }
      })
      .catch(() => {
        setErrorMessage("An unknown error occurred, please try again.")
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  return (
    <>
      <Button
        disabled={disabled || notReady || submitting}
        onClick={handlePayment}
        size="lg"
        data-testid={dataTestId}
      >
        {submitting && <RiLoader2Fill className="mr-2 h-4 w-4 animate-spin" />}
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({ notReady, "data-testid": dataTestId }: { notReady: boolean, "data-testid"?: string }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const onPaymentCompleted = async () => {
    try {
      const result = await placeOrder()
      if (result && typeof result === 'object' && 'success' in result && result.success && 'redirectTo' in result) {
        router.push(result.redirectTo as string)
      }
    } catch (err: any) {
      setErrorMessage(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePayment = () => {
    setSubmitting(true)
    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady || submitting}
        onClick={handlePayment}
        size="lg"
        data-testid={dataTestId || "submit-order-button"}
      >
        {submitting && <RiLoader2Fill className="mr-2 h-4 w-4 animate-spin" />} 
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

interface PayPalPaymentButtonProps {
  cart: PaymentButtonProps["cart"];
  notReady: boolean;
  "data-testid"?: string;
}

const PayPalPaymentButton: React.FC<PayPalPaymentButtonProps> = ({
  notReady,
  cart,
  "data-testid": dataTestId,
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const onPaymentCompleted = async () => {
    try {
      const result = await placeOrder()
      if (result && typeof result === 'object' && 'success' in result && result.success && 'redirectTo' in result) {
        router.push(result.redirectTo as string)
      }
    } catch (err: any) {
      setErrorMessage(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const session = cart.paymentCollection?.paymentSessions?.find(
    (s) => s.isSelected
  )

  const handlePayment = async (
    _data: any,
    actions: any
  ) => {
    actions?.order
      ?.authorize()
      .then((authorization: any) => {
        if (authorization.status !== "COMPLETED") {
          setErrorMessage(`An error occurred, status: ${authorization.status}`)
          return
        }
        onPaymentCompleted()
      })
      .catch(() => {
        setErrorMessage(`An unknown error occurred, please try again.`)
        setSubmitting(false)
      })
  }

  const [{ isPending }] = usePayPalScriptReducer()

  if (isPending) {
    return <RiLoader2Fill className="animate-spin"/>
  }

  if (!session?.data?.orderId) {
    return <ErrorMessage error="PayPal order ID not found." />;
  }

  return (
    <>
      <PayPalButtons
        style={{ layout: "horizontal" }}
        createOrder={async () => session.data?.orderId as string}
        onApprove={handlePayment}
        disabled={notReady || submitting || isPending}
        data-testid={dataTestId || "paypal-payment-button"}
      />
      <ErrorMessage error={errorMessage} data-testid="paypal-payment-error-message" />
    </>
  )
}

export default PaymentButton