"use client";

import React, { useState } from "react";
import { LineItemsContent } from "./LineItemsContent";
import { ReturnsSection } from "./ReturnsSection";
import { ClaimsSection } from "./ClaimsSection";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OrderSectionTabsProps {
  order: any;
}

type TabType = 'lineItems' | 'returns' | 'claims';

export const OrderSectionTabs = ({ order }: OrderSectionTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabType | null>('lineItems');
  
  const handleTabClick = (tab: TabType) => {
    // If clicking the same tab, close it. Otherwise, open the new tab.
    setActiveTab(activeTab === tab ? null : tab);
  };

  // Calculate counts for tabs
  const lineItemsCount = order.lineItems?.length || 0;
  const returnsCount = order.returns?.length || 0;
  const claimsCount = order.claimOrders?.length || 0;

  // Tab button base classes
  const tabButtonClass = "text-sm font-medium px-3 py-2 rounded-md transition-colors";
  const activeTabClass = "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
  const inactiveTabClass = "text-muted-foreground hover:text-foreground hover:bg-muted";

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleTabClick('lineItems')}
          className={cn(
            tabButtonClass,
            activeTab === 'lineItems' ? activeTabClass : inactiveTabClass
          )}
        >
          {lineItemsCount} Line Item{lineItemsCount !== 1 ? 's' : ''}
        </Button>
        
        {returnsCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleTabClick('returns')}
            className={cn(
              tabButtonClass,
              activeTab === 'returns' ? activeTabClass : inactiveTabClass
            )}
          >
            {returnsCount} Return{returnsCount !== 1 ? 's' : ''}
          </Button>
        )}
        
        {claimsCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleTabClick('claims')}
            className={cn(
              tabButtonClass,
              activeTab === 'claims' ? activeTabClass : inactiveTabClass
            )}
          >
            {claimsCount} Claim{claimsCount !== 1 ? 's' : ''}
          </Button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'lineItems' && (
        <LineItemsContent
          orderId={order.id}
          totalItems={lineItemsCount}
          lineItems={order.lineItems || []}
        />
      )}
      
      {activeTab === 'returns' && returnsCount > 0 && (
        <ReturnsSection 
          order={order} 
          returns={order.returns || []} 
        />
      )}
      
      {activeTab === 'claims' && claimsCount > 0 && (
        <ClaimsSection 
          order={order} 
          claims={order.claimOrders || []} 
        />
      )}
    </div>
  );
};