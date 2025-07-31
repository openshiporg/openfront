"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Package, ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import { CreateReturnModal } from "./modals/CreateReturnModal";
import { updateReturnStatusAction } from "../actions/return-actions";
import { toast } from 'sonner';

interface ReturnsSectionProps {
  order: any;
  returns: any[];
  totalItems: number;
}

const returnStatusConfig = {
  requested: { 
    label: "Requested", 
    color: "yellow" as const, 
    icon: Clock,
    description: "Return has been requested by customer"
  },
  received: { 
    label: "Received", 
    color: "blue" as const, 
    icon: Package,
    description: "Return items have been received"
  },
  requires_action: { 
    label: "Requires Action", 
    color: "orange" as const, 
    icon: ArrowLeft,
    description: "Return requires manual review"
  },
  canceled: { 
    label: "Canceled", 
    color: "red" as const, 
    icon: XCircle,
    description: "Return has been canceled"
  },
};

const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount / 100);
};

export const ReturnsSection = ({ order, returns, totalItems }: ReturnsSectionProps) => {
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleStatusUpdate = async (returnId: string, newStatus: string) => {
    setIsUpdating(returnId);
    try {
      const response = await updateReturnStatusAction(returnId, newStatus);
      if (response.success) {
        toast.success("Return status updated successfully");
        // Optionally trigger a page refresh or update local state
        window.location.reload();
      } else {
        toast.error(response.error || "Failed to update return status");
      }
    } catch (error) {
      console.error('Error updating return status:', error);
      toast.error("Failed to update return status");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {returns.map((returnItem: any, index: number) => {
          const statusConfig = returnStatusConfig[returnItem.status as keyof typeof returnStatusConfig];
          const StatusIcon = statusConfig?.icon || Clock;
          
          return (
            <div key={returnItem.id} className="rounded-md border bg-background p-3 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        Return #{index + 1}
                      </span>
                      <Badge 
                        color={statusConfig?.color || "zinc"} 
                        className="text-xs"
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig?.label || returnItem.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {new Date(returnItem.createdAt).toLocaleDateString()}
                      </span>
                      {returnItem.refundAmount > 0 && (
                        <span>
                          {formatCurrency(returnItem.refundAmount, order.currency?.code)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  disabled={isUpdating === returnItem.id}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <MoreVertical className="h-3 w-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {returnItem.status === 'requested' && (
                        <>
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(returnItem.id, 'received')}
                          >
                            Mark as Received
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(returnItem.id, 'requires_action')}
                          >
                            Requires Action
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(returnItem.id, 'canceled')}
                            className="text-red-600"
                          >
                            Cancel Return
                          </DropdownMenuItem>
                        </>
                      )}
                      {returnItem.status === 'received' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(returnItem.id, 'requires_action')}
                        >
                          Requires Action
                        </DropdownMenuItem>
                      )}
                      {returnItem.status === 'requires_action' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(returnItem.id, 'received')}
                        >
                          Mark as Received
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Button>
              </div>
              
              {/* Simplified Status Display */}
              <div className="space-y-2 mb-3">
                <div className="text-xs text-muted-foreground">
                  Status: {statusConfig?.label || returnItem.status}
                </div>
              </div>
              
              {/* Return Items Summary */}
              {returnItem.returnItems && returnItem.returnItems.length > 0 && (
                <>
                  <Separator className="mb-2" />
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {returnItem.returnItems.length} Item{returnItem.returnItems.length !== 1 ? 's' : ''}
                    </span>
                    <div className="space-y-1">
                      {returnItem.returnItems.slice(0, 2).map((item: any) => (
                        <div key={item.id} className="text-xs">
                          <div className="truncate font-medium">
                            {item.lineItem?.title || 'Unknown Item'} 
                            {item.lineItem?.variantTitle && ` - ${item.lineItem.variantTitle}`}
                          </div>
                          <div className="text-muted-foreground">
                            {item.reason?.replace('_', ' ')} • Qty: {item.quantity}
                          </div>
                        </div>
                      ))}
                      {returnItem.returnItems.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{returnItem.returnItems.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      
      <CreateReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        order={order}
      />
    </>
  );
};