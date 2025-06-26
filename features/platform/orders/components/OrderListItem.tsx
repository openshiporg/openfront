"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

// Status configuration for styling
type BadgeColorType = "white" | "red" | "orange" | "amber" | "yellow" | "lime" | "green" | "emerald" | "teal" | "cyan" | "sky" | "blue" | "indigo" | "violet" | "purple" | "fuchsia" | "pink" | "rose" | "zinc" | undefined;

const statusConfig: Record<string, { color: BadgeColorType, label: string }> = {
  pending: {
    color: "blue",
    label: "PENDING"
  },
  completed: {
    color: "emerald",
    label: "COMPLETED"
  },
  archived: {
    color: "zinc",
    label: "ARCHIVED"
  },
  canceled: {
    color: "rose",
    label: "CANCELED"
  },
  requires_action: {
    color: "orange",
    label: "REQUIRES ACTION"
  }
};

interface OrderListItemProps {
  order: {
    id: string;
    displayId: string;
    status: string;
    createdAt: string;
    total: string;
    user?: {
      id: string;
      name?: string;
      email: string;
    };
    shippingAddress?: {
      firstName: string;
      lastName: string;
      address1: string;
      address2?: string;
      city: string;
      province: string;
      postalCode: string;
      phone?: string;
    };
    lineItems?: Array<{
      id: string;
      title: string;
      quantity: number;
      unitPrice?: number | string;
      sku?: string;
      thumbnail?: string;
      variant?: {
        id: string;
        title: string;
        sku: string;
        product: {
          id: string;
          title: string;
        }
      };
    }>;
  };
}

export function OrderListItem({ order }: OrderListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = order.status?.toLowerCase() || "pending";
  const statusInfo = statusConfig[status] || { color: "zinc", label: status.toUpperCase() };

  return (
    <div className="border-b">
      <div className="px-4 md:px-6 py-4 hover:bg-muted/40 transition-colors">
        <div className="flex justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/platform/orders/${order.id}`}
                className="text-lg font-medium hover:text-blue-600 dark:hover:text-blue-400"
              >
                #{order.displayId}
              </Link>
              <Badge color={statusInfo.color} className="uppercase text-xs">
                {statusInfo.label}
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground mt-1">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
              {order.user && (
                <span className="ml-2">
                  • {order.user.name || order.user.email}
                </span>
              )}
            </div>

            {order.shippingAddress && (
              <div className="text-sm text-muted-foreground mt-2">
                <p>
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && (
                  <p>{order.shippingAddress.address2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
                  {order.shippingAddress.postalCode}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end">
            <div className="text-lg font-medium">
              {order.total}
            </div>
            <div className="text-sm text-muted-foreground">
              {order.lineItems?.length || 0} items
            </div>
            <div className="mt-auto flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Hide Items
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show Items
                  </>
                )}
              </Button>
              <Link href={`/dashboard/platform/orders/${order.id}`}>
                <Button variant="outline" size="sm" className="mt-2">
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded line items */}
      {isExpanded && order.lineItems && order.lineItems.length > 0 && (
        <div className="bg-muted/30 px-4 md:px-6 py-3 border-t">
          <h4 className="text-sm font-medium mb-2">Order Items</h4>
          <div className="space-y-3">
            {order.lineItems.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                {item.thumbnail && (
                  <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-gray-100">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  {item.variant ? (
                    <div className="text-xs text-muted-foreground">
                      {item.variant.product?.title} - {item.variant.title}
                    </div>
                  ) : null}
                  <div className="text-sm">
                    {item.quantity}x
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {item.unitPrice
                      ? (typeof item.unitPrice === 'number'
                          ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.unitPrice * item.quantity / 100)
                          : String(item.unitPrice))
                      : ''}
                  </div>
                  {item.variant?.sku && (
                    <div className="text-xs text-muted-foreground">SKU: {item.variant.sku}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}