"use client";

import React, { useState } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronsUpDown, ArrowLeft, MoreVertical, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { updateReturnStatusAction } from "../actions/return-actions";
import { toast } from 'sonner';

interface ReturnsCollapsibleProps {
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

export const ReturnsCollapsible = ({
  order,
  returns,
  totalItems,
}: ReturnsCollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleStatusUpdate = async (returnId: string, newStatus: string) => {
    setIsUpdating(returnId);
    try {
      const response = await updateReturnStatusAction(returnId, newStatus);
      if (response.success) {
        toast.success("Return status updated successfully");
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

  const triggerClassName =
    "flex items-center rounded-sm shadow-sm uppercase tracking-wide border max-w-fit gap-2 text-nowrap pl-2.5 pr-1 py-[3px] text-sm font-medium text-green-500 bg-white border-green-200 hover:bg-green-100 hover:text-green-700 focus:z-10 focus:ring-2 focus:ring-green-700 focus:text-green-700 dark:bg-green-950 dark:border-green-900 dark:text-green-300 dark:hover:text-white dark:hover:bg-green-700 dark:focus:ring-green-500 dark:focus:text-white";

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex flex-col gap-2 py-3 px-4 md:px-6 bg-green-50/30 dark:bg-emerald-900/10 border-b"
    >
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild>
          <button type="button" className={triggerClassName}>
            {totalItems} Return{totalItems !== 1 ? "s" : ""}
            <ChevronsUpDown className="h-4 w-4" />
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        {isOpen && (
          <>
            {returns.map((returnItem: any, index: number) => {
              const statusConfig = returnStatusConfig[returnItem.status as keyof typeof returnStatusConfig];
              const StatusIcon = statusConfig?.icon || Clock;
              
              return (
                <div
                  key={returnItem.id}
                  className="border p-2 bg-background rounded-sm flex flex-col gap-4 relative"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-grow">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
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
                      <p className="text-xs text-muted-foreground">
                        {statusConfig?.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Created: {new Date(returnItem.createdAt).toLocaleDateString()}
                        </span>
                        <span>
                          Refund: {formatCurrency(returnItem.refundAmount || 0, order.currency?.code)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-1 flex-shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            disabled={isUpdating === returnItem.id}
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
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
                    </div>
                  </div>
                  
                  {/* Return Items Summary */}
                  {returnItem.returnItems && returnItem.returnItems.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Item{returnItem.returnItems.length !== 1 ? 's' : ''} ({returnItem.returnItems.length})
                        </span>
                        <div className="grid grid-cols-1 gap-2">
                          {returnItem.returnItems.slice(0, 3).map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between text-xs">
                              <span className="truncate flex-1">
                                {item.lineItem?.title || 'Unknown Item'} 
                                {item.lineItem?.variantTitle && ` - ${item.lineItem.variantTitle}`}
                              </span>
                              <span className="text-muted-foreground ml-2">
                                Qty: {item.quantity}
                              </span>
                            </div>
                          ))}
                          {returnItem.returnItems.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{returnItem.returnItems.length - 3} more item{returnItem.returnItems.length - 3 !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};