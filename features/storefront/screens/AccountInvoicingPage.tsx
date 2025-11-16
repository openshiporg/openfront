import { Metadata } from "next"
import { notFound } from "next/navigation"

import InvoicingTemplate from "@/features/storefront/modules/account/templates/invoicing-template"
import { StorefrontAccountCustomer } from "@/features/storefront/types"
import { getUser } from "@/features/storefront/lib/data/user"
import { getCustomerBusinessAccount, getBusinessAccountRequest, getCustomerOrdersForAccount } from "@/features/storefront/lib/data/business-accounts"
import { getUnpaidLineItemsByRegion } from "@/features/storefront/modules/account/components/invoicing-tab/invoice-actions"

export const metadata: Metadata = {
  title: "Invoicing",
  description: "Manage your invoicing and programmatic ordering access.",
}

export async function AccountInvoicingPage() {
  const customer: StorefrontAccountCustomer | null = await getUser()

  if (!customer) {
    notFound()
  }

  // Fetch all business account data server-side
  const [businessAccount, businessAccountRequest, orders] = await Promise.all([
    getCustomerBusinessAccount(customer.id),
    getBusinessAccountRequest(customer.id),
    getCustomerOrdersForAccount(customer.id)
  ])

  // Get unpaid line items if business account exists
  const unpaidLineItems = businessAccount ? await getUnpaidLineItemsByRegion(businessAccount.id) : null

  return (
    <InvoicingTemplate
      customer={customer}
      businessAccount={businessAccount}
      businessAccountRequest={businessAccountRequest}
      orders={orders}
      unpaidLineItems={unpaidLineItems}
    />
  )
}
