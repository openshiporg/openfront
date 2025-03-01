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
          cart={cart}
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
    await placeOrder(cart.id)
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
    <ErrorMessage error={errorMessage} data-testid="stripe-payment-error-message" />
  </>;
}

const PayPalPaymentButton = ({
  notReady,
  cart,
  "data-testid": dataTestId
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [{ isInitial, isPending }] = usePayPalScriptReducer()

  const onPaymentCompleted = async () => {
    await placeOrder(cart.id)
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  if (notReady || !cart) {
    return null
  }

  if (isInitial || isPending) {
    return (
      <div className="flex items-center justify-center w-full h-12">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="relative">
      <PayPalButtons
        style={{ layout: "horizontal" }}
        createOrder={async () => {
          setSubmitting(true)
          try {
            const response = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ cartId: cart.id }),
            })
            const { orderID } = await response.json()
            return orderID
          } catch (error) {
            setErrorMessage("Error creating PayPal order")
            setSubmitting(false)
            throw error
          }
        }}
        onApprove={async (data, actions) => {
          try {
            await onPaymentCompleted()
          } catch (error) {
            setErrorMessage("Error processing PayPal payment")
            throw error
          }
        }}
        onError={(err) => {
          setErrorMessage("PayPal payment failed")
          setSubmitting(false)
        }}
        onCancel={() => {
          setSubmitting(false)
        }}
      />
      {submitting && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
          <Spinner />
        </div>
      )}
      <ErrorMessage error={errorMessage} data-testid="paypal-payment-error-message" />
    </div>
  )
}

const ManualTestPaymentButton = ({
  notReady,
  cart,
  "data-testid": dataTestId
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const onPaymentCompleted = async () => {
    await placeOrder(cart.id)
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
      data-testid={dataTestId || "manual-payment-button"}>
      {submitting ? "Processing..." : "Place order"}
    </Button>
    <ErrorMessage error={errorMessage} data-testid="manual-payment-error-message" />
  </>;
}

export default PaymentButton
