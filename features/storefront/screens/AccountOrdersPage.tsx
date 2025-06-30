import { Metadata } from "next"
import type { StorefrontOrderOverviewItem } from '@/features/storefront/types'

import OrderOverview from "@/features/storefront/modules/account/components/order-overview"
import { notFound } from "next/navigation"
import { listCustomerOrders } from "@/features/storefront/lib/data/orders"
import Divider from "@/features/storefront/modules/common/components/divider"

export const metadata: Metadata = {
  title: "Orders",
  description: "Overview of your previous orders.",
}

export async function AccountOrdersPage() {
  const orders: StorefrontOrderOverviewItem[] | null = await listCustomerOrders()

  if (!orders) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-sm font-normal">
          View your previous orders and their status. You can also create
          returns or exchanges for your orders if needed.
        </p>
      </div>
      <div>
        <OrderOverview orders={orders} />
        <Divider className="my-16" />
        {/* <TransferRequestForm /> */}
      </div>
    </div>
  )
}