"use client";

import React, { useState } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import { ItemPagination } from "./ItemPagination";
import Image from "next/image";

interface LineItem {
  id: string;
  title: string;
  quantity: number;
  sku?: string;
  thumbnail?: string;
  formattedUnitPrice?: string;
  formattedTotal?: string;
  variantTitle?: string;
  variantData?: any;
  productData?: any;
}

interface ProductDetailsCollapsibleProps {
  orderId: string;
  title: string;
  defaultOpen?: boolean;
  totalItems: number;
  lineItems: LineItem[];
}

export const ProductDetailsCollapsible = ({
  orderId,
  title,
  defaultOpen = true,
  totalItems,
  lineItems,
}: ProductDetailsCollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = lineItems.slice(startIndex, endIndex);

  const triggerClassName =
    "flex items-center rounded-sm shadow-sm uppercase tracking-wide border max-w-fit gap-2 text-nowrap pl-2.5 pr-1 py-[3px] text-sm font-medium text-blue-500 bg-white border-blue-200 hover:bg-blue-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-300 dark:hover:text-white dark:hover:bg-blue-700 dark:focus:ring-blue-500 dark:focus:text-white";

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex flex-col gap-2 py-3 px-5 bg-blue-50/30 dark:bg-indigo-900/10 border-b"
    >
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild>
          <button type="button" className={triggerClassName}>
            {totalItems} {title}
            {totalItems !== 1 && "s"}
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
                Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} items
              </div>
            )}
            {paginatedItems.map((item) => (
              <div
                key={item.id}
                className="border p-2 bg-background rounded-sm flex flex-col sm:flex-row gap-4"
              >
                {item.thumbnail && (
                  <div className="flex-shrink-0">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      width={48}
                      height={48}
                      className="size-12 rounded-lg object-cover"
                    />
                  </div>
                )}
                <div className="grid flex-grow">
                  <span className="text-sm font-medium">
                    {item.title}
                  </span>
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
                  <div className="flex flex-col">
                    <p className="text-xs font-medium">
                      Quantity: {item.quantity}
                    </p>
                    <div className="flex flex-col">
                      <div className="text-xs">
                        {item.formattedTotal || ''}
                        {item.quantity > 1 && item.formattedUnitPrice && (
                          <span className="text-muted-foreground ml-1">
                            ({item.formattedUnitPrice} × {item.quantity})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};