import { Metadata } from "next"
import { notFound } from "next/navigation"

import InvoicesTemplate from "@/features/storefront/modules/account/templates/invoices-template"
import { StorefrontAccountCustomer } from "@/features/storefront/types"
import { getUser } from "@/features/storefront/lib/data/user"
import { getCustomerPaidInvoices } from "@/features/storefront/lib/data/business-accounts"

export const metadata: Metadata = {
  title: "Invoices",
  description: "View your paid invoices and payment history.",
}

export async function AccountInvoicesPage() {
  const customer: StorefrontAccountCustomer | null = await getUser()

  if (!customer) {
    notFound()
  }

  // Fetch all paid invoices for the customer
  const paidInvoices = await getCustomerPaidInvoices(50) // Get up to 50 recent invoices

  return (
    <InvoicesTemplate 
      customer={customer} 
      invoices={paidInvoices}
    />
  )
}