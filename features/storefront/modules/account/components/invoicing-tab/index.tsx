"use client"

import { useState, useEffect } from "react"
import { User } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, RefreshCw, Info, CreditCard, FileText, Mail, Zap, Bot, TicketCheck, Clock } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import BusinessAccountRequestForm from "./business-account-request-form"
import { toast } from "@/components/ui/use-toast"

type AccountStatus = 'none' | 'pending' | 'active' | 'suspended'

type Account = {
  id: string
  accountNumber: string
  status: string
  balanceDue: number
  formattedBalance: string
  creditLimit: number
  formattedCreditLimit: string
  availableCredit: number
  formattedAvailableCredit: string
  dueDate?: string
  totalAmount: number
  formattedTotal: string
  currency: {
    code: string
    symbol: string
  }
}

type BusinessAccountRequest = {
  id: string
  status: string
  businessName: string
  businessType: string
  submittedAt: string
  reviewNotes?: string
  approvedCreditLimit?: number
  formattedApprovedCredit?: string
}

type BusinessAccountTabProps = {
  customer: User
}

const InvoicingTab = ({ customer }: BusinessAccountTabProps) => {
  const [accountStatus, setAccountStatus] = useState<AccountStatus>('none')
  const [account, setAccount] = useState<Account | null>(null)
  const [, setBusinessAccountRequest] = useState<BusinessAccountRequest | null>(null)
  const [customerToken, setCustomerToken] = useState<string | null>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [regionLineItems, setRegionLineItems] = useState<any[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  // Fetch account data
  const fetchAccountData = async () => {
    try {
      // First check for existing business account request
      const businessAccountRequestResponse = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetUserBusinessAccountRequest {
              businessAccountRequests(where: { user: { id: { equals: "${customer.id}" } } }) {
                id
                status
                businessName
                businessType
                submittedAt
                reviewNotes
                statusLabel
                businessTypeLabel
              }
            }
          `
        })
      })
      
      const businessAccountRequestData = await businessAccountRequestResponse.json()
      const userBusinessAccountRequest = businessAccountRequestData.data?.businessAccountRequests?.[0]
      
      if (userBusinessAccountRequest && userBusinessAccountRequest.status === 'pending') {
        setAccountStatus('pending')
        setBusinessAccountRequest(userBusinessAccountRequest)
        return
      }
      
      // Check for active account  
      const accountResponse = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetUserAccount {
              accounts(where: { 
                user: { id: { equals: "${customer.id}" } },
                accountType: { equals: "business" }
              }) {
                id
                accountNumber
                status
                formattedBalance
                formattedTotal
                formattedCreditLimit
                formattedAvailableCredit
                balanceDue
                availableCredit
                dueDate
                currency {
                  code
                  symbol
                }
              }
            }
          `
        })
      })
      
      const accountData = await accountResponse.json()
      const userAccount = accountData.data?.accounts?.[0]
      
      if (userAccount) {
        setAccountStatus(userAccount.status === 'suspended' ? 'suspended' : 'active')
        setAccount(userAccount)
        
        // Get customer token from user
        const userResponse = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query GetUserToken($id: ID!) {
                user(where: { id: $id }) {
                  id
                  customerToken
                }
              }
            `,
            variables: { id: customer.id }
          })
        })
        
        const userData = await userResponse.json()
        const token = userData.data?.user?.customerToken
        setCustomerToken(token)
        
        // Get recent orders for this account
        const ordersResponse = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query GetAccountOrders($accountId: ID!) {
                orders(where: { 
                  account: { id: { equals: $accountId } }
                }, take: 4, orderBy: { createdAt: desc }) {
                  id
                  displayId
                  formattedTotal
                  createdAt
                  lineItems {
                    id
                  }
                }
              }
            `,
            variables: { accountId: userAccount.id }
          })
        })
        
        const ordersData = await ordersResponse.json()
        const orders = ordersData.data?.orders || []
        setRecentOrders(orders.map((order: any) => ({
          id: order.id,
          displayId: order.displayId,
          total: order.formattedTotal,
          createdAt: order.createdAt,
          itemCount: order.lineItems?.length || 0
        })))

        // Get unpaid account line items grouped by region for payment
        const regionLineItemsResponse = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query GetUnpaidLineItemsByRegion($accountId: ID!) {
                getUnpaidLineItemsByRegion(accountId: $accountId) {
                  success
                  regions {
                    region {
                      id
                      name
                      currency {
                        code
                        symbol
                      }
                    }
                    lineItems {
                      id
                      description
                      orderDisplayId
                      itemCount
                      formattedAmount
                      createdAt
                    }
                    totalAmount
                    formattedTotalAmount
                    itemCount
                  }
                  totalRegions
                  totalUnpaidItems
                  message
                }
              }
            `,
            variables: { accountId: userAccount.id }
          })
        })
        
        const regionData = await regionLineItemsResponse.json()
        if (regionData.data?.getUnpaidLineItemsByRegion?.success) {
          setRegionLineItems(regionData.data.getUnpaidLineItemsByRegion.regions || [])
        }
      } else {
        setAccountStatus('none')
      }
      
    } catch (error) {
      console.error('Error fetching account data:', error)
      setAccountStatus('none')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccountData()
  }, [customer.id])

  const copyToken = async () => {
    if (customerToken) {
      await navigator.clipboard.writeText(customerToken)
      toast({
        title: "Token copied!",
        description: "Customer token has been copied to your clipboard.",
      })
    }
  }

  const handleRequestAccess = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CreateBusinessAccountRequest($data: BusinessAccountRequestCreateInput!) {
              createBusinessAccountRequest(data: $data) {
                id
                status
                businessName
                submittedAt
              }
            }
          `,
          variables: {
            data: {
              businessName: customer.name || 'Business Request',
              businessType: 'other',
              monthlyOrderVolume: 'medium',
              requestedCreditLimit: 100000, // $1000 default
              businessDescription: 'Business account access request',
              user: { connect: { id: customer.id } }
            }
          }
        })
      })

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0].message)
      }
      
      toast({
        title: "Request Submitted!",
        description: "Your business account request has been submitted for review.",
      })
      
      // Refresh data to show pending state
      await fetchAccountData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const regenerateToken = async () => {
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation RegenerateCustomerToken {
              regenerateCustomerToken {
                success
                token
              }
            }
          `
        })
      })

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0].message)
      }
      
      const newToken = result.data?.regenerateCustomerToken?.token
      if (newToken) {
        setCustomerToken(newToken)
        toast({
          title: "Token regenerated",
          description: "Your customer token has been regenerated.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate token.",
        variant: "destructive",
      })
    }
  }

  const handlePayment = async () => {
    if (!account) {
      toast({
        title: "No account found",
        description: "Please refresh the page and try again.",
        variant: "destructive"
      })
      return
    }

    if (regionLineItems.length === 0) {
      toast({
        title: "No unpaid items",
        description: "There are no unpaid orders to process payment for.",
        variant: "destructive"
      })
      return
    }

    // Show payment dialog for region selection
    setShowPaymentDialog(true)
  }

  const handleRegionPayment = async (regionId: string) => {
    const regionData = regionLineItems.find(r => r.region.id === regionId)
    if (!regionData) {
      toast({
        title: "Region not found",
        description: "Please refresh and try again.",
        variant: "destructive"
      })
      return
    }

    setIsPaymentProcessing(true)
    setShowPaymentDialog(false)
    
    try {
      // Create invoice from region's unpaid line items
      const lineItemIds = regionData.lineItems.map(item => item.id)
      
      const createInvoiceResponse = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CreateInvoiceFromLineItems($accountId: ID!, $regionId: ID!, $lineItemIds: [ID!]!) {
              createInvoiceFromLineItems(accountId: $accountId, regionId: $regionId, lineItemIds: $lineItemIds) {
                success
                invoice {
                  id
                  invoiceNumber
                  totalAmount
                  formattedTotal
                }
                message
                error
              }
            }
          `,
          variables: {
            accountId: account.id,
            regionId: regionId,
            lineItemIds: lineItemIds
          }
        })
      })

      const invoiceResult = await createInvoiceResponse.json()
      
      if (invoiceResult.errors || !invoiceResult.data?.createInvoiceFromLineItems?.success) {
        throw new Error(invoiceResult.data?.createInvoiceFromLineItems?.error || invoiceResult.errors?.[0]?.message || 'Failed to create invoice')
      }

      const invoice = invoiceResult.data.createInvoiceFromLineItems.invoice

      // Process manual payment (TODO: integrate with Stripe/PayPal for region)
      const paymentResponse = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation PayInvoice($invoiceId: ID!, $paymentData: PaymentInput!) {
              payInvoice(invoiceId: $invoiceId, paymentData: $paymentData) {
                success
                message
                error
              }
            }
          `,
          variables: {
            invoiceId: invoice.id,
            paymentData: {
              paymentMethod: 'manual',
              data: {
                paymentType: 'region_payment',
                regionId: regionId,
                regionName: regionData.region.name,
                processedAt: new Date().toISOString()
              }
            }
          }
        })
      })

      const paymentResult = await paymentResponse.json()
      
      if (paymentResult.errors || !paymentResult.data?.payInvoice?.success) {
        throw new Error(paymentResult.data?.payInvoice?.error || paymentResult.errors?.[0]?.message || 'Payment processing failed')
      }

      toast({
        title: "Payment Processed",
        description: `Payment of ${regionData.formattedTotalAmount} processed successfully for ${regionData.region.name} orders`,
      })

      // Refresh account data
      await fetchAccountData()

    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsPaymentProcessing(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  // State 1: Empty State (No Account Request) or Pending State
  if (accountStatus === 'none' || accountStatus === 'pending') {
    const isPending = accountStatus === 'pending'
    
    return (
      <div className="text-center p-14 w-full group transition duration-500 hover:duration-200">
        <div className="flex justify-center isolate">
          <div className="bg-background size-12 grid place-items-center rounded-xl relative left-2.5 top-1.5 -rotate-6 shadow-lg ring-1 ring-border group-hover:-translate-x-5 group-hover:-rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
            <TicketCheck className="w-4 h-4 fill-indigo-200 stroke-indigo-400 dark:stroke-indigo-600 dark:fill-indigo-950" />
          </div>
          <div className="bg-background size-12 grid place-items-center rounded-xl relative z-10 shadow-lg ring-1 ring-border group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
            <Bot className="w-4 h-4 fill-orange-300 stroke-orange-500 dark:stroke-amber-600 dark:fill-amber-950" />
          </div>
          <div className="bg-background size-12 grid place-items-center rounded-xl relative right-2.5 top-1.5 rotate-6 shadow-lg ring-1 ring-border group-hover:translate-x-5 group-hover:rotate-12 group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
            <Zap className="w-4 h-4 fill-emerald-200 stroke-emerald-400 dark:stroke-emerald-600 dark:fill-emerald-900" />
          </div>
        </div>
        <h2 className="text-foreground font-medium mt-6">Business Account</h2>
        <div className="text-sm text-muted-foreground mt-1">
          <p className="mb-4">{isPending ? 'Your request has been submitted and is under review.' : 'Setting up a business account gives you the ability to streamline your ordering process with flexible payment terms.'}</p>
          {!isPending && (
            <div className="flex flex-col space-y-3 my-6 items-center">
              <span className="size-max flex items-center whitespace-nowrap ring-1 ring-inset bg-white text-gray-900 ring-gray-200 shadow-xs gap-1.5 py-1 px-2.5 text-sm font-medium rounded-lg">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-indigo-400">
                  <circle cx="4" cy="4" r="2.5" fill="currentColor" stroke="currentColor"></circle>
                </svg>
                Ideal for wholesale, distribution, and bulk purchasing
              </span>
              <span className="size-max flex items-center whitespace-nowrap ring-1 ring-inset bg-white text-gray-900 ring-gray-200 shadow-xs gap-1.5 py-1 px-2.5 text-sm font-medium rounded-lg">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-orange-500">
                  <circle cx="4" cy="4" r="2.5" fill="currentColor" stroke="currentColor"></circle>
                </svg>
                Let AI assistants create carts and place orders on your behalf
              </span>
              <span className="size-max flex items-center whitespace-nowrap ring-1 ring-inset bg-white text-gray-900 ring-gray-200 shadow-xs gap-1.5 py-1 px-2.5 text-sm font-medium rounded-lg">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-emerald-400">
                  <circle cx="4" cy="4" r="2.5" fill="currentColor" stroke="currentColor"></circle>
                </svg>
                Pay once monthly with flexible payment terms
              </span>
            </div>
          )}
        </div>
        <Button
          onClick={handleRequestAccess}
          // variant="outline"
          className="mt-4 shadow-sm active:shadow-none"
          disabled={isPending || isSubmitting}
        >
          {isPending ? (
            <>
              <Clock className="w-4 h-4 mr-2 opacity-60" />
              Request Pending
            </>
          ) : (
            <>
              <TicketCheck className="w-4 h-4 mr-2 opacity-60" />
              {isSubmitting ? 'Submitting...' : 'Request Business Account'}
            </>
          )}
        </Button>
      </div>
    )
  }


  // State 3: Active Account State
  if (accountStatus === 'active' && account) {
    return (
      <div className="space-y-6">
        {/* Account Overview */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">Account {account.accountNumber}</h2>
                <Badge variant="default">Active ✅</Badge>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>Payment Terms: Net 30</div>
                <div>Next Due Date: {account.dueDate ? new Date(account.dueDate).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Balance Due</div>
                <div className="text-2xl font-bold text-red-600">{account.formattedBalance}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Credit Limit</div>
                <div className="text-xl font-semibold">{account.formattedCreditLimit}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Available Credit</div>
                <div className="text-xl font-semibold text-green-600">{account.formattedAvailableCredit}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Charged</div>
                <div className="text-xl font-semibold">{account.formattedTotal}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Access */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">API Access</h3>
            
            <div className="bg-muted p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Customer Token:</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToken}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Token
                  </Button>
                  <Button variant="outline" size="sm" onClick={regenerateToken}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Regenerate Token
                  </Button>
                </div>
              </div>
              <div className="font-mono text-sm bg-background p-2 rounded border">
                {customerToken ? `${customerToken.substring(0, 40)}...` : 'Loading...'}
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 text-blue-600" />
                <span className="font-medium">Setup Guide</span>
              </div>
              
              <div className="ml-6 space-y-2 text-muted-foreground">
                <div><strong>1.</strong> Copy your customer token above</div>
                <div><strong>2.</strong> In your integration platform (e.g., Openship):</div>
                <div className="ml-4">
                  <div>• Add new fulfillment channel</div>
                  <div>• Select "OpenFront Storefront"</div>
                  <div>• Enter domain: <code className="bg-muted px-1 rounded">ourstore.com</code></div>
                  <div>• Paste your customer token</div>
                </div>
                <div><strong>3.</strong> Test connection and start placing orders!</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recent Orders</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  View All Orders
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  Download Account PDF
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">Order #{order.displayId}</span>
                    <Badge variant="secondary">{order.itemCount} items</Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{order.total}</div>
                    <div className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Button 
                onClick={handlePayment} 
                disabled={isPaymentProcessing || regionLineItems.length === 0}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isPaymentProcessing ? 'Processing...' : regionLineItems.length > 0 ? `Make Payment (${regionLineItems.length} regions)` : 'Make Payment'}
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Request Credit Increase
              </Button>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Email Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // State 4: Suspended/Not Approved State  
  if (accountStatus === 'suspended') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">⚠️ Invoicing Access Suspended</h2>
          </div>
          
          <div className="max-w-lg mx-auto text-left space-y-4 mb-8">
            <p className="text-muted-foreground text-center">
              Your programmatic ordering access has been temporarily suspended due to overdue payments.
            </p>
            
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-red-800">Account Status:</h3>
              <div className="text-sm space-y-1 text-red-700">
                <div>Current Balance: <span className="font-semibold">$1,247.50</span></div>
                <div>Overdue Amount: <span className="font-semibold">$847.50</span></div>
                <div>Days Overdue: <span className="font-semibold">15</span></div>
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="font-semibold mb-2">To reactivate your access:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Pay the overdue balance of $847.50</li>
                <li>• Contact our billing team at <a href="mailto:billing@ourstore.com" className="text-blue-600 hover:underline">billing@ourstore.com</a></li>
              </ul>
            </div>
            
            <div className="flex gap-4 justify-center pt-4">
              <Button 
                onClick={handlePayment} 
                disabled={isPaymentProcessing}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isPaymentProcessing ? 'Processing...' : 'Make Payment'}
              </Button>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Contact Billing
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // This component structure needs to wrap all returns with the dialog
  const MainContent = () => {
    if (loading) {
      return <div>Loading...</div>
    }

    // State 1: Empty State (No Account Request) or Pending State
    if (accountStatus === 'none') {
      return (
        <div className="space-y-6">
          <EmptyState
            icon={Bot}
            title="Welcome to OpenFront Business Accounts"
            description="Business accounts enable API-based ordering with flexible payment terms. Apply for an account to start placing orders programmatically."
            action={
              <BusinessAccountRequestForm 
                customer={customer} 
                onSuccess={(request) => {
                  setBusinessAccountRequest(request)
                  setAccountStatus('pending')
                }}
              />
            }
          />
        </div>
      )
    }

    if (accountStatus === 'pending') {
      return (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-100">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Application Under Review</h3>
                  <p className="text-gray-600 mt-1">
                    Your business account application is currently being reviewed by our team. 
                    This process typically takes 1-2 business days.
                  </p>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">What happens next:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Our team will verify your business information</li>
                      <li>• You'll receive an email notification once approved</li>
                      <li>• Upon approval, you'll get your API customer token</li>
                      <li>• Start placing orders immediately after approval</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    // State 3: Active State (Approved Account)
    if (accountStatus === 'active' && account) {
      return (
        <div className="space-y-6">
          {/* Account Status Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <TicketCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Business Account Active</h3>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {account.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mt-1">
                    Account #{account.accountNumber} • Your business account is active and ready for API orders.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Details */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Account Balance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount Due:</span>
                    <span className="font-semibold text-red-600">{account.formattedBalance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Credit:</span>
                    <span className="font-semibold text-green-600">{account.formattedAvailableCredit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Credit Limit:</span>
                    <span className="font-semibold">{account.formattedCreditLimit}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">API Access</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Customer Token</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono flex-1 truncate">
                        {customerToken || 'Loading...'}
                      </code>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          if (customerToken) {
                            navigator.clipboard.writeText(customerToken)
                            toast({
                              title: "Copied!",
                              description: "Customer token copied to clipboard.",
                            })
                          }
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleRegenerateToken}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Use this token for API requests to place orders on your account.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
              {recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">Order #{order.displayId}</span>
                        <span className="text-sm text-gray-600 ml-2">
                          {order.itemCount} items • {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{order.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No orders yet. Start placing orders using your customer token!</p>
              )}
            </CardContent>
          </Card>

          {/* Payment Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Button 
                  onClick={handlePayment} 
                  disabled={isPaymentProcessing || regionLineItems.length === 0}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isPaymentProcessing ? 'Processing...' : regionLineItems.length > 0 ? `Make Payment (${regionLineItems.length} regions)` : 'Make Payment'}
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Request Credit Increase
                </Button>
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    // State 4: Suspended/Not Approved State  
    if (accountStatus === 'suspended') {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 mx-auto">
                <Info className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-800">Account Suspended</h3>
              <p className="text-gray-600">
                Your business account has been suspended. This may be due to:
              </p>
              <ul className="text-left text-gray-600 space-y-1 max-w-md mx-auto">
                <li>• Outstanding balance exceeding credit terms</li>
                <li>• Unusual order patterns requiring verification</li>
                <li>• Administrative review in progress</li>
                <li>• Contact our billing team at <a href="mailto:billing@ourstore.com" className="text-blue-600 hover:underline">billing@ourstore.com</a></li>
              </ul>
              
              <div className="flex gap-4 justify-center pt-4">
                <Button 
                  onClick={handlePayment} 
                  disabled={isPaymentProcessing}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isPaymentProcessing ? 'Processing...' : 'Make Payment'}
                </Button>
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Billing
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return null
  }

  return (
    <>
      <MainContent />
      
      {/* Payment Dialog with Region Selection */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Select Region to Pay
            </DialogTitle>
            <DialogDescription>
              Choose which region you'd like to make a payment for. Each region will be processed in its local currency.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <RadioGroup value={selectedRegion || ''} onValueChange={setSelectedRegion}>
              {regionLineItems.map((regionData) => (
                <label 
                  key={regionData.region.id}
                  className="border-input has-data-[state=checked]:border-primary/50 has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex cursor-pointer flex-col gap-2 rounded-md border px-4 py-3 shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px]"
                >
                  <RadioGroupItem
                    value={regionData.region.id}
                    className="sr-only after:absolute after:inset-0"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-foreground text-sm font-medium">
                        {regionData.region.name} ({regionData.region.currency.code})
                      </p>
                      <Badge variant="secondary">
                        {regionData.itemCount} orders
                      </Badge>
                    </div>
                    <p className="text-foreground text-sm font-semibold">
                      {regionData.formattedTotalAmount}
                    </p>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Orders: {regionData.lineItems.map(item => `#${item.orderDisplayId}`).join(', ')}
                  </div>
                </label>
              ))}
            </RadioGroup>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowPaymentDialog(false)}
                disabled={isPaymentProcessing}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => selectedRegion && handleRegionPayment(selectedRegion)}
                disabled={!selectedRegion || isPaymentProcessing}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isPaymentProcessing ? 'Processing...' : 'Process Payment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default InvoicingTab