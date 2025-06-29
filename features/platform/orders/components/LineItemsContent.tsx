"use client";

import React, { useState } from "react";
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

interface LineItemsContentProps {
  orderId: string;
  totalItems: number;
  lineItems: LineItem[];
}

export const LineItemsContent = ({
  orderId,
  totalItems,
  lineItems,
}: LineItemsContentProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = lineItems.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col gap-2 py-3 px-5 bg-blue-50/30 dark:bg-indigo-900/10 border-b">
      {/* Pagination controls */}
      {totalItems > 5 && (
        <div className="flex items-center gap-2 mb-2">
          <ItemPagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
      
      {/* Items count info */}
      {totalItems > 5 && (
        <div className="text-xs text-muted-foreground mb-2">
          Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} items
        </div>
      )}
      
      {/* Line Items */}
      <div className="space-y-2">
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
      </div>
    </div>
  );
};