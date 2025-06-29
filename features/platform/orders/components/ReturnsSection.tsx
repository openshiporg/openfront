"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  returns?: any[];
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

export const ReturnsSection = ({ order, returns = [] }: ReturnsSectionProps) => {
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

  const canCreateReturn = order?.status !== 'canceled' && order?.lineItems?.length > 0;
  const hasReturns = returns && returns.length > 0;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-medium">Returns</CardTitle>
          {canCreateReturn && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReturnModalOpen(true)}
              className="h-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Create Return
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!hasReturns ? (
            <div className="text-center py-6">
              <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No returns have been created for this order
              </p>
              {canCreateReturn && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReturnModalOpen(true)}
                  className="mt-3"
                >
                  Create First Return
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {returns.map((returnItem: any, index: number) => {
                const statusConfig = returnStatusConfig[returnItem.status as keyof typeof returnStatusConfig];
                const StatusIcon = statusConfig?.icon || Clock;
                
                return (
                  <div key={returnItem.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
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
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Return #{index + 1}
                        </span>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
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
            </div>
          )}
        </CardContent>
      </Card>
      
      <CreateReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        order={order}
      />
    </>
  );
};