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
        <ManualTestPaymentButton notReady={notReady} cart={cart} data-testid={dataTestId} />
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

  const onPaymentCompleted = async (paymentSessionId: string) => {
    try {
      const result = await placeOrder(paymentSessionId)
      if (result && typeof result === 'object' && 'success' in result && result.success && 'redirectTo' in result) {
        router.push(result.redirectTo as string)
      }
    } catch (err: any) {
      console.error('Payment error:', err);
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
    

    if (!stripe || !elements || !card || !cart || !session?.data?.clientSecret || !session.id) {
      setSubmitting(false)
      setErrorMessage("Stripe not initialized or payment session not found.")
      return
    }

    // Confirm the payment intent with the card details, then pass session ID to backend
    try {
      console.log('Confirming payment with Stripe...');
      
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        session.data.clientSecret,
        {
          payment_method: {
            card: card,
            billing_details: {
              name: `${cart.shippingAddress?.firstName} ${cart.shippingAddress?.lastName}`,
              email: cart.email,
            },
          },
        }
      );

      if (confirmError) {
        console.error('Stripe confirmation error:', confirmError);
        setErrorMessage(confirmError.message || "Payment confirmation failed.");
        return;
      }

      if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'requires_capture') {
        console.log('Payment confirmed, sending to backend...');
        await onPaymentCompleted(session.id);
      } else {
        setErrorMessage("Payment was not successful. Please try again.");
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || "An error occurred during payment processing.")
    } finally {
      setSubmitting(false)
    }
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

const ManualTestPaymentButton = ({ notReady, cart, "data-testid": dataTestId }: { 
  notReady: boolean, 
  cart: PaymentButtonProps["cart"],
  "data-testid"?: string 
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const onPaymentCompleted = async (paymentSessionId?: string) => {
    try {
      const result = await placeOrder(paymentSessionId)
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
    
    const session = cart.paymentCollection?.paymentSessions?.find(
      (s) => s.isSelected && s.paymentProvider?.code === 'pp_system_default'
    )
    
    if (!session?.id) {
      setErrorMessage("Payment session not found. Please refresh and try again.");
      setSubmitting(false);
      return;
    }
    
    // For Cash on Delivery payments, we still pass the session ID but no actual payment processing needed
    onPaymentCompleted(session.id)
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
        data-testid="cash-on-delivery-error-message"
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

  const onPaymentCompleted = async (paymentSessionId: string) => {
    try {
      const result = await placeOrder(paymentSessionId)
      if (result && typeof result === 'object' && 'success' in result && result.success && 'redirectTo' in result) {
        router.push(result.redirectTo as string)
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setErrorMessage(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const session = cart.paymentCollection?.paymentSessions?.find(
    (s) => s.isSelected && s.paymentProvider?.code === 'pp_paypal_paypal'
  )

  const handlePayment = async (
    _data: any,
    actions: any
  ) => {
    setSubmitting(true)
    
    if (!session?.id) {
      setErrorMessage("PayPal payment session not found.")
      setSubmitting(false)
      return
    }

    // Instead of authorizing here, just pass the session ID to backend
    // The backend will handle the authorization using the orderId in the session
    try {
      await onPaymentCompleted(session.id)
    } catch (error: any) {
      setErrorMessage(error.message || "An error occurred during payment processing.")
    } finally {
      setSubmitting(false)
    }
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