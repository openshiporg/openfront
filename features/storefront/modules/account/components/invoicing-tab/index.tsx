"use client"

import { User } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, RefreshCw, Info, Mail, Zap, Bot, TicketCheck, Clock, Webhook, CheckIcon, List, CheckCircle, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import BusinessAccountRequestForm from "./business-account-request-form"
import { toast } from "@/components/ui/use-toast"
import PaymentDialog from "./payment-dialog"
import OrderCard from "../order-card"
import { useState, useActionState, useEffect } from "react"
import { updateWebhookUrl, regenerateCustomerToken } from "@/features/storefront/lib/data/business-accounts"

type BusinessAccountTabProps = {
  customer: User
  businessAccount: any
  businessAccountRequest: any  
  orders: any[]
  unpaidLineItems: any
}

const InvoicingTab = ({ customer, businessAccount, businessAccountRequest, orders, unpaidLineItems }: BusinessAccountTabProps) => {
  const [webhookUrl, setWebhookUrl] = useState<string>(customer.orderWebhookUrl || '')
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [tokenCopied, setTokenCopied] = useState(false)
  const [webhookUpdated, setWebhookUpdated] = useState(false)
  const [webhookLoading, setWebhookLoading] = useState(false)
  
  // Server actions with useActionState
  const [tokenState, tokenAction] = useActionState(regenerateCustomerToken, { success: false, error: '' })

  // Determine account status from server data
  const getAccountStatus = () => {
    if (businessAccount) {
      return businessAccount.status === 'suspended' ? 'suspended' : 'active'
    }
    if (businessAccountRequest) {
      return businessAccountRequest.status === 'pending' ? 'pending' : 'none'
    }
    return 'none'
  }

  const accountStatus = getAccountStatus()

  // Helper functions for order categorization
  // For business accounts, orders are paid/unpaid based on whether they have been included in paid invoices
  // We need to check if the order has AccountLineItems with paymentStatus 'paid' or 'unpaid'
  const getOrderCounts = () => {
    const allOrders = orders.length
    
    // For business accounts, an order is "paid" if it's NOT in the current unpaid balance
    // Check if order is in unpaidLineItems regions
    const unpaidOrderIds = new Set()
    if (unpaidLineItems?.regions) {
      unpaidLineItems.regions.forEach((region: any) => {
        region.lineItems?.forEach((lineItem: any) => {
          if (lineItem.order?.id) {
            unpaidOrderIds.add(lineItem.order.id)
          }
        })
      })
    }
    
    const unpaidOrders = orders.filter(order => unpaidOrderIds.has(order.id)).length
    const paidOrders = allOrders - unpaidOrders
    
    return {
      all: allOrders,
      paid: paidOrders,
      unpaid: unpaidOrders
    }
  }

  const filterOrdersByStatus = (status: string) => {
    // Build set of unpaid order IDs from unpaidLineItems
    const unpaidOrderIds = new Set()
    if (unpaidLineItems?.regions) {
      unpaidLineItems.regions.forEach((region: any) => {
        region.lineItems?.forEach((lineItem: any) => {
          if (lineItem.order?.id) {
            unpaidOrderIds.add(lineItem.order.id)
          }
        })
      })
    }

    switch (status) {
      case 'paid':
        return orders.filter(order => !unpaidOrderIds.has(order.id))
      case 'unpaid':
        return orders.filter(order => unpaidOrderIds.has(order.id))
      default:
        return orders
    }
  }

  const orderCounts = getOrderCounts()

  const copyToken = async () => {
    if (customer.customerToken) {
      await navigator.clipboard.writeText(customer.customerToken)
      setTokenCopied(true)
      setTimeout(() => setTokenCopied(false), 1500)
    }
  }

  const handleWebhookUpdate = async () => {
    console.log('handleWebhookUpdate called with URL:', webhookUrl.trim())
    
    // Allow empty webhook URL to clear it
    // if (!webhookUrl.trim()) {
    //   toast({
    //     title: "Invalid URL", 
    //     description: "Please enter a valid webhook URL.",
    //     variant: "destructive"
    //   })
    //   return
    // }
    
    setWebhookLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('webhookUrl', webhookUrl.trim())
      
      console.log('Calling updateWebhookUrl server action')
      const result = await updateWebhookUrl({ success: false, error: '' }, formData)
      console.log('Server action result:', result)
      
      setWebhookLoading(false)
      
      if (result.success) {
        setWebhookUpdated(true)
        setTimeout(() => setWebhookUpdated(false), 2000)
        toast({
          title: "Webhook Updated",
          description: "Your order webhook URL has been updated successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update webhook URL",
          variant: "destructive"
        })
      }
    } catch (error) {
      setWebhookLoading(false)
      toast({
        title: "Error", 
        description: "Failed to update webhook URL",
        variant: "destructive"
      })
    }
  }

  const handleTokenRegenerate = () => {
    const formData = new FormData()
    tokenAction(formData)
  }

  if (tokenState.success && 'token' in tokenState) {
    toast({
      title: "Token regenerated",
      description: "Your customer token has been regenerated. Please refresh the page.",
    })
  }

  if (tokenState.error) {
    toast({
      title: "Error",
      description: tokenState.error,
      variant: "destructive",
    })
  }

  // State 1: Empty State (No Account Request)
  if (accountStatus === 'none') {
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
          <p className="mb-4">Setting up a business account gives you the ability to streamline your ordering process with flexible payment terms.</p>
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
        </div>
        <BusinessAccountRequestForm customer={customer} />
      </div>
    )
  }

  // State 2: Pending State
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

  // State 3: Active State
  if (accountStatus === 'active' && businessAccount) {
    const hasUnpaidItems = unpaidLineItems?.success && unpaidLineItems?.regions?.some((region: any) => region.totalAmount > 0)
    
    return (
      <div className="min-h-screen bg-background p-6 md:p-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h1 className="text-2xl font-semibold text-foreground">Business Account Active</h1>
            </div>
            <p className="text-muted-foreground">Your business account is active and ready for API orders.</p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Account Balance */}
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-foreground">Account Balance</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Current Balance:</span>
                  <span className="text-2xl font-semibold text-foreground">{businessAccount.formattedBalance}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Credit Limit:</span>
                  <span className="text-lg font-medium text-foreground">{businessAccount.formattedCreditLimit}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Available Credit:</span>
                  <span className="text-lg font-medium text-green-600">{businessAccount.formattedAvailableCredit}</span>
                </div>
              </div>
            </div>

            {/* API Access */}
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-foreground">API Access</h2>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">Customer Token</Label>
                  <div className="relative">
                    <Input 
                      value={customer.customerToken || 'Loading...'} 
                      readOnly 
                      className="font-mono text-sm bg-muted/30 pe-20" 
                    />
                    <div className="absolute inset-y-0 end-0 flex items-center">
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={copyToken}
                              className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-full w-9 items-center justify-center transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed"
                              aria-label={tokenCopied ? "Copied" : "Copy to clipboard"}
                              disabled={tokenCopied}
                            >
                              <div
                                className={cn(
                                  "transition-all",
                                  tokenCopied ? "scale-100 opacity-100" : "scale-0 opacity-0"
                                )}
                              >
                                <CheckIcon
                                  className="stroke-emerald-500"
                                  size={16}
                                  aria-hidden="true"
                                />
                              </div>
                              <div
                                className={cn(
                                  "absolute transition-all",
                                  tokenCopied ? "scale-0 opacity-0" : "scale-100 opacity-100"
                                )}
                              >
                                <Copy size={16} aria-hidden="true" />
                              </div>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="px-2 py-1 text-xs">
                            Copy to clipboard
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={handleTokenRegenerate}
                              className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed"
                              aria-label="Regenerate token"
                            >
                              <RefreshCw size={16} aria-hidden="true" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="px-2 py-1 text-xs">
                            Regenerate token
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use this token for API requests to place orders on your account.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">Order Webhook URL</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    URL to notify when orders are created or updated (for Openship integration)
                  </p>
                  <div className="relative">
                    <Input 
                      placeholder="https://your-openship.com/api/webhook" 
                      className="bg-muted/30 pe-9"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                    />
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={handleWebhookUpdate}
                            disabled={webhookLoading || webhookUpdated}
                            className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed"
                            aria-label={webhookUpdated ? "Webhook updated" : webhookLoading ? "Updating webhook" : "Update webhook URL"}
                          >
                            {webhookLoading ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <div
                                  className={cn(
                                    "transition-all",
                                    webhookUpdated ? "scale-100 opacity-100" : "scale-0 opacity-0"
                                  )}
                                >
                                  <CheckIcon
                                    className="stroke-emerald-500"
                                    size={16}
                                    aria-hidden="true"
                                  />
                                </div>
                                <div
                                  className={cn(
                                    "absolute transition-all",
                                    webhookUpdated ? "scale-0 opacity-0" : "scale-100 opacity-100"
                                  )}
                                >
                                  <Webhook size={16} aria-hidden="true" />
                                </div>
                              </>
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="px-2 py-1 text-xs">
                          Update webhook URL
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-foreground">Recent Orders</h2>

            {orders.length > 0 ? (
              <Tabs defaultValue="all">
                <ScrollArea>
                  <TabsList className="mb-4 gap-1 bg-transparent">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full data-[state=active]:shadow-none"
                    >
                      <List
                        className="-ms-0.5 me-1.5 opacity-60"
                        size={16}
                        aria-hidden="true"
                      />
                      All
                      <span className="ml-1.5 text-xs opacity-60">{orderCounts.all}</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="paid"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full data-[state=active]:shadow-none"
                    >
                      <CheckCircle
                        className="-ms-0.5 me-1.5 opacity-60"
                        size={16}
                        aria-hidden="true"
                      />
                      Paid
                      <span className="ml-1.5 text-xs opacity-60">{orderCounts.paid}</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="unpaid"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full data-[state=active]:shadow-none"
                    >
                      <AlertCircle
                        className="-ms-0.5 me-1.5 opacity-60"
                        size={16}
                        aria-hidden="true"
                      />
                      Unpaid
                      <span className="ml-1.5 text-xs opacity-60">{orderCounts.unpaid}</span>
                    </TabsTrigger>
                  </TabsList>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
                
                <TabsContent value="all">
                  <div className="space-y-6">
                    {filterOrdersByStatus('all').slice(0, 5).map((order) => (
                      <div key={order.id} className="border-b pb-6 last:pb-0 last:border-none">
                        <OrderCard order={order} />
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="paid">
                  <div className="space-y-6">
                    {filterOrdersByStatus('paid').slice(0, 5).map((order) => (
                      <div key={order.id} className="border-b pb-6 last:pb-0 last:border-none">
                        <OrderCard order={order} />
                      </div>
                    ))}
                  </div>
                  {filterOrdersByStatus('paid').length === 0 && (
                    <p className="text-gray-500 text-center py-8">No paid orders yet.</p>
                  )}
                </TabsContent>
                
                <TabsContent value="unpaid">
                  <div className="space-y-6">
                    {filterOrdersByStatus('unpaid').slice(0, 5).map((order) => (
                      <div key={order.id} className="border-b pb-6 last:pb-0 last:border-none">
                        <OrderCard order={order} />
                      </div>
                    ))}
                  </div>
                  {filterOrdersByStatus('unpaid').length === 0 && (
                    <p className="text-gray-500 text-center py-8">No unpaid orders.</p>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <p className="text-muted-foreground">No orders yet. Start placing orders using your customer token!</p>
            )}
          </div>

          {/* Payment & Account Actions - Moved to Bottom */}
          <div className="space-y-6 pt-8">
            <h2 className="text-xl font-medium text-foreground">Payment & Account Actions</h2>

            {/* Outstanding Balance Alert */}
            {hasUnpaidItems && (
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 border-2 border-orange-500 rounded flex items-center justify-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  </div>
                  <h3 className="font-semibold text-orange-800">Outstanding Balance</h3>
                </div>
                <p className="text-orange-700">You have unpaid orders. Click below to pay your outstanding balance.</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button 
                className="bg-foreground text-background hover:bg-foreground/90"
                onClick={() => setShowPaymentDialog(true)}
                disabled={!hasUnpaidItems}
              >
                {hasUnpaidItems ? 'Pay Outstanding Balance' : 'No Outstanding Balance'}
              </Button>
              <Button variant="outline">Request Credit Increase</Button>
              <Button variant="outline">Email Account</Button>
            </div>
          </div>
        </div>

        {/* Payment Dialog */}
        {showPaymentDialog && (
          <PaymentDialog
            isOpen={showPaymentDialog}
            onClose={() => setShowPaymentDialog(false)}
            businessAccount={businessAccount}
            unpaidLineItems={unpaidLineItems}
          />
        )}
      </div>
    )
  }

  // State 4: Suspended State  
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
              Your business account has been suspended. Please contact our billing team.
            </p>
            
            <div className="flex gap-4 justify-center pt-4">
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

export default InvoicingTab