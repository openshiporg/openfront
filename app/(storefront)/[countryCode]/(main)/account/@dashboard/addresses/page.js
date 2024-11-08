import { notFound } from "next/navigation"
import AddressBook from "@storefront/modules/account/components/address-book"
import { getUser, getRegion } from "@storefront/lib/data"
import { headers } from "next/headers"

export const metadata = {
  title: "Addresses",
  description: "View your addresses",
}

export default async function Addresses() {
  const nextHeaders = headers()
  const countryCode = nextHeaders.get("next-url")?.split("/")[1] || ""
  const { authenticatedItem: user } = await getUser()
  const region = await getRegion(countryCode)

  if (!user || !region) {
    notFound()
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Shipping Addresses</h1>
        <p className="text-base-regular">
          View and update your shipping addresses, you can add as many as you like. 
          Saving your addresses will make them available during checkout.
        </p>
      </div>
      <AddressBook user={user} region={region} />
    </div>
  )
}
