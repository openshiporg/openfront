import { getUser, listCustomerOrders } from "@storefront/lib/data"
import Overview from "@storefront/modules/account/components/overview"
import { notFound } from "next/navigation"

export const metadata = {
  title: "Account",
  description: "Overview of your account activity.",
}

export default async function OverviewTemplate() {
  const { authenticatedItem: user } = await getUser()
  const { orders } = await listCustomerOrders().catch(() => ({ orders: [] }))

  if (!user) {
    notFound()
  }

  return <Overview user={user} orders={orders} />
}
