import React, { useState } from "react";
import { useQuery, gql } from "@keystone-6/core/admin-ui/apollo";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import { ItemPagination, ItemPaginationStats } from "./ItemPagination";
import { Skeleton } from "@ui/skeleton";
import { Badge } from "@ui/badge";
import Image from "next/image";

const formatMoney = (amount, currency) => {
  const value = amount / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
  }).format(value);
};

export const LINE_ITEMS_QUERY = gql`
  query LINE_ITEMS_QUERY($orderId: ID!, $take: Int!, $skip: Int!) {
    orderLineItems(
      where: { order: { id: { equals: $orderId } } }
      take: $take
      skip: $skip
      orderBy: [{ updatedAt: desc }]
    ) {
      id
      quantity
      title
      sku
      thumbnail
      metadata
      productData
      variantData
      variantTitle
      formattedUnitPrice
      formattedTotal
    }
    orderLineItemsCount(where: { order: { id: { equals: $orderId } } })
  }
`;

export const ProductDetailsCollapsible = ({
  orderId,
  title,
  defaultOpen = true,
  openEditDrawer,
  totalItems,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data, loading, error } = useQuery(LINE_ITEMS_QUERY, {
    variables: {
      orderId,
      take: itemsPerPage,
      skip: (currentPage - 1) * itemsPerPage,
    },
    skip: !isOpen,
  });

  const items = data?.orderLineItems;
  const itemsCount = data?.orderLineItemsCount;

  const triggerClassName =
    "flex items-center rounded-sm shadow-sm uppercase tracking-wide border max-w-fit gap-2 text-nowrap pl-2.5 pr-1 py-[3px] text-sm font-medium text-blue-500 bg-white border-blue-200 hover:bg-blue-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-300 dark:hover:text-white dark:hover:bg-blue-700 dark:focus:ring-blue-500 dark:focus:text-white";

  const renderSkeletonItem = () => (
    <div className="border p-2 bg-background rounded-sm flex items-center gap-4 relative">
      <div className="grid flex-grow gap-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex flex-col gap-2 py-3 px-5 bg-blue-50/30 dark:bg-indigo-900/10 border-b"
    >
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild>
          <button type="button" className={triggerClassName}>
            {itemsCount || totalItems} {title}
            {(itemsCount || totalItems) !== 1 && "s"}
            <ChevronsUpDown className="h-4 w-4" />
          </button>
        </CollapsibleTrigger>
        {isOpen && totalItems > 5 && (
          <ItemPagination
            currentPage={currentPage}
            totalItems={itemsCount || totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
      <CollapsibleContent className="space-y-2">
        {isOpen && (
          <>
            {totalItems > 5 && (
              <ItemPaginationStats
                currentPage={currentPage}
                totalItems={itemsCount || totalItems}
                itemsPerPage={itemsPerPage}
              />
            )}
            {loading ? (
              Array.from({ length: 1 }).map((_, index) => (
                <div key={`skeleton-${index}`}>{renderSkeletonItem()}</div>
              ))
            ) : error ? (
              <div className="text-red-500">
                Error loading items: {error.message}
              </div>
            ) : (
              items?.map((item) => (
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
                    <div className="text-xs text-muted-foreground">
                      SKU: {item.sku}
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
                          {item.formattedTotal}
                          {item.quantity > 1 && (
                            <span className="text-muted-foreground ml-1">
                              ({item.formattedUnitPrice} × {item.quantity})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
