"use client";
import { InformationCircleSolid } from "@medusajs/icons"
import { Tooltip } from "@medusajs/ui"
import React from "react"

const CartTotals = ({ data }) => {
  return (
    <div>
      <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle ">
        <div className="flex items-center justify-between">
          <span className="flex gap-x-1 items-center">
            Subtotal
            <Tooltip content="Cart total excluding shipping and taxes.">
              <InformationCircleSolid color="var(--fg-muted)" />
            </Tooltip>
          </span>
          <span>{data.subtotal}</span>
        </div>
        {!!data.discount && (
          <div className="flex items-center justify-between">
            <span>Discount</span>
            <span className="text-ui-fg-interactive">
              - {data.discount}
            </span>
          </div>
        )}
        {!!data.giftCardTotal && (
          <div className="flex items-center justify-between">
            <span>Gift card</span>
            <span className="text-ui-fg-interactive">
              - {data.giftCardTotal}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span>{data.shipping}</span>
        </div>
        <div className="flex justify-between">
          <span className="flex gap-x-1 items-center">Taxes</span>
          <span>{data.tax}</span>
        </div>
      </div>
      <div className="h-px w-full border-b border-gray-200 my-4" />
      <div className="flex items-center justify-between text-ui-fg-base mb-2 txt-medium">
        <span>Total</span>
        <span className="txt-xlarge-plus">{data.total}</span>
      </div>
      <div className="h-px w-full border-b border-gray-200 mt-4" />
    </div>
  );
};

export default CartTotals
