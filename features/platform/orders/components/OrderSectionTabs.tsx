"use client";

import React, { useState } from "react";
import { ReturnsSection } from "./ReturnsSection";
import { ClaimsSection } from "./ClaimsSection";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";

interface OrderSectionTabsProps {
  order: any;
}

type TabType = 'lineItems' | 'returns' | 'claims';

export const OrderSectionTabs = ({ order }: OrderSectionTabsProps) => {
  const [editLineItemId, setEditLineItemId] = useState<string>('');
  const [editLineItemOpen, setEditLineItemOpen] = useState(false);
  
  // Calculate counts for sections
  const lineItemsCount = order.lineItems?.length || 0;
  const returnsCount = order.returns?.length || 0;
  const claimsCount = order.claimOrders?.length || 0;

  // Build tabs array
  const tabs = [
    { 
      key: 'lineItems' as TabType, 
      label: `Line Items`,
      count: lineItemsCount,
      data: order.lineItems || []
    },
    ...(returnsCount > 0 ? [{ 
      key: 'returns' as TabType, 
      label: `Returns`,
      count: returnsCount,
      data: order.returns || []
    }] : []),
    ...(claimsCount > 0 ? [{ 
      key: 'claims' as TabType, 
      label: `Claims`,
      count: claimsCount,
      data: order.claimOrders || []
    }] : [])
  ];

  const [activeTab, setActiveTab] = useState<TabType>('lineItems');
  const activeTabData = tabs.find(tab => tab.key === activeTab);

  const handleEditLineItem = (lineItemId: string) => {
    setEditLineItemId(lineItemId);
    setEditLineItemOpen(true);
  };

  return (
    <>
      {/* Responsive Tabs Navigation */}
      <div className="bg-muted/40">
        {/* Desktop: Horizontal Tab Buttons */}
        <div className="hidden md:flex items-center gap-3 px-4 pt-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`relative z-10 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-300 border ${
                activeTab === tab.key 
                  ? 'bg-background border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100' 
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-background/50'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>
                  {tab.key === 'lineItems' && 'Line Items'}
                  {tab.key === 'returns' && 'Returns'}
                  {tab.key === 'claims' && 'Claims'}
                </span>
                <span className="rounded-sm bg-muted border px-1.5 py-0 text-[10px] leading-[14px] font-medium text-muted-foreground inline-flex items-center h-[18px] -mr-1 -mr-1">
                  {tab.count}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Mobile: Select Dropdown */}
        <div className="md:hidden px-4 py-2">
          <div className="w-fit">
            <Select value={activeTab} onValueChange={(value: TabType) => setActiveTab(value)}>
              <SelectTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-background border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 h-auto w-auto">
                <div className="flex items-center gap-1.5">
                  <SelectValue />
                  <span className="rounded-sm bg-muted border px-1.5 py-0 text-[10px] leading-[14px] font-medium text-muted-foreground inline-flex items-center h-[18px] -mr-1">
                    ({activeTabData?.count || 0})
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {tabs.map((tab) => (
                  <SelectItem key={tab.key} value={tab.key} className="text-xs">
                    {tab.key === 'lineItems' && 'Line Items'}
                    {tab.key === 'returns' && 'Returns'}
                    {tab.key === 'claims' && 'Claims'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Tab Content Area */}
      <div className="bg-muted/40">
        {activeTab === 'lineItems' && lineItemsCount > 0 && (
          <div className="px-4 py-2">
            <div className="space-y-2">
              {(order.lineItems || []).map((item: any) => (
                <div
                  key={item.id}
                  className="border p-2 bg-background rounded-md flex flex-col sm:flex-row gap-4 relative"
                >
                  <div className="flex-shrink-0">
                    <div className="size-12 bg-gray-100 rounded-md overflow-hidden">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="size-12 object-cover"
                        />
                      ) : (
                        <div className="size-12 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid flex-grow">
                    <span className="text-sm font-medium">{item.title}</span>
                    {item.variantData?.title && (
                      <div className="text-xs text-muted-foreground font-medium">
                        {item.variantData.title}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {item.sku ? `SKU: ${item.sku}` : item.variantData?.sku ? `SKU: ${item.variantData.sku}` : ''}
                      {item.variantData?.barcode && (
                        <> | Barcode: {item.variantData.barcode}</>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-medium">
                        Quantity: {item.quantity}
                      </p>
                      <div className="flex flex-col">
                        <div className="text-xs">
                          {item.formattedTotal || ""}
                          {item.quantity > 1 && item.formattedUnitPrice && (
                            <span className="text-muted-foreground ml-1">
                              ({item.formattedUnitPrice} × {item.quantity})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditLineItem(item.id)}>
                          Edit Line Item
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'returns' && returnsCount > 0 && (
          <div className="px-4 py-2">
            <ReturnsSection 
              order={order} 
              returns={order.returns || []} 
              totalItems={returnsCount}
            />
          </div>
        )}
        
        {activeTab === 'claims' && claimsCount > 0 && (
          <div className="px-4 py-2">
            <ClaimsSection 
              order={order} 
              claims={order.claimOrders || []} 
              totalItems={claimsCount}
            />
          </div>
        )}
      </div>

      {/* Edit Line Item Drawer */}
      {editLineItemId && (
        <EditItemDrawerClientWrapper
          listKey="order-line-items"
          itemId={editLineItemId}
          open={editLineItemOpen}
          onClose={() => {
            setEditLineItemOpen(false);
            setEditLineItemId('');
          }}
        />
      )}
    </>
  );
};