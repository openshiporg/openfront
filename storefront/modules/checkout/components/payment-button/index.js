"use client";
import { Button } from "@medusajs/ui"
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import { placeOrder } from "@storefront/modules/checkout/actions"
import React, { useState } from "react"
import ErrorMessage from "../error-message"
import Spinner from "@storefront/modules/common/icons/spinner"

const PaymentButton = ({ cart }) => {
  const notReady =
    !cart ||
    !cart.shippingAddress ||
    !cart.billingAddress ||
    !cart.email ||
    cart.shippingMethods.length < 1
      ? true
      : false

  const paymentSession = cart.paymentSession


  switch (paymentSession.providerId) {
    case "stripe":
      return <StripePaymentButton notReady={notReady} cart={cart} />;
    case "manual":
      return <ManualTestPaymentButton notReady={notReady} />;
    case "paypal":
      return <PayPalPaymentButton notReady={notReady} cart={cart} />;
    default:
      return <Button disabled>Select a payment method</Button>;
  }
}

const StripePaymentButton = ({
  cart,
  notReady
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const onPaymentCompleted = async () => {
    await placeOrder().catch(() => {
      setErrorMessage("An error occurred, please try again.")
      setSubmitting(false)
    })
  }

  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.paymentSession

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    setSubmitting(true)

    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      return
    }

    await stripe
      .confirmCardPayment(session.data.clientSecret, {
        paymentMethod: {
          card: card,
          billingDetails: {
            name:
              cart.billingAddress.firstName +
              " " +
              cart.billingAddress.lastName,
            address: {
              city: cart.billingAddress.city ?? undefined,
              country: cart.billingAddress.countryCode ?? undefined,
              line1: cart.billingAddress.address1 ?? undefined,
              line2: cart.billingAddress.address2 ?? undefined,
              postalCode: cart.billingAddress.postalCode ?? undefined,
              state: cart.billingAddress.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billingAddress.phone ?? undefined,
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
          return onPaymentCompleted();
        }

        return
      })
  }

  return <>
    <Button
      disabled={disabled || notReady}
      onClick={handlePayment}
      size="large"
      isLoading={submitting}>
      Place order
    </Button>
    <ErrorMessage error={errorMessage} />
  </>;
}

const PayPalPaymentButton = ({
  cart,
  notReady
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const onPaymentCompleted = async () => {
    await placeOrder().catch(() => {
      setErrorMessage("An error occurred, please try again.")
      setSubmitting(false)
    })
  }

  const session = cart.paymentSession

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
        createOrder={async () => session.data.id}
        onApprove={handlePayment}
        disabled={notReady || submitting || isPending} />
      <ErrorMessage error={errorMessage} />
    </>;
  }
}

const ManualTestPaymentButton = ({
  notReady
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const onPaymentCompleted = async () => {
    await placeOrder().catch((err) => {
      setErrorMessage(err.toString())
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
      size="large">
      Place order
    </Button>
    <ErrorMessage error={errorMessage} />
  </>;
}

export default PaymentButton
