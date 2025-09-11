"use client"

import { isManual, isStripe, isPaypal } from "@/features/storefront/lib/constants"
import { completeInvoicePayment } from "./invoice-actions"
import { Button } from "@/components/ui/button"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js"
import React, { useState } from "react"
import { RiLoader2Fill, RiSecurePaymentLine } from "@remixicon/react"
import { useRouter } from "next/navigation"

interface InvoicePaymentButtonProps {
  invoice: {
    id: string;
    paymentCollection?: {
      paymentSessions?: {
        id: string;
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
    businessAccount?: {
      businessName?: string;
      contactName?: string; 
      email?: string;
    };
  };
  selectedPaymentMethod: string;
  onPaymentSuccess?: () => void;
  "data-testid"?: string;
}

const InvoicePaymentButton: React.FC<InvoicePaymentButtonProps> = ({
  invoice,
  selectedPaymentMethod,
  onPaymentSuccess,
  "data-testid": dataTestId,
}) => {
  const paymentSession = invoice.paymentCollection?.paymentSessions?.find(
    (s) => s.isSelected
  )


  switch (true) {
    case isStripe(paymentSession?.paymentProvider?.code):
      return (
        <StripeInvoicePaymentButton
          invoice={invoice}
          onPaymentSuccess={onPaymentSuccess}
          data-testid={dataTestId}
        />
      )
    case isPaypal(paymentSession?.paymentProvider?.code):
      return (
        <PayPalInvoicePaymentButton
          invoice={invoice}
          onPaymentSuccess={onPaymentSuccess}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.paymentProvider?.code):
      return (
        <ManualInvoicePaymentButton 
          invoice={invoice} 
          onPaymentSuccess={onPaymentSuccess}
          data-testid={dataTestId} 
        />
      )
    default:
      return <Button disabled size="lg">Select a payment method</Button>
  }
}

interface StripeInvoicePaymentButtonProps {
  invoice: InvoicePaymentButtonProps["invoice"];
  onPaymentSuccess?: () => void;
  "data-testid"?: string;
}

const StripeInvoicePaymentButton: React.FC<StripeInvoicePaymentButtonProps> = ({
  invoice,
  onPaymentSuccess,
  "data-testid": dataTestId,
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const onPaymentCompleted = async (paymentSessionId: string) => {
    try {
      const result = await completeInvoicePayment(paymentSessionId)
      
      if (result && typeof result === 'object' && 'success' in result && result.success) {
        onPaymentSuccess?.() // Close dialog
        router.push(`/account/invoices?invoice=${result.id}`) // Navigate to invoice
      } else {
        setErrorMessage(result?.message || result?.error || 'Payment completion failed');
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

  const session = invoice.paymentCollection?.paymentSessions?.find(
    (s) => s.isSelected
  )

  const disabled = !stripe || !elements || !card ? true : false

  const handlePayment = async () => {
    setSubmitting(true)

    if (!stripe || !elements || !card || !invoice || !session?.data?.clientSecret || !session.id) {
      setSubmitting(false)
      setErrorMessage("Stripe not initialized or payment session not found.")
      return
    }

    // Confirm the payment intent with the card details, then pass session ID to backend
    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        session.data.clientSecret,
        {
          payment_method: {
            card: card,
            billing_details: {
              name: invoice.businessAccount?.businessName || invoice.businessAccount?.contactName,
              email: invoice.businessAccount?.email,
            },
          },
        }
      );

      if (confirmError) {
        setErrorMessage(confirmError.message || "Payment confirmation failed.");
        return;
      }

      if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'requires_capture') {
        await onPaymentCompleted(session.id);
      } else {
        setErrorMessage("Payment was not successful. Please try again.");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "An error occurred during payment processing.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Button
        disabled={disabled || submitting}
        onClick={handlePayment}
        size="lg"
        className="w-full"
        data-testid={dataTestId}
      >
        {submitting ? (
          <RiLoader2Fill className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <RiSecurePaymentLine className="mr-2 h-4 w-4 opacity-60" />
        )}
        Pay Invoice
      </Button>
      {errorMessage && (
        <div className="mt-2 text-sm text-red-600" data-testid="stripe-invoice-payment-error-message">
          {errorMessage}
        </div>
      )}
    </>
  )
}

const ManualInvoicePaymentButton = ({ invoice, onPaymentSuccess, "data-testid": dataTestId }: { 
  invoice: InvoicePaymentButtonProps["invoice"],
  onPaymentSuccess?: () => void,
  "data-testid"?: string 
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const onPaymentCompleted = async (paymentSessionId?: string) => {
    try {
      const result = await completeInvoicePayment(paymentSessionId!)
      if (result && typeof result === 'object' && 'success' in result && result.success) {
        onPaymentSuccess?.() // Close dialog
        router.push(`/account/invoices?invoice=${result.id}`) // Navigate to invoice
      }
    } catch (err: any) {
      setErrorMessage(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePayment = () => {
    setSubmitting(true)
    
    const session = invoice.paymentCollection?.paymentSessions?.find(
      (s) => s.isSelected && s.paymentProvider?.code === 'pp_system_default'
    )
    
    if (!session?.id) {
      setErrorMessage("Payment session not found. Please refresh and try again.");
      setSubmitting(false);
      return;
    }
    
    // For manual payments (Cash on Delivery), we still pass the session ID but no actual payment processing needed
    onPaymentCompleted(session.id)
  }

  return (
    <>
      <Button
        disabled={submitting}
        onClick={handlePayment}
        size="lg"
        className="w-full"
        data-testid={dataTestId || "pay-invoice-button"}
      >
        {submitting ? (
          <RiLoader2Fill className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <RiSecurePaymentLine className="mr-2 h-4 w-4 opacity-60" />
        )}
        Pay Invoice
      </Button>
      {errorMessage && (
        <div className="mt-2 text-sm text-red-600" data-testid="manual-invoice-payment-error-message">
          {errorMessage}
        </div>
      )}
    </>
  )
}

interface PayPalInvoicePaymentButtonProps {
  invoice: InvoicePaymentButtonProps["invoice"];
  onPaymentSuccess?: () => void;
  "data-testid"?: string;
}

const PayPalInvoicePaymentButton: React.FC<PayPalInvoicePaymentButtonProps> = ({
  invoice,
  onPaymentSuccess,
  "data-testid": dataTestId,
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const onPaymentCompleted = async (paymentSessionId: string) => {
    try {
      const result = await completeInvoicePayment(paymentSessionId)
      if (result && typeof result === 'object' && 'success' in result && result.success) {
        onPaymentSuccess?.() // Close dialog
        router.push(`/account/invoices?invoice=${result.id}`) // Navigate to invoice
      }
    } catch (err: any) {
      setErrorMessage(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const session = invoice.paymentCollection?.paymentSessions?.find(
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
    return <div className="text-sm text-red-600">PayPal order ID not found.</div>;
  }

  return (
    <>
      <PayPalButtons
        style={{ layout: "horizontal" }}
        createOrder={async () => session.data?.orderId as string}
        onApprove={handlePayment}
        disabled={submitting || isPending}
        data-testid={dataTestId || "paypal-invoice-payment-button"}
      />
      {errorMessage && (
        <div className="mt-2 text-sm text-red-600" data-testid="paypal-invoice-payment-error-message">
          {errorMessage}
        </div>
      )}
    </>
  )
}

export default InvoicePaymentButton