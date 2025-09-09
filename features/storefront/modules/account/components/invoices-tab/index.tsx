"use client"

import { User } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Receipt, Calendar, CreditCard } from "lucide-react"
import { format } from "date-fns"

type InvoicesTabProps = {
  customer: User
  invoices: any[]
}

const InvoicesTab = ({ customer, invoices }: InvoicesTabProps) => {
  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Paid Invoices</h2>
        <p className="text-muted-foreground">
          View your payment history and invoice details
        </p>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No paid invoices</h3>
            <p className="text-muted-foreground text-center">
              Your paid invoices will appear here once you complete payments through the Business Account page.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="divide-y">
          {invoices.map((invoice: any) => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      )}
    </div>
  )
}

type InvoiceCardProps = {
  invoice: any
}

const InvoiceCard = ({ invoice }: InvoiceCardProps) => {
  return (
    <div className="py-6 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Receipt className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">
            Invoice {invoice.invoiceNumber}
          </h3>
        </div>
        <span className="size-max flex items-center whitespace-nowrap rounded-full ring-1 ring-inset bg-white text-gray-900 ring-gray-200 shadow-xs gap-1.5 py-0.5 px-2 text-sm font-medium">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-emerald-400">
            <circle cx="4" cy="4" r="2.5" fill="currentColor" stroke="currentColor"></circle>
          </svg>
          Paid
        </span>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-2xl font-bold">{invoice.formattedTotal}</p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              {invoice.paidAt && (
                <div className="flex items-center space-x-1">
                  <CreditCard className="h-3 w-3" />
                  <span>Paid {format(new Date(invoice.paidAt), "MMM d, yyyy")}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>Created {format(new Date(invoice.createdAt), "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Account</p>
            <p className="font-medium text-sm">{invoice.account?.accountNumber}</p>
          </div>
        </div>
        {invoice.lineItems && invoice.lineItems.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">
              {invoice.lineItems.length} order{invoice.lineItems.length !== 1 ? 's' : ''} included
            </p>
            <div className="space-y-2">
              {invoice.lineItems?.map((lineItem: any) => (
                <div 
                  key={lineItem.id} 
                  className="bg-muted/40 border rounded-md flex justify-between items-center p-3 cursor-pointer hover:bg-muted/60"
                  onClick={() => window.open(`/account/orders/details/${lineItem.accountLineItem?.order?.id}`, '_blank')}
                >
                  <div className="grid grid-cols-3 text-xs leading-4 font-normal gap-x-3 flex-1">
                    <span className="font-semibold text-gray-700">Date placed</span>
                    <span className="font-semibold text-gray-700">Order number</span>
                    <span className="font-semibold text-gray-700">Total amount</span>
                    <span>{lineItem.orderDetails?.createdAt ? new Date(lineItem.orderDetails.createdAt).toLocaleDateString() : 'N/A'}</span>
                    <span>#{lineItem.orderDetails?.displayId || lineItem.orderDisplayId}</span>
                    <span>{lineItem.orderDetails?.total || lineItem.formattedAmount}</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InvoicesTab