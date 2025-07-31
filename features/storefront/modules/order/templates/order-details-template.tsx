"use client"

import { X } from "lucide-react"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import Help from "@/features/storefront/modules/order/components/help"
import Items from "@/features/storefront/modules/order/components/items"
import OrderDetails from "@/features/storefront/modules/order/components/order-details"
import OrderSummary from "@/features/storefront/modules/order/components/order-summary"
import ShippingDetails from "@/features/storefront/modules/order/components/shipping-details"
import React from "react"
import { StoreOrder } from "@/features/storefront/types/storefront"

type OrderDetailsTemplateProps = {
  order: StoreOrder
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
}) => {
  return (
    <div className="flex flex-col justify-center gap-y-4">
      <div className="flex gap-2 justify-between items-center">
        <h1 className="text-3xl font-semibold">Order details</h1>
        <LocalizedClientLink
          href="/account/orders"
          className="flex gap-2 items-center text-muted-foreground hover:text-foreground"
          data-testid="back-to-overview-button"
        >
          <X /> Back to overview
        </LocalizedClientLink>
      </div>
      <div
        className="flex flex-col gap-4 h-full bg-background w-full"
        data-testid="order-details-container"
      >
        <OrderDetails order={order} showStatus />
        <Items items={order.lineItems} region={order.region} /> 
        <ShippingDetails order={order} />
        <OrderSummary order={order} />
        <Help />
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
