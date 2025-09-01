"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { StoreIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { createPaymentIntent, confirmPayment } from "./actions"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!)

type PaymentDialogProps = {
  isOpen: boolean
  onClose: () => void
  businessAccount: any
  unpaidLineItems: any
}

function CheckoutFormWrapper({ 
  businessAccount, 
  selectedRegion, 
  onSuccess, 
  onError,
  unpaidLineItems
}: { 
  businessAccount: any
  selectedRegion: string | null
  onSuccess: () => void
  onError: (error: string) => void
  unpaidLineItems: any
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)

  // Create payment intent when region is selected
  useEffect(() => {
    if (!selectedRegion) return

    const regionData = unpaidLineItems?.regions?.find(
      (region: any) => region.region?.id === selectedRegion
    )
    
    if (!regionData || regionData.totalAmount <= 0) return

    createPaymentIntent({
      businessAccountId: businessAccount.id,
      regionId: selectedRegion,
      amount: regionData.totalAmount,
      currency: regionData.region?.currency?.code?.toLowerCase() || 'usd'
    }).then((result) => {
      if (result.success && result.clientSecret) {
        setClientSecret(result.clientSecret)
        setPaymentIntentId(result.paymentIntentId)
      } else {
        onError(result.error || 'Failed to create payment intent')
      }
    })
  }, [selectedRegion, businessAccount, unpaidLineItems])

  if (!clientSecret) {
    return <div className="py-8 text-center">Loading payment form...</div>
  }

  return (
    <Elements 
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#000000',
          },
        },
      }}
    >
      <CheckoutForm
        businessAccount={businessAccount}
        selectedRegion={selectedRegion}
        onSuccess={onSuccess}
        onError={onError}
        paymentIntentId={paymentIntentId}
      />
    </Elements>
  )
}

function CheckoutForm({ 
  businessAccount, 
  selectedRegion, 
  onSuccess, 
  onError,
  paymentIntentId
}: { 
  businessAccount: any
  selectedRegion: string | null
  onSuccess: () => void
  onError: (error: string) => void
  paymentIntentId: string | null
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements || !paymentIntentId || !selectedRegion) {
      return
    }

    setIsProcessing(true)

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/account/invoicing?payment=success`,
        },
        redirect: 'if_required',
      })

      if (error) {
        onError(error.message || 'Payment failed')
        setIsProcessing(false)
        return
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment on our backend
        const result = await confirmPayment({
          paymentIntentId,
          businessAccountId: businessAccount.id,
          regionId: selectedRegion
        })

        if (result.success) {
          onSuccess()
        } else {
          onError(result.error || 'Failed to process payment')
        }
      }

    } catch (error: any) {
      onError(error.message || 'Payment processing failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Pay Invoice'}
      </Button>
    </form>
  )
}

export default function PaymentDialog({ isOpen, onClose, businessAccount, unpaidLineItems }: PaymentDialogProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  const handlePaymentSuccess = () => {
    toast({
      title: "Payment Successful",
      description: "Your payment has been processed successfully.",
    })
    onClose()
    // Refresh the page to show updated data
    window.location.reload()
  }

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive"
    })
  }

  const regionLineItems = unpaidLineItems?.success ? unpaidLineItems.regions?.filter((regionData: any) => regionData.totalAmount > 0) || [] : []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="mb-2 flex flex-col gap-2">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <StoreIcon className="opacity-80" size={16} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-left">Confirm and pay</DialogTitle>
            <DialogDescription className="text-left">
              Pay securely for your outstanding balance.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-5">
          {/* Region Selection */}
          <div className="space-y-4">
            <Label>Select region to pay</Label>
            <RadioGroup 
              className="grid-cols-1" 
              value={selectedRegion || ''} 
              onValueChange={setSelectedRegion}
            >
              {regionLineItems.map((regionData: any, index: number) => (
                <label 
                  key={regionData.region?.id || index}
                  className="border-input has-data-[state=checked]:border-primary/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex cursor-pointer flex-col gap-1 rounded-md border px-4 py-3 shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]"
                >
                  <RadioGroupItem
                    value={regionData.region?.id || index.toString()}
                    className="sr-only after:absolute after:inset-0"
                  />
                  <div className="inline-flex items-start justify-between gap-2">
                    <p className="text-foreground text-sm font-medium">
                      {regionData.region?.name} ({regionData.region?.currency?.code})
                    </p>
                    <Badge variant="secondary">
                      {regionData.itemCount || 0} orders
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">{regionData.formattedTotalAmount}</p>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Stripe Elements */}
          {selectedRegion && (
            <CheckoutFormWrapper
              businessAccount={businessAccount}
              selectedRegion={selectedRegion}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              unpaidLineItems={unpaidLineItems}
            />
          )}
        </div>

        <p className="text-muted-foreground text-center text-xs">
          Payments are secure and processed by Stripe.
        </p>
      </DialogContent>
    </Dialog>
  )
}