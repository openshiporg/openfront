"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { StoreIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { CardElement } from '@stripe/react-stripe-js'
import InvoicePaymentWrapper from "./invoice-payment-wrapper"
import InvoicePaymentButton from "./invoice-payment-button"
import { createInvoicePaymentSessions, createInvoiceFromLineItems, initiateInvoicePaymentSession, setInvoicePaymentSession, getActiveInvoice } from "./invoice-actions"
import { isStripe, paymentInfoMap } from "@/features/storefront/lib/constants"
import { cn } from "@/lib/utils"
import { listCartPaymentMethods } from "@/features/storefront/lib/data/payment"
import { RiLoader2Fill } from "@remixicon/react"

type InvoicePaymentDialogProps = {
  isOpen: boolean
  onClose: () => void
  businessAccount: any
  unpaidLineItems: any
}

export default function InvoicePaymentDialog({ 
  isOpen, 
  onClose, 
  businessAccount, 
  unpaidLineItems 
}: InvoicePaymentDialogProps) {
  const router = useRouter()
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<any[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentMethodSwitching, setPaymentMethodSwitching] = useState(false)
  const [cardComplete, setCardComplete] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  const [step, setStep] = useState<'select-region' | 'payment' | 'review'>('select-region')

  const handleRegionSelect = async (regionId: string) => {
    setSelectedRegion(regionId)
    
    // Load payment methods for this region (same as checkout)
    try {
      const paymentMethods = await listCartPaymentMethods(regionId)
      setAvailablePaymentMethods(paymentMethods || [])
      
    } catch (error) {
      setAvailablePaymentMethods([])
    }
  }

  const handleCreateInvoiceWithPaymentSessions = async () => {
    if (!selectedRegion || !businessAccount?.id) return
    
    setLoading(true)
    try {
      // First create invoice from unpaid line items for this region
      const regionData = unpaidLineItems.regions?.find(
        (region: any) => region.region?.id === selectedRegion
      )
      
      if (!regionData) return

      // Create invoice using the GraphQL mutation
      const invoiceResult = await createInvoiceFromLineItems({
        accountId: businessAccount.id,
        regionId: selectedRegion,
        lineItemIds: regionData.lineItems.map((item: any) => item.id)
      })

      if (invoiceResult.success && invoiceResult.invoiceId) {
        // Load payment methods for this region first  
        const paymentMethods = await listCartPaymentMethods(selectedRegion)
        setAvailablePaymentMethods(paymentMethods || [])
        
        // Create payment sessions for this invoice (but don't initiate any yet)
        await createInvoicePaymentSessions(invoiceResult.invoiceId)
        
        // Get the invoice with payment sessions (now with clientSecret)
        const invoiceData = await getActiveInvoice(invoiceResult.invoiceId)

        if (invoiceData) {
          
          // Format the amount since JSON response doesn't have virtual fields
          const formatAmount = (amount, currency) => {
            if (!currency) return '$0.00'
            const divisor = currency.noDivisionCurrency ? 1 : 100
            const amountValue = (amount || 0) / divisor
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency.code,
            }).format(amountValue)
          }
          
          setInvoice({
            ...invoiceData,
            formattedTotal: formatAmount(invoiceData.totalAmount, invoiceData.currency),
            itemCount: invoiceData.lineItems?.length || 0,
            region: regionData.region,
            businessAccount
          })
          
          // Move to payment step  
          setStep('payment')
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create invoice payment sessions"
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentMethodChange = async (newPaymentMethod: string) => {
    if (!invoice?.id) return
    
    setPaymentMethodSwitching(true)
    setSelectedPaymentMethod(newPaymentMethod)
    
    try {
      // Find the payment provider ID for this payment method
      const paymentProvider = availablePaymentMethods.find(method => method.code === newPaymentMethod)
      if (!paymentProvider) {
        return
      }

      // Set the payment session as selected
      await setInvoicePaymentSession(invoice.id, paymentProvider.id)
      
      // Initiate the payment session to get clientSecret/orderId
      await initiateInvoicePaymentSession(invoice.id, newPaymentMethod)
      
      // Refresh invoice data to get updated payment sessions with clientSecret/orderId
      const invoiceData = await getActiveInvoice(invoice.id)

      if (invoiceData) {
        
        // Format the amount since JSON response doesn't have virtual fields
        const formatAmount = (amount, currency) => {
          if (!currency) return '$0.00'
          const divisor = currency.noDivisionCurrency ? 1 : 100
          const amountValue = (amount || 0) / divisor
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.code,
          }).format(amountValue)
        }
        
        setInvoice({
          ...invoiceData,
          formattedTotal: formatAmount(invoiceData.totalAmount, invoiceData.currency),
          itemCount: invoiceData.lineItems?.length || 0,
          region: invoice.region,
          businessAccount: invoice.businessAccount
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to change payment method"
      })
    } finally {
      setPaymentMethodSwitching(false)
    }
  }

  const handlePaymentMethodSubmit = async () => {
    if (!selectedPaymentMethod || !invoice?.id) return
    
    setPaymentLoading(true)
    try {
      // If Stripe is selected and card not complete, stay on payment step
      const shouldInputCard = isStripe(selectedPaymentMethod) && !cardComplete
      
      // Check if we need to initiate payment session for this method
      const currentSession = invoice.paymentCollection?.paymentSessions?.find(
        (session: any) => session.isSelected
      )

      if (currentSession && !currentSession.isInitiated) {
        await initiateInvoicePaymentSession(invoice.id, selectedPaymentMethod)

        // Refresh invoice data to get updated payment sessions with clientSecret/orderId
        const invoiceData = await getActiveInvoice(invoice.id)

        if (invoiceData) {
          
          // Format the amount since JSON response doesn't have virtual fields
          const formatAmount = (amount, currency) => {
            if (!currency) return '$0.00'
            const divisor = currency.noDivisionCurrency ? 1 : 100
            const amountValue = (amount || 0) / divisor
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency.code,
            }).format(amountValue)
          }
          
          setInvoice({
            ...invoiceData,
            formattedTotal: formatAmount(invoiceData.totalAmount, invoiceData.currency),
            itemCount: invoiceData.lineItems?.length || 0,
            region: invoice.region,
            businessAccount: invoice.businessAccount
          })
        }
      }

      if (!shouldInputCard) {
        // Move to review step for non-Stripe payments or completed Stripe
        setStep('review')
      }
    } catch (error) {
      setCardError(error instanceof Error ? error.message : 'Payment setup failed')
    } finally {
      setPaymentLoading(false)
    }
  }

  // Single payment screen - like storefront checkout
  if (invoice && availablePaymentMethods.length > 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pay Invoice #{invoice.invoiceNumber}</DialogTitle>
            <DialogDescription>
              Select payment method and complete payment
            </DialogDescription>
          </DialogHeader>

          <InvoicePaymentWrapper invoice={invoice}>
            <div className="space-y-4">
              {/* Invoice Summary */}
              <div className="p-4 border rounded-lg">
                <h4 className="text-sm text-muted-foreground uppercase font-semibold tracking-wide mb-3">Invoice Summary</h4>
                <div className="flex justify-between items-center mb-3">
                  <span>Total: {invoice.formattedTotal}</span>
                  <span className="text-sm text-gray-600">{invoice.itemCount} {invoice.itemCount === 1 ? 'order' : 'orders'}</span>
                </div>
                
                {/* Orders list */}
                <div className="overflow-y-auto space-y-2">
                  {invoice.lineItems?.map((lineItem: any) => (
                    <div 
                      key={lineItem.id} 
                      className="bg-muted/40 border rounded-md flex justify-between items-center p-3 cursor-pointer hover:bg-muted/60"
                      onClick={() => window.open(`/account/orders/details/${lineItem.accountLineItem.order?.id}`, '_blank')}
                    >
                      <div className="grid grid-cols-3 text-xs leading-4 font-normal gap-x-3 flex-1">
                        <span className="font-semibold text-gray-700">Date placed</span>
                        <span className="font-semibold text-gray-700">Order number</span>
                        <span className="font-semibold text-gray-700">Total amount</span>
                        <span>{new Date(lineItem.accountLineItem.order.createdAt).toLocaleDateString()}</span>
                        <span>#{lineItem.accountLineItem.order.displayId}</span>
                        <span>{lineItem.accountLineItem.order.total}</span>
                      </div>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method Card with Selection */}
              <div className="p-4 border rounded-lg">
                <h4 className="text-sm text-muted-foreground uppercase font-semibold tracking-wide mb-3">Payment Method</h4>
                <RadioGroup
                  value={selectedPaymentMethod}
                  onValueChange={handlePaymentMethodChange}
                  className="space-y-2"
                >
                  {availablePaymentMethods.map((method) => (
                    <div key={method.id} className="relative">
                      <RadioGroupItem value={method.code} id={method.id} className="sr-only" />
                      <Label 
                        htmlFor={method.id}
                        className={cn(
                          "flex items-center justify-between text-sm font-normal cursor-pointer py-3 border rounded-md px-4 transition-colors min-w-0",
                          {
                            "border-primary bg-primary/5": selectedPaymentMethod === method.code,
                            "border-border hover:border-primary/50": selectedPaymentMethod !== method.code,
                          }
                        )}
                      >
                        <div className="flex items-center gap-x-3 min-w-0 flex-1">
                          <div className={cn(
                            "w-4 h-4 border-2 rounded-full flex items-center justify-center transition-colors flex-shrink-0",
                            {
                              "border-primary": selectedPaymentMethod === method.code,
                              "border-border": selectedPaymentMethod !== method.code,
                            }
                          )}>
                            {selectedPaymentMethod === method.code && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">
                              {paymentInfoMap[method.code]?.title || method.code}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {method.code}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center flex-shrink-0 ml-2">
                          {paymentInfoMap[method.code]?.icon}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              {/* Stripe card element - only show if Stripe is selected and has clientSecret */}
              {isStripe(selectedPaymentMethod) && invoice?.paymentCollection?.paymentSessions?.find(s => s.isSelected && s.data?.clientSecret) && (
                <div className="mt-5 transition-all duration-150 ease-in-out">
                  <p className="text-base font-semibold mb-1">
                    Enter your card details:
                  </p>
                  <CardElement
                    options={{
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
                        base: "pt-3 pb-1 block w-full h-11 px-4 mt-0 bg-background border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-border hover:bg-muted transition-all duration-300 ease-in-out",
                      },
                      // Hide postal code - billing address is already collected
                      hidePostalCode: true,
                    }}
                    onChange={(e) => {
                      setCardError(e.error?.message || null)
                      setCardComplete(e.complete)
                    }}
                  />
                  {cardError && (
                    <p className="text-sm text-red-500 mt-2">{cardError}</p>
                  )}
                </div>
              )}
              
              {/* Show loading state for Stripe when waiting for clientSecret */}
              {isStripe(selectedPaymentMethod) && !invoice?.paymentCollection?.paymentSessions?.find(s => s.isSelected && s.data?.clientSecret) && (
                <div className="mt-5">
                  <p className="text-base font-semibold mb-1">Enter your card details:</p>
                  <div className="h-11 bg-muted rounded animate-pulse"></div>
                </div>
              )}


              {/* Terms and Payment Button */}
              <div className="text-sm text-muted-foreground mb-4">
                By clicking Pay Invoice, you confirm payment for the selected orders.
              </div>

              <div className="w-full">
                {!selectedPaymentMethod ? (
                  <div className="h-12 bg-muted rounded animate-pulse flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">Select a payment method</span>
                  </div>
                ) : paymentMethodSwitching ? (
                  <div className="h-12 bg-muted rounded animate-pulse flex items-center justify-center">
                    <RiLoader2Fill className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading payment method...</span>
                  </div>
                ) : (
                  <InvoicePaymentButton 
                    invoice={invoice}
                    selectedPaymentMethod={selectedPaymentMethod}
                    onPaymentSuccess={onClose}
                    data-testid="pay-invoice-button"
                  />
                )}
              </div>
            </div>
          </InvoicePaymentWrapper>
        </DialogContent>
      </Dialog>
    )
  }

  // Show region selection (like checkout shows cart items)
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Invoice Region</DialogTitle>
          <DialogDescription>
            Choose which region's unpaid orders to pay
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {unpaidLineItems.success && unpaidLineItems.regions?.length > 0 ? (
            <RadioGroup value={selectedRegion || ""} onValueChange={handleRegionSelect}>
              {unpaidLineItems.regions.map((regionData: any) => (
                <div key={regionData.region.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value={regionData.region.id} id={regionData.region.id} />
                  <Label htmlFor={regionData.region.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StoreIcon className="h-4 w-4" />
                        <span className="font-medium">{regionData.region.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {regionData.itemCount} {regionData.itemCount === 1 ? 'order' : 'orders'}
                        </Badge>
                        <span className="font-semibold text-green-600">
                          {regionData.formattedTotalAmount}
                        </span>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No unpaid orders found
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateInvoiceWithPaymentSessions}
              disabled={!selectedRegion || loading}
            >
              {loading ? "Creating..." : "Continue to Payment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}