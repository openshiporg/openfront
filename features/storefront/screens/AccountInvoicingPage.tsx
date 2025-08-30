import { Metadata } from "next"
import { notFound } from "next/navigation"

import InvoicingTemplate from "@/features/storefront/modules/account/templates/invoicing-template"
import { StorefrontAccountCustomer } from "@/features/storefront/types"
import { getUser } from "@/features/storefront/lib/data/user"

export const metadata: Metadata = {
  title: "Invoicing",
  description: "Manage your invoicing and programmatic ordering access.",
}

export async function AccountInvoicingPage() {
  const customer: StorefrontAccountCustomer | null = await getUser()

  if (!customer) {
    notFound()
  }

  return <InvoicingTemplate customer={customer} />
}