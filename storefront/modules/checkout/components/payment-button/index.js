"use client";
import { isManual, isStripe, isPaypal } from "@storefront/lib/constants"
import { Button } from "@medusajs/ui"
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import { placeOrder } from "@storefront/lib/data/cart"
import React, { useState } from "react"
import ErrorMessage from "../error-message"
import Spinner from "@storefront/modules/common/icons/spinner"
import { usePathname, useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"

const PaymentButton = ({ cart, "data-testid": dataTestId }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = (name, value) => {
    const params = new URLSearchParams(searchParams)
    params.set(name, value)
    return params.toString()
  }

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const notReady =
    !cart ||
    !cart.shippingAddress ||
    !cart.billingAddress ||
    !cart.email ||
    cart.shippingMethods.length < 1

  const paymentSession = cart.paymentCollection?.paymentSessions?.find(
    s => s.isSelected
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
        <ManualTestPaymentButton 
          notReady={notReady} 
          data-testid={dataTestId} 
        />
      )
    default:
      return (
        <Button onClick={handleEdit} size="large">
          Select a payment method
        </Button>
      )
  }
}

const StripePaymentButton = ({
  cart,
  notReady
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.paymentCollection?.paymentSessions?.find(s => s.isSelected)

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    setSubmitting(true)

    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      return
    }

    await stripe
      .confirmCardPayment(session.data.clientSecret, {
        payment_method: {
          card: card,
          billing_details: {
            name: cart.billingAddress.firstName + " " + cart.billingAddress.lastName,
            email: cart.email,
            phone: cart.billingAddress.phone,
            address: {
              city: cart.billingAddress.city,
              country: cart.billingAddress.countryCode,
              line1: cart.billingAddress.address1,
              line2: cart.billingAddress.address2,
              postal_code: cart.billingAddress.postalCode,
              state: cart.billingAddress.province,
            },
          },
        },
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.paymentIntent

          if (
            (pi && pi.status === "requiresCapture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
          }

          setErrorMessage(error.message || null)
          return
        }

        if (
          (paymentIntent && paymentIntent.status === "requiresCapture") ||
          paymentIntent.status === "succeeded"
        ) {
          return onPaymentCompleted()
        }

        return
      })
  }

  return <>
    <Button
      disabled={disabled || notReady}
      onClick={handlePayment}
      size="large"
      isLoading={submitting}
      data-testid="stripe-payment-button">
      Place order
    </Button>
    {JSON.stringify(session.data.clientSecret)}
    <ErrorMessage error={errorMessage} data-testid="stripe-payment-error-message" />
  </>;
}

const PayPalPaymentButton = ({
  cart,
  notReady
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const session = cart.paymentCollection?.paymentSessions?.find(s => s.isSelected)

  const handlePayment = async (
    _data,
    actions
  ) => {
    actions?.order
      ?.authorize()
      .then((authorization) => {
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

  const [{ isPending, isResolved }] = usePayPalScriptReducer()

  if (isPending) {
    return <Spinner />;
  }

  if (isResolved) {
    return <>
      <PayPalButtons
        style={{ layout: "horizontal" }}
        createOrder={async () => session.data.orderId}
        onApprove={handlePayment}
        disabled={notReady || submitting || isPending}
        data-testid="paypal-payment-button" />
      <ErrorMessage error={errorMessage} data-testid="paypal-payment-error-message" />
    </>;
  }
}

const ManualTestPaymentButton = ({
  notReady
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)

    onPaymentCompleted()
  }

  return <>
    <Button
      disabled={notReady}
      isLoading={submitting}
      onClick={handlePayment}
      size="large"
      data-testid="manual-payment-button">
      Place order
    </Button>
    <ErrorMessage error={errorMessage} data-testid="manual-payment-error-message" />
  </>;
}

export default PaymentButton
