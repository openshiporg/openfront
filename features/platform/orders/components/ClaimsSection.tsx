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
import { MoreVertical, AlertTriangle, DollarSign, Package2, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import { updateClaimStatusAction } from "../actions/claim-actions";
import { toast } from 'sonner';

interface ClaimsSectionProps {
  order: any;
  claims: any[];
  totalItems: number;
}

const claimStatusConfig = {
  // Payment Status
  na: { 
    label: "N/A", 
    color: "zinc" as const, 
    icon: Clock,
    description: "No payment action required"
  },
  not_refunded: { 
    label: "Not Refunded", 
    color: "yellow" as const, 
    icon: DollarSign,
    description: "Refund pending"
  },
  refunded: { 
    label: "Refunded", 
    color: "green" as const, 
    icon: CheckCircle,
    description: "Refund has been processed"
  },
  
  // Fulfillment Status
  not_fulfilled: { 
    label: "Not Fulfilled", 
    color: "yellow" as const, 
    icon: Package2,
    description: "Replacement items not yet fulfilled"
  },
  partially_fulfilled: { 
    label: "Partially Fulfilled", 
    color: "blue" as const, 
    icon: Package2,
    description: "Some replacement items fulfilled"
  },
  fulfilled: { 
    label: "Fulfilled", 
    color: "green" as const, 
    icon: CheckCircle,
    description: "All replacement items fulfilled"
  },
  shipped: { 
    label: "Shipped", 
    color: "green" as const, 
    icon: Package2,
    description: "Replacement items have been shipped"
  },
  canceled: { 
    label: "Canceled", 
    color: "red" as const, 
    icon: XCircle,
    description: "Claim has been canceled"
  },
};

const claimTypeConfig = {
  refund: {
    label: "Refund",
    color: "blue" as const,
    icon: DollarSign,
    description: "Customer will receive a refund"
  },
  replace: {
    label: "Replace",
    color: "green" as const,
    icon: Package2,
    description: "Customer will receive replacement items"
  },
};

const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount / 100);
};

export const ClaimsSection = ({ order, claims, totalItems }: ClaimsSectionProps) => {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [editClaimId, setEditClaimId] = useState<string>('');
  const [editClaimOpen, setEditClaimOpen] = useState(false);

  const handleStatusUpdate = async (claimId: string, statusType: 'payment' | 'fulfillment', newStatus: string) => {
    setIsUpdating(claimId);
    try {
      const response = await updateClaimStatusAction(claimId, statusType, newStatus);
      if (response.success) {
        toast.success(`Claim ${statusType} status updated successfully`);
        // Optionally trigger a page refresh or update local state
        window.location.reload();
      } else {
        toast.error(response.error || "Failed to update claim status");
      }
    } catch (error) {
      console.error('Error updating claim status:', error);
      toast.error("Failed to update claim status");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleEditClaim = (claimId: string) => {
    setEditClaimId(claimId);
    setEditClaimOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {claims.map((claim: any, index: number) => {
          const typeConfig = claimTypeConfig[claim.type as keyof typeof claimTypeConfig];
          const paymentStatusConfig = claimStatusConfig[claim.paymentStatus as keyof typeof claimStatusConfig];
          const fulfillmentStatusConfig = claimStatusConfig[claim.fulfillmentStatus as keyof typeof claimStatusConfig];
          
          const TypeIcon = typeConfig?.icon || AlertTriangle;
          
          return (
            <div key={claim.id} className="rounded-md border bg-background p-3 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Claim #{index + 1}
                      </span>
                      <Badge 
                        color={typeConfig?.color || "zinc"} 
                        className="text-xs"
                      >
                        <TypeIcon className="h-3 w-3 mr-1" />
                        {typeConfig?.label || claim.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </span>
                      {claim.refundAmount > 0 && (
                        <span>
                          {formatCurrency(claim.refundAmount, order.currency?.code)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      disabled={isUpdating === claim.id}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* Payment Status Updates */}
                      {claim.type === 'refund' && claim.paymentStatus === 'not_refunded' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(claim.id, 'payment', 'refunded')}
                        >
                          Mark as Refunded
                        </DropdownMenuItem>
                      )}
                      
                      {/* Fulfillment Status Updates */}
                      {claim.type === 'replace' && claim.fulfillmentStatus === 'not_fulfilled' && (
                        <>
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(claim.id, 'fulfillment', 'partially_fulfilled')}
                          >
                            Mark Partially Fulfilled
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(claim.id, 'fulfillment', 'fulfilled')}
                          >
                            Mark Fulfilled
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {claim.type === 'replace' && claim.fulfillmentStatus === 'fulfilled' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(claim.id, 'fulfillment', 'shipped')}
                        >
                          Mark as Shipped
                        </DropdownMenuItem>
                      )}
                      
                      {claim.type === 'replace' && claim.fulfillmentStatus === 'partially_fulfilled' && (
                        <>
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(claim.id, 'fulfillment', 'fulfilled')}
                          >
                            Mark Fully Fulfilled
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(claim.id, 'fulfillment', 'shipped')}
                          >
                            Mark as Shipped
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {/* General Actions */}
                      <DropdownMenuItem onClick={() => handleEditClaim(claim.id)}>
                        Edit Claim
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleStatusUpdate(claim.id, 'fulfillment', 'canceled')}
                        className="text-red-600"
                      >
                        Cancel Claim
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Status Display */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  {claim.type === 'refund' ? (
                    <>Payment: {paymentStatusConfig?.label || claim.paymentStatus}</>
                  ) : (
                    <>
                      Fulfillment: {fulfillmentStatusConfig?.label || claim.fulfillmentStatus}
                      {paymentStatusConfig && paymentStatusConfig.label !== 'N/A' && (
                        <> • Payment: {paymentStatusConfig.label}</>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {/* Claim Items Summary */}
              {claim.claimItems && claim.claimItems.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {claim.claimItems.length} Item{claim.claimItems.length !== 1 ? 's' : ''}
                    </span>
                    <div className="space-y-1">
                      {claim.claimItems.slice(0, 2).map((item: any) => (
                        <div key={item.id} className="text-xs">
                          <div className="truncate font-medium">
                            {item.lineItem?.title || 'Unknown Item'} 
                            {item.lineItem?.variantData?.title && ` - ${item.lineItem.variantData.title}`}
                          </div>
                          <div className="text-muted-foreground">
                            {item.reason?.replace('_', ' ')} • Qty: {item.quantity}
                          </div>
                        </div>
                      ))}
                      {claim.claimItems.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{claim.claimItems.length - 2} more
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

      {/* Edit Claim Drawer */}
      {editClaimId && (
        <EditItemDrawerClientWrapper
          listKey="claim-orders"
          itemId={editClaimId}
          open={editClaimOpen}
          onClose={() => {
            setEditClaimOpen(false);
            setEditClaimId('');
          }}
        />
      )}
    </>
  );
};