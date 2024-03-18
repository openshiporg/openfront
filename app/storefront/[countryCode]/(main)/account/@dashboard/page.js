import { getCustomer, listCustomerOrders } from "@storefront/lib/data"
import Overview from "@storefront/modules/account/components/overview"
import { notFound } from "next/navigation"

export const metadata = {
  title: "Account",
  description: "Overview of your account activity.",
}

export default async function OverviewTemplate() {
  const customer = await getCustomer().catch(() => null)
  const orders = (await listCustomerOrders().catch(() => null)) || null

  if (!customer) {
    notFound()
  }

  return <Overview customer={customer} orders={orders} />;
}
