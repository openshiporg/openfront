'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronUp, ChevronDown, Package, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
// Local types for FulfillmentHistory component
interface FulfillmentHistoryOrder {
  id: string;
  unfulfilled?: Array<{
    id: string;
    quantity: number;
  }>;
}

interface FulfillmentHistoryFulfillment {
  id: string;
  createdAt: string;
  canceledAt?: string;
  items?: Array<{
    id: string;
    quantity: number;
    lineItem: {
      title: string;
      variantTitle?: string;
      sku?: string;
      thumbnail?: string;
      formattedUnitPrice: string;
    };
  }>;
  shippingLabels?: Array<{
    id: string;
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    labelUrl?: string;
  }>;
}

interface FulfillmentHistoryProps {
  fulfillments: FulfillmentHistoryFulfillment[];
  order: FulfillmentHistoryOrder;
  onDelete: (id: string) => void;
}
import { cn } from '@/lib/utils';
import { badgeVariants } from '@/components/ui/badge-button';

export function FulfillmentHistory({
  fulfillments,
  order,
  onDelete,
}: FulfillmentHistoryProps) {
  const [expandedFulfillments, setExpandedFulfillments] = useState<string[]>(
    []
  );

  // Calculate total line items and their statuses
  const lineItemStats = fulfillments.reduce(
    (acc: any, fulfillment: any) => {
      if (!fulfillment.canceledAt && fulfillment.items) {
        fulfillment.items.forEach((item: any) => {
          acc.fulfilled += item.quantity;
        });
      }
      return acc;
    },
    { fulfilled: 0 }
  );

  // Calculate totals from unfulfilled items
  const totalUnfulfilled = (order.unfulfilled || []).reduce(
    (sum: number, item: { quantity: number }) => sum + item.quantity,
    0
  );
  const total = totalUnfulfilled + lineItemStats.fulfilled;
  const fulfilledPercentage = (lineItemStats.fulfilled / total) * 100;
  const openPercentage = 100 - fulfilledPercentage;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Filter fulfillments based on search and sort by status and date
  const filteredFulfillments = fulfillments
    .sort((a: any, b: any) => {
      // First sort by canceled status
      if (a.canceledAt && !b.canceledAt) return 1;
      if (!a.canceledAt && b.canceledAt) return -1;
      
      // Then sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const toggleFulfillment = (id: string) => {
    setExpandedFulfillments((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  const renderFulfillmentItems = (items: Array<{
    id: string;
    quantity: number;
    lineItem: {
      title: string;
      variantTitle?: string;
      sku?: string;
      thumbnail?: string;
      formattedUnitPrice: string;
    };
  }>) => {
    return items.map((item) => (
      <div
        key={item.id}
        className="flex items-start space-x-4 border-t first:border-t-0 p-2"
      >
        <div className="h-16 w-16 bg-muted/10 rounded-md flex-shrink-0 flex items-center justify-center">
          {item.lineItem.thumbnail ? (
            <Image
              src={item.lineItem.thumbnail}
              alt={item.lineItem.title}
              width={64}
              height={64}
              className="object-cover rounded-md"
            />
          ) : (
            <Package className="h-8 w-8 text-muted-foreground/50" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h4 className="font-medium text-sm">{item.lineItem.title}</h4>
              {item.lineItem.variantTitle && (
                <p className="text-xs text-muted-foreground mb-1">
                  {item.lineItem.variantTitle}
                </p>
              )}
              <div className="flex items-center gap-2">
                {item.lineItem.sku && (
                  <p className="text-xs text-muted-foreground">
                    SKU: {item.lineItem.sku}
                  </p>
                )}
                <div
                  className={cn(
                    badgeVariants({ color: 'blue' }),
                    'border py-0 text-[11px] uppercase font-medium tracking-wide rounded-full'
                  )}
                >
                  {item.quantity} Fulfilled
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium mt-0.5">
                {item.quantity} × {item.lineItem.formattedUnitPrice}
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <Card className="sm:mx-auto bg-muted/10">
      <div className="p-6">
        <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
          Fulfillment overview
        </h3>
        <div className="relative mt-6">
          <Progress
            value={fulfilledPercentage}
            className="h-2 [&>div]:bg-blue-500"
          />
        </div>
        <ul role="list" className="mt-4 flex items-center justify-between">
          <li className="flex space-x-2.5">
            <span className="flex w-0.5 bg-blue-500" aria-hidden={true} />
            <div className="space-y-0.5">
              <p className="text-sm text-muted-foreground">Fulfilled</p>
              <p className="font-semibold text-gray-900 dark:text-gray-50">
                {lineItemStats.fulfilled}{' '}
                <span className="font-normal text-muted-foreground">
                  ({fulfilledPercentage.toFixed(1)}%)
                </span>
              </p>
            </div>
          </li>
          <li className="flex space-x-2.5">
            <div className="space-y-0.5 text-right">
              <p className="text-sm text-muted-foreground">Open</p>
              <p className="font-semibold text-gray-900 dark:text-gray-50">
                {totalUnfulfilled}{' '}
                <span className="font-normal text-muted-foreground">
                  ({openPercentage.toFixed(1)}%)
                </span>
              </p>
            </div>
            <span
              className="flex w-0.5 bg-gray-200 dark:bg-gray-800"
              aria-hidden={true}
            />
          </li>
        </ul>

        <div className="mt-6 space-y-1">
          <div className="hidden sm:flex items-center justify-between px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <div className="w-[40%]">Fulfillments</div>
            <div className="w-[35%] text-left pl-4">Created</div>
            <div className="w-[25%] text-right">Actions</div>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredFulfillments.map((fulfillment) => (
              <div 
                key={fulfillment.id} 
                className={cn(
                  'py-2 transition-opacity duration-200',
                  fulfillment.canceledAt && !expandedFulfillments.includes(fulfillment.id) && 'opacity-50 hover:opacity-100'
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 gap-2 sm:gap-0">
                  <div className="flex flex-col sm:flex-row sm:items-center w-full sm:w-[40%]">
                    <div className="hidden sm:flex sm:items-center sm:mr-2 flex-shrink-0">
                      <Button
                        variant={fulfillment.canceledAt ? "destructive" : "default"}
                        size="sm"
                        onClick={() => toggleFulfillment(fulfillment.id)}
                        className="shadow-none rounded-sm h-5 w-10 text-xs flex items-center gap-1.5 p-0"
                      >
                        {fulfillment.items?.reduce(
                          (sum: number, item: { quantity: number }) => sum + item.quantity,
                          0
                        ) || 0}
                        {expandedFulfillments.includes(fulfillment.id) ? (
                          <ChevronUp className="size-3" />
                        ) : (
                          <ChevronDown className="size-3" />
                        )}
                      </Button>
                    </div>
                    <div className="space-y-0.5 sm:space-y-0 w-full min-w-0">
                      <div className="flex sm:hidden text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        ID
                      </div>
                      <div className="flex items-center justify-between sm:justify-start w-full gap-2">
                        <div className="min-w-0 flex-1">
                          <Link 
                            href={`/dashboard/fulfillments/${fulfillment.id}`}
                            className="text-muted-foreground hover:underline text-sm font-medium truncate block"
                          >
                            {fulfillment.id}
                          </Link>
                        </div>
                        <Button
                          variant={fulfillment.canceledAt ? "destructive" : "default"}
                          size="sm"
                          onClick={() => toggleFulfillment(fulfillment.id)}
                          className="sm:hidden shadow-none rounded-sm h-5 w-10 text-xs flex items-center gap-1.5 p-0 flex-shrink-0"
                        >
                          {fulfillment.items?.reduce(
                            (sum: number, item: { quantity: number }) => sum + item.quantity,
                            0
                          ) || 0}
                          {expandedFulfillments.includes(fulfillment.id) ? (
                            <ChevronUp className="size-3" />
                          ) : (
                            <ChevronDown className="size-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-0.5 sm:space-y-0 w-full sm:w-[35%]">
                    <div className="flex sm:hidden text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Created
                    </div>
                    <div className="text-left text-sm text-foreground/70 sm:pl-4">
                      {formatDate(fulfillment.createdAt.toString())}
                    </div>
                  </div>
                  <div className="space-y-0.5 sm:space-y-0 w-full sm:w-[25%]">
                    <div className="flex sm:hidden text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Actions
                    </div>
                    <div className="flex items-center sm:justify-end gap-4">
                      {!fulfillment.canceledAt ? (
                        <>
                          <Popover>
                            <PopoverTrigger asChild>
                              <span className="cursor-pointer text-muted-foreground font-medium text-sm h-auto p-0">
                                Cancel
                              </span>
                            </PopoverTrigger>
                            <PopoverContent className="w-[250px] p-3" side="left">
                              <div className="space-y-2.5">
                                <div className="space-y-1">
                                  <p className="text-[13px] font-medium">
                                    Cancel fulfillment?
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    This action cannot be undone.
                                  </p>
                                </div>
                                <div className="flex justify-end">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-6 text-xs"
                                    onClick={() => onDelete(fulfillment.id)}
                                  >
                                    Cancel fulfillment
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                          {fulfillment.shippingLabels?.[0] && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <span className="cursor-pointer font-medium text-sm h-auto p-0 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                                  Label
                                </span>
                              </PopoverTrigger>
                              <PopoverContent className="w-[280px] p-3" side="left">
                                <div className="space-y-2.5">
                                  <div className="space-y-1">
                                    <p className="text-[13px] font-medium">
                                      Shipping Label
                                    </p>
                                    {fulfillment.shippingLabels[0].carrier && (
                                      <p className="text-xs text-muted-foreground">
                                        Carrier: <span className="font-medium">{fulfillment.shippingLabels[0].carrier.toUpperCase()}</span>
                                      </p>
                                    )}
                                    {fulfillment.shippingLabels[0].trackingNumber && (
                                      <p className="text-xs text-muted-foreground break-all">
                                        Tracking: <span className="font-medium">{fulfillment.shippingLabels[0].trackingNumber}</span>
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    {fulfillment.shippingLabels[0].trackingUrl && (
                                      <Link
                                        href={fulfillment.shippingLabels[0].trackingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-indigo-500 hover:text-indigo-600 flex items-center gap-1"
                                      >
                                        Track Package <ArrowUpRight className="h-3 w-3" />
                                      </Link>
                                    )}
                                    {fulfillment.shippingLabels[0].labelUrl && (
                                      <Link
                                        href={fulfillment.shippingLabels[0].labelUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center rounded-md text-xs font-medium h-7 px-3 bg-primary text-primary-foreground hover:bg-primary/90"
                                      >
                                        Download Label
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-destructive font-medium">
                            Cancelled
                          </span>
                          {fulfillment.shippingLabels?.[0] && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <span className="cursor-pointer text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm h-auto p-0">
                                  Label
                                </span>
                              </PopoverTrigger>
                              <PopoverContent className="w-[280px] p-3" side="left">
                                <div className="space-y-2.5">
                                  <div className="space-y-1">
                                    <p className="text-[13px] font-medium">
                                      Cancelled Shipping Label
                                    </p>
                                    {fulfillment.shippingLabels[0].carrier && (
                                      <p className="text-xs text-muted-foreground">
                                        Carrier: <span className="font-medium">{fulfillment.shippingLabels[0].carrier.toUpperCase()}</span>
                                      </p>
                                    )}
                                    {fulfillment.shippingLabels[0].trackingNumber && (
                                      <p className="text-xs text-muted-foreground break-all">
                                        Tracking: <span className="font-medium">{fulfillment.shippingLabels[0].trackingNumber}</span>
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    This label has been cancelled and is no longer valid.
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {expandedFulfillments.includes(fulfillment.id) && (
                  <div className="bg-muted/40 rounded-md border shadow-inner mt-4">
                    {renderFulfillmentItems(fulfillment.items || [])}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}