import { Metadata } from "next"
import { notFound } from "next/navigation"

import AddressBook from "@/features/storefront/modules/account/components/address-book"
import { StorefrontAccountCustomer, StorefrontRegion } from "@/features/storefront/types"

import { getRegion } from "@/features/storefront/lib/data/regions"
import { getUser } from "@/features/storefront/lib/data/user"

export const metadata: Metadata = {
  title: "Addresses",
  description: "View your addresses",
}

export async function AccountAddressesPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const customer: StorefrontAccountCustomer | null = await getUser()
  const region: StorefrontRegion | null = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="addresses-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl font-semibold">Shipping Addresses</h1>
        <p className="text-sm font-normal">
          View and update your shipping addresses, you can add as many as you
          like. Saving your addresses will make them available during checkout.
        </p>
      </div>
      <AddressBook customer={customer} region={region} />
    </div>
  )
}