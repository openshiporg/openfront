"use client"

import { Button } from "@/components/ui/button" 
import type { StorefrontOrderOverviewItem } from '@/features/storefront/types'

import OrderCard from "../order-card"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link" 

const OrderOverview = ({ orders }: { orders: StorefrontOrderOverviewItem[] }) => {
  if (orders?.length) {
    return (
      <div className="flex flex-col gap-y-8 w-full">
        {orders.map((o) => (
          <div
            key={o.id}
            className="border-b pb-6 last:pb-0 last:border-none"
          >
            <OrderCard order={o} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className="w-full flex flex-col items-center gap-y-4"
      data-testid="no-orders-container"
    >
      <h2 className="text-base leading-6 font-semibold">Nothing to see here</h2>
      <p className="text-sm leading-6 font-normal">
        You don&apos;t have any orders yet, let us change that {":)"}
      </p>
      <div className="mt-4">
        <LocalizedClientLink href="/" passHref>
          <Button data-testid="continue-shopping-button">
            Continue shopping
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default OrderOverview
