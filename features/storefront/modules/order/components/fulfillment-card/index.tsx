"use client";

import React, { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  Package,
  Truck,
  CheckCircle,
  Clock,
} from "lucide-react";
import { StoreOrder } from "@/features/storefront/types/storefront";
import Divider from "@/features/storefront/modules/common/components/divider";

type FulfillmentCardProps = {
  order: StoreOrder & {
    unfulfilled?: Array<{
      id: string;
      quantity: number;
    }>;
    fulfillments?: Array<{
      id: string;
      createdAt: string;
      canceledAt?: string;
      fulfillmentItems?: Array<{
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
    }>;
    fulfillmentDetails?: any;
  };
};

const FulfillmentCard: React.FC<FulfillmentCardProps> = ({ order }) => {
  const [expandedFulfillments, setExpandedFulfillments] = useState<string[]>(
    []
  );

  if (!order.fulfillments || order.fulfillments.length === 0) {
    return (
      <div>
        <h2 className="flex flex-row text-3xl font-medium my-6">Fulfillment</h2>
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-sm font-medium">
              No fulfillment information available
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Your order is being processed
            </p>
          </div>
        </div>
        <Divider className="mt-8" />
      </div>
    );
  }

  const fulfillments = order.fulfillments;

  // Calculate fulfillment statistics
  const lineItemStats = fulfillments.reduce(
    (acc: any, fulfillment: any) => {
      if (!fulfillment.canceledAt && fulfillment.fulfillmentItems) {
        fulfillment.fulfillmentItems.forEach((item: any) => {
          acc.fulfilled += item.quantity;
        });
      }
      return acc;
    },
    { fulfilled: 0 }
  );

  const totalUnfulfilled = (order.unfulfilled || []).reduce(
    (sum: number, item: { quantity: number }) => sum + item.quantity,
    0
  );
  const total = totalUnfulfilled + lineItemStats.fulfilled;
  const fulfilledPercentage =
    total > 0 ? (lineItemStats.fulfilled / total) * 100 : 0;
  const openPercentage = 100 - fulfilledPercentage;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const toggleFulfillment = (id: string) => {
    setExpandedFulfillments((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  // Sort fulfillments by date (newest first)
  const sortedFulfillments = [...fulfillments].sort((a, b) => {
    if (a.canceledAt && !b.canceledAt) return 1;
    if (!a.canceledAt && b.canceledAt) return -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div>
      <h2 className="flex flex-row text-3xl font-medium my-6">Fulfillment</h2>

      {/* Progress bar section - similar to platform fulfill page */}
      <div className="border rounded-lg p-6 mb-6 bg-muted/10">
        <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground mb-4">
          Fulfillment Overview
        </h3>

        {/* Progress bar */}
        <div className="relative mb-4">
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${fulfilledPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <ul role="list" className="flex items-center justify-between">
          <li className="flex items-center space-x-2.5">
            <span className="flex w-0.5 h-8 bg-blue-500" aria-hidden={true} />
            <div className="space-y-0.5">
              <p className="text-sm text-muted-foreground">Fulfilled</p>
              <p className="font-semibold text-foreground">
                {lineItemStats.fulfilled}{" "}
                <span className="font-normal text-muted-foreground">
                  ({fulfilledPercentage.toFixed(1)}%)
                </span>
              </p>
            </div>
          </li>
          <li className="flex items-center space-x-2.5">
            <div className="space-y-0.5 text-right">
              <p className="text-sm text-muted-foreground">Open</p>
              <p className="font-semibold text-foreground">
                {totalUnfulfilled}{" "}
                <span className="font-normal text-muted-foreground">
                  ({openPercentage.toFixed(1)}%)
                </span>
              </p>
            </div>
            <span
              className="flex w-0.5 h-8 bg-gray-200 dark:bg-gray-800"
              aria-hidden={true}
            />
          </li>
        </ul>
      </div>

      {/* Fulfillment list */}
      <div className="space-y-4">
        {sortedFulfillments.map((fulfillment, index) => {
          const itemCount =
            fulfillment.fulfillmentItems?.reduce(
              (sum, item) => sum + item.quantity,
              0
            ) || 0;
          const hasTracking = fulfillment.shippingLabels?.[0]?.trackingNumber;

          return (
            <div
              key={fulfillment.id}
              className={`border rounded-lg overflow-hidden ${
                fulfillment.canceledAt
                  ? "opacity-60 border-destructive/50"
                  : "border-border"
              }`}
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleFulfillment(fulfillment.id)}
              >
                <div className="flex items-center gap-4">
                  {/* <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      fulfillment.canceledAt
                        ? "bg-destructive/10"
                        : hasTracking
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : "bg-green-100 dark:bg-green-900/30"
                    }`}
                  >
                    {fulfillment.canceledAt ? (
                      <Package className="h-5 w-5 text-destructive" />
                    ) : hasTracking ? (
                      <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    )}
                  </div> */}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        Shipment #{index + 1}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          fulfillment.canceledAt
                            ? "bg-destructive/10 text-destructive"
                            : hasTracking
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        }`}
                      >
                        {fulfillment.canceledAt
                          ? "Cancelled"
                          : hasTracking
                          ? "Shipped"
                          : "Fulfilled"}
                      </span>
                    </div>
                     <p className="text-sm text-muted-foreground mt-1">
                        {itemCount} item{itemCount !== 1 ? "s" : ""}
                      </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(fulfillment.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {expandedFulfillments.includes(fulfillment.id) ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded content */}
              {expandedFulfillments.includes(fulfillment.id) &&
                fulfillment.fulfillmentItems && (
                  <div className="border-t bg-muted/20">
                    {fulfillment.shippingLabels?.[0] && (
                      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/20 border-b">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              Tracking Information
                            </p>
                            <div className="mt-1 space-y-1">
                              {fulfillment.shippingLabels[0].carrier && (
                                <p className="text-xs text-slate-700 dark:text-slate-300">
                                  Carrier:{" "}
                                  <span className="font-medium">
                                    {fulfillment.shippingLabels[0].carrier.toUpperCase()}
                                  </span>
                                </p>
                              )}
                              {fulfillment.shippingLabels[0].trackingNumber && (
                                // <p className="text-xs text-slate-700 dark:text-slate-300 font-mono">
                                //   {fulfillment.shippingLabels[0].trackingNumber}
                                // </p>

                                <a
                                  href={
                                    fulfillment.shippingLabels[0].trackingUrl ||
                                    "#"
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                                >
                                  {fulfillment.shippingLabels[0].trackingNumber}

                                  <ArrowUpRight className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="px-4 py-3 space-y-3">
                      {fulfillment.fulfillmentItems.map((item) => (
                        <div key={item.id} className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                            {item.lineItem.thumbnail ? (
                              <img
                                src={item.lineItem.thumbnail}
                                alt={item.lineItem.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.lineItem.title}
                            </p>
                            {item.lineItem.variantTitle && (
                              <p className="text-xs text-muted-foreground">
                                {item.lineItem.variantTitle}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                Qty: {item.quantity}
                              </span>
                              {item.lineItem.sku && (
                                <span className="text-xs text-muted-foreground">
                                  • SKU: {item.lineItem.sku}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          );
        })}
      </div>

      <Divider className="mt-8" />
    </div>
  );
};

export default FulfillmentCard;
