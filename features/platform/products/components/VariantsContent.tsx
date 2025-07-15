"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ItemPagination } from "../../orders/components/ItemPagination";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";

interface ProductVariant {
  id: string;
  title: string;
  sku?: string;
  inventoryQuantity?: number;
  manageInventory?: boolean;
}

interface VariantsContentProps {
  productId: string;
  totalItems: number;
  variants: ProductVariant[];
}

type TabType = 'variants';

export const VariantsContent = ({
  productId,
  totalItems,
  variants,
}: VariantsContentProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('variants');
  const [currentPage, setCurrentPage] = useState(1);
  const [editItemId, setEditItemId] = useState<string>('');
  const [editItemOpen, setEditItemOpen] = useState(false);
  const itemsPerPage = 5;

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = variants.slice(startIndex, endIndex);

  // Build tabs array
  const tabs = [
    { 
      key: 'variants' as TabType, 
      label: 'Variants',
      count: totalItems,
      data: variants
    }
  ];

  const activeTabData = tabs.find(tab => tab.key === activeTab);

  const handleEditItem = (itemId: string) => {
    setEditItemId(itemId);
    setEditItemOpen(true);
  };

  return (
    <>
      {/* Responsive Tabs Navigation */}
      <div className="bg-muted/80 border-b">
        {/* Desktop: Horizontal Tab Buttons */}
        <div className="hidden md:flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative z-10 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 border ${
                  activeTab === tab.key 
                    ? 'bg-background border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100' 
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-background/50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>Variants</span>
                  <span className="rounded-sm bg-muted border px-1.5 py-0 text-[10px] leading-[14px] font-medium text-muted-foreground inline-flex items-center h-[18px]">
                    {tab.count}
                  </span>
                </div>
              </button>
            ))}
          </div>
          {totalItems > itemsPerPage && (
            <ItemPagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        {/* Mobile: Select Dropdown */}
        <div className="md:hidden px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="w-fit">
              <Select value={activeTab} onValueChange={(value: TabType) => setActiveTab(value)}>
                <SelectTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-background border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 h-auto w-auto">
                  <div className="flex items-center gap-1.5">
                    <SelectValue />
                    <span className="rounded-sm bg-muted border px-1.5 py-0 text-[10px] leading-[14px] font-medium text-muted-foreground inline-flex items-center h-[18px]">
                      ({activeTabData?.count || 0})
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {tabs.map((tab) => (
                    <SelectItem key={tab.key} value={tab.key} className="text-xs">
                      Variants
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {totalItems > itemsPerPage && (
              <ItemPagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Tab Content Area */}
      <div className="bg-muted/40">
        {activeTab === 'variants' && totalItems > 0 && (
          <div className="px-4 py-2">
            {totalItems > itemsPerPage && (
              <div className="text-xs text-muted-foreground mb-3 pl-0.5">
                Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{" "}
                {totalItems} variants
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {paginatedItems.map((variant) => (
                <div
                  key={variant.id}
                  className="rounded-md border bg-background p-3 shadow-sm relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {variant.title}
                      </p>
                      {variant.sku && (
                        <p className="text-xs text-muted-foreground mt-1">
                          SKU: {variant.sku}
                        </p>
                      )}
                    </div>
                    {variant.manageInventory && (
                      <Badge
                        variant={
                          variant.inventoryQuantity === 0
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs shrink-0"
                      >
                        {variant.inventoryQuantity || 0} in stock
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditItem(variant.id)}>
                          Edit Variant
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Variant Drawer */}
      {editItemId && (
        <EditItemDrawerClientWrapper
          listKey="product-variants"
          itemId={editItemId}
          open={editItemOpen}
          onClose={() => {
            setEditItemOpen(false);
            setEditItemId('');
          }}
        />
      )}
    </>
  );
};