"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Package, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { useState } from "react";

// Status configuration for styling
type BadgeColorType = "white" | "red" | "orange" | "amber" | "yellow" | "lime" | "green" | "emerald" | "teal" | "cyan" | "sky" | "blue" | "indigo" | "violet" | "purple" | "fuchsia" | "pink" | "rose" | "zinc" | undefined;

const statusConfig: Record<string, { color: BadgeColorType, label: string, icon: React.ReactNode }> = {
  pending: {
    color: "blue",
    label: "PENDING",
    icon: <Clock className="h-3 w-3" />
  },
  completed: {
    color: "emerald",
    label: "COMPLETED",
    icon: <CheckCircle className="h-3 w-3" />
  },
  archived: {
    color: "zinc",
    label: "ARCHIVED",
    icon: <Package className="h-3 w-3" />
  },
  canceled: {
    color: "rose",
    label: "CANCELED",
    icon: <XCircle className="h-3 w-3" />
  },
  requires_action: {
    color: "orange",
    label: "REQUIRES ACTION",
    icon: <RefreshCw className="h-3 w-3" />
  }
};

interface OrderItem {
  id: string;
  displayId: string;
  total: string;
  createdAt: string;
  itemCount: number;
  status?: string;
}

interface ModernOrderListProps {
  orders: OrderItem[];
  showPaymentButton?: boolean;
  onPayOrder?: (orderId: string) => void;
  paymentProcessing?: boolean;
}

export default function ModernOrderList({ 
  orders, 
  showPaymentButton = false, 
  onPayOrder, 
  paymentProcessing = false 
}: ModernOrderListProps) {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleExpanded = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No orders yet</h3>
        <p className="text-sm text-muted-foreground">
          Your recent orders will appear here once you start placing orders
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const isExpanded = expandedOrders.has(order.id);
        const status = order.status?.toLowerCase() || "completed";
        const statusInfo = statusConfig[status] || { 
          color: "zinc", 
          label: status.toUpperCase(), 
          icon: <Package className="h-3 w-3" /> 
        };

        return (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="font-semibold text-lg">
                      Order #{order.displayId}
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="flex items-center gap-1.5 text-xs font-medium px-2 py-1"
                    >
                      {statusInfo.icon}
                      {statusInfo.label}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className="text-xl font-bold">
                      {order.total}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {showPaymentButton && onPayOrder && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => onPayOrder(order.id)}
                        disabled={paymentProcessing}
                      >
                        {paymentProcessing ? 'Processing...' : 'Pay Now'}
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(order.id)}
                      className="flex items-center gap-1"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Hide
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Details
                        </>
                      )}
                    </Button>

                    <Link href={`/account/orders/details/${order.id}`}>
                      <Button variant="outline" size="sm">
                        View Order
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t bg-muted/20 -m-4 p-4 rounded-b-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-muted-foreground mb-1">Order Status</div>
                      <div className="flex items-center gap-2">
                        {statusInfo.icon}
                        {statusInfo.label}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground mb-1">Order Total</div>
                      <div className="font-semibold">{order.total}</div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground mb-1">Items</div>
                      <div>{order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Link href={`/account/orders/details/${order.id}`}>
                      <Button variant="outline" size="sm">
                        View Full Details
                      </Button>
                    </Link>
                    {showPaymentButton && onPayOrder && (
                      <Button
                        size="sm"
                        onClick={() => onPayOrder(order.id)}
                        disabled={paymentProcessing}
                      >
                        {paymentProcessing ? 'Processing Payment...' : 'Process Payment'}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}