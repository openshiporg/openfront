"use client";

import React, { useState } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ChevronsUpDown } from "lucide-react";
import { ItemPagination } from "../../orders/components/ItemPagination";

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

export const VariantsContent = ({
  productId,
  totalItems,
  variants,
}: VariantsContentProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = variants.slice(startIndex, endIndex);

  const triggerClassName =
    "flex items-center rounded-sm shadow-sm uppercase tracking-wide border max-w-fit gap-2 text-nowrap pl-2.5 pr-1 py-[3px] text-sm font-medium text-emerald-500 bg-white border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700 focus:z-10 focus:ring-2 focus:ring-emerald-700 focus:text-emerald-700 dark:bg-emerald-950 dark:border-emerald-900 dark:text-emerald-300 dark:hover:text-white dark:hover:bg-emerald-700 dark:focus:ring-emerald-500 dark:focus:text-white";

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex flex-col gap-2 py-3 px-4 md:px-6 bg-emerald-50/30 dark:bg-emerald-900/10 border-b"
    >
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild>
          <button type="button" className={triggerClassName}>
            {totalItems} Variant{totalItems !== 1 ? "s" : ""}
            <ChevronsUpDown className="h-4 w-4" />
          </button>
        </CollapsibleTrigger>
        {isOpen && totalItems > 5 && (
          <ItemPagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
      <CollapsibleContent className="space-y-2">
        {isOpen && (
          <>
            {totalItems > 5 && (
              <div className="text-xs text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{" "}
                {totalItems} variants
              </div>
            )}
            {paginatedItems.map((variant) => (
              <div
                key={variant.id}
                className="border p-3 bg-background rounded-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
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
                      className="text-xs"
                    >
                      {variant.inventoryQuantity || 0} in stock
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};