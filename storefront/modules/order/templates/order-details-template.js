"use client";
import { XMark } from "@medusajs/icons"
import React from "react"

import Help from "@storefront/modules/order/components/help"
import Items from "@storefront/modules/order/components/items"
import OrderDetails from "@storefront/modules/order/components/order-details"
import OrderSummary from "@storefront/modules/order/components/order-summary"
import ShippingDetails from "@storefront/modules/order/components/shipping-details"
import LocalizedClientLink from "@storefront/modules/common/components/localized-client-link"

const OrderDetailsTemplate = ({
  order,
}) => {
  return (
    <div className="flex flex-col justify-center gap-y-4">
      <div className="flex gap-2 justify-between items-center">
        <h1 className="text-2xl-semi">Order details</h1>
        <LocalizedClientLink
          href="/account/orders"
          className="flex gap-2 items-center text-ui-fg-subtle hover:text-ui-fg-base">
          <XMark /> Back to overview
        </LocalizedClientLink>
      </div>
      <div className="flex flex-col gap-4 h-full bg-white w-full">
        <OrderDetails order={order} showStatus />
        <Items items={order.lineItems} region={order.region} />
        <ShippingDetails order={order} />
        <OrderSummary order={order} />
        <Help />
      </div>
    </div>
  );
}

export default OrderDetailsTemplate
