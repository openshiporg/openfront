"use client";

import React from "react";
import { LineItemsContent } from "./LineItemsContent";
import { ReturnsCollapsible } from "./ReturnsCollapsible";
import { ClaimsCollapsible } from "./ClaimsCollapsible";

interface OrderSectionTabsProps {
  order: any;
}

export const OrderSectionTabs = ({ order }: OrderSectionTabsProps) => {
  // Calculate counts for sections
  const lineItemsCount = order.lineItems?.length || 0;
  const returnsCount = order.returns?.length || 0;
  const claimsCount = order.claimOrders?.length || 0;

  return (
    <div className="space-y-0">
      {/* Line Items Section - Always show */}
      {lineItemsCount > 0 && (
        <LineItemsContent
          orderId={order.id}
          totalItems={lineItemsCount}
          lineItems={order.lineItems || []}
        />
      )}
      
      {/* Returns Section - Only show if there are returns */}
      {returnsCount > 0 && (
        <ReturnsCollapsible 
          order={order} 
          returns={order.returns || []} 
          totalItems={returnsCount}
        />
      )}
      
      {/* Claims Section - Only show if there are claims */}
      {claimsCount > 0 && (
        <ClaimsCollapsible 
          order={order} 
          claims={order.claimOrders || []} 
          totalItems={claimsCount}
        />
      )}
    </div>
  );
};