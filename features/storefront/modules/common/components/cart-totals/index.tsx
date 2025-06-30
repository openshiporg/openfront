"use client";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import React from "react";

interface CartTotalsProps {
  data: {
    subtotal?: number | string | null;
    discount?: number | string | null;
    giftCardTotal?: number | string | null;
    shipping?: number | string | null;
    tax?: number | string | null;
    total?: number | string | null;
  } | null;
}

const CartTotals = ({ data }: CartTotalsProps) => {
  if (!data) {
    return null;
  }

  return (
    <div>
      <div className="flex flex-col gap-y-2 text-base font-medium text-muted-foreground">
        <div className="flex items-center justify-between">
          <span className="flex gap-x-2 items-center">
            Subtotal
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  Cart total excluding shipping and taxes.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
          <span>{data.subtotal}</span>
        </div>

        {data.discount && data.discount !== "0" && (
          <div className="flex justify-between">
            <span>Discount</span>
            <span className="text-blue-600">- {data.discount}</span>
          </div>
        )}

        {data.giftCardTotal && data.giftCardTotal !== "0" && (
          <div className="flex justify-between">
            <span>Gift card</span>
            <span className="text-blue-600">- {data.giftCardTotal}</span>
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
      <div className="h-px w-full border-b my-4" />
      <div className="flex items-center justify-between mb-2 text-base font-medium">
        <span>Total</span>
        <span className="text-2xl font-semibold">{data.total}</span>
      </div>
      <div className="h-px w-full border-b mt-4" />
    </div>
  );
};

export default CartTotals;
